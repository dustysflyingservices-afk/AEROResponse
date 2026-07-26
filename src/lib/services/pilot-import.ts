import { prisma } from "@/lib/db/prisma";

export interface RosterRow {
  [header: string]: unknown;
}

export interface ImportRowError {
  row: number;
  message: string;
}

export interface ImportSummary {
  pilotsCreated: number;
  pilotsMatched: number;
  aircraftCreated: number;
  aircraftUpdated: number;
  rowsSkipped: number;
  errors: ImportRowError[];
}

interface NormalizedRow {
  rowNumber: number;
  pilotName: string;
  email: string | null;
  phone: string | null;
  nNumber: string | null;
  makeModel: string | null;
  homeBaseAirport: string | null;
}

// Maps many possible spreadsheet header spellings to our canonical field names.
// Headers are compared after lowercasing and stripping non-alphanumeric chars,
// so "N-Number", "n number", and "N_Number" all match "nnumber".
const HEADER_ALIASES: Record<string, string[]> = {
  pilotName: ["pilotname", "name", "pilot"],
  email: ["email", "emailaddress", "e-mail"],
  phone: ["phone", "phonenumber", "cell", "mobile", "cellphone"],
  nNumber: ["nnumber", "tailnumber", "registration", "regnumber", "n"],
  makeModel: [
    "aircraftmakemodel",
    "makemodel",
    "aircraftmake",
    "aircrafttype",
    "aircraft",
    "makemodeltype",
  ],
  homeBaseAirport: ["homebaseairport", "homebase", "baseairport", "base", "airport"],
};

function normalizeHeaderKey(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function buildHeaderMap(sampleRow: RosterRow): Record<string, string> {
  const map: Record<string, string> = {};
  const normalizedHeaders = Object.keys(sampleRow).map((header) => ({
    original: header,
    normalized: normalizeHeaderKey(header),
  }));

  for (const [canonicalField, aliases] of Object.entries(HEADER_ALIASES)) {
    const match = normalizedHeaders.find((header) =>
      aliases.includes(header.normalized)
    );
    if (match) {
      map[canonicalField] = match.original;
    }
  }

  return map;
}

function readCell(row: RosterRow, header: string | undefined): string | null {
  if (!header) {
    return null;
  }
  const value = row[header];
  if (value === null || value === undefined) {
    return null;
  }
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function normalizeRows(rows: RosterRow[]): {
  normalized: NormalizedRow[];
  errors: ImportRowError[];
} {
  const errors: ImportRowError[] = [];
  const normalized: NormalizedRow[] = [];

  if (rows.length === 0) {
    return { normalized, errors };
  }

  const headerMap = buildHeaderMap(rows[0]);

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // account for header row + 1-indexing
    const pilotName = readCell(row, headerMap.pilotName);

    if (!pilotName) {
      errors.push({ row: rowNumber, message: "Missing pilot name; row skipped." });
      return;
    }

    normalized.push({
      rowNumber,
      pilotName,
      email: readCell(row, headerMap.email)?.toLowerCase() ?? null,
      phone: readCell(row, headerMap.phone),
      nNumber: readCell(row, headerMap.nNumber)?.toUpperCase() ?? null,
      makeModel: readCell(row, headerMap.makeModel),
      homeBaseAirport: readCell(row, headerMap.homeBaseAirport),
    });
  });

  return { normalized, errors };
}

/**
 * Imports a volunteer pilot roster from parsed spreadsheet rows.
 *
 * Dedup rule: a pilot is matched first by email (case-insensitive), then by
 * exact case-insensitive name if no email is present. This means a pilot who
 * owns multiple aircraft - one row per aircraft in the source spreadsheet -
 * ends up as a single Pilot record with multiple linked Aircraft records,
 * rather than a duplicated pilot per row.
 */
export async function importPilotRoster(rows: RosterRow[]): Promise<ImportSummary> {
  const { normalized, errors } = normalizeRows(rows);

  const summary: ImportSummary = {
    pilotsCreated: 0,
    pilotsMatched: 0,
    aircraftCreated: 0,
    aircraftUpdated: 0,
    rowsSkipped: 0,
    errors: [...errors],
  };

  // In-batch dedup keys, populated as we go so later rows in the same
  // spreadsheet can match pilots created earlier in this same import.
  const pilotIdByEmail = new Map<string, string>();
  const pilotIdByName = new Map<string, string>();

  for (const row of normalized) {
    try {
      let pilotId: string | null = null;

      if (row.email) {
        pilotId =
          pilotIdByEmail.get(row.email) ??
          (await prisma.pilot.findUnique({ where: { email: row.email } }))?.id ??
          null;
      }

      if (!pilotId) {
        const nameKey = row.pilotName.trim().toLowerCase();
        pilotId = pilotIdByName.get(nameKey) ?? null;

        if (!pilotId && !row.email) {
          const existingByName = await prisma.pilot.findFirst({
            where: { name: { equals: row.pilotName, mode: "insensitive" } },
          });
          pilotId = existingByName?.id ?? null;
        }
      }

      if (pilotId) {
        summary.pilotsMatched += 1;
      } else {
        const created = await prisma.pilot.create({
          data: {
            name: row.pilotName,
            email: row.email,
            phone: row.phone,
          },
        });
        pilotId = created.id;
        summary.pilotsCreated += 1;
      }

      pilotIdByName.set(row.pilotName.trim().toLowerCase(), pilotId);
      if (row.email) {
        pilotIdByEmail.set(row.email, pilotId);
      }

      if (!row.nNumber) {
        // Pilot with no aircraft on this row (or a row that's pilot-info-only).
        continue;
      }

      const existingAircraft = await prisma.aircraft.findUnique({
        where: { nNumber: row.nNumber },
      });

      if (existingAircraft) {
        await prisma.aircraft.update({
          where: { nNumber: row.nNumber },
          data: {
            makeModel: row.makeModel ?? existingAircraft.makeModel,
            homeBaseAirport: row.homeBaseAirport ?? existingAircraft.homeBaseAirport,
            pilotId,
          },
        });
        summary.aircraftUpdated += 1;
      } else {
        if (!row.makeModel) {
          summary.errors.push({
            row: row.rowNumber,
            message: `Aircraft ${row.nNumber} has no make/model; aircraft skipped (pilot still imported).`,
          });
          continue;
        }

        await prisma.aircraft.create({
          data: {
            nNumber: row.nNumber,
            makeModel: row.makeModel,
            homeBaseAirport: row.homeBaseAirport,
            pilotId,
          },
        });
        summary.aircraftCreated += 1;
      }
    } catch (error) {
      summary.rowsSkipped += 1;
      summary.errors.push({
        row: row.rowNumber,
        message: error instanceof Error ? error.message : "Unknown error processing row.",
      });
    }
  }

  return summary;
}
