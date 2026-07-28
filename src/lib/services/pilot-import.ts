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
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  street1: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  picTotalTime: string | null;
  airmenRatings: string | null;
  motivation: string | null;
  makeModel: string | null;
  nNumber: string | null;
  homeBaseAirport: string | null;
}

// Maps many possible spreadsheet header spellings to our canonical field
// names, matching both the Volunteer Pilot Interest Form's wording and
// common variants. Headers are compared after lowercasing and stripping
// non-alphanumeric characters.
const HEADER_ALIASES: Record<string, string[]> = {
  firstName: ["firstname", "first"],
  lastName: ["lastname", "last"],
  fullName: ["name", "pilotname", "fullname", "pilot"],
  email: ["email", "emailaddress", "e-mail"],
  phone: ["phone", "phonenumber", "cell", "mobile", "cellphone"],
  street1: ["streetaddress", "address", "street"],
  city: ["city"],
  state: ["state", "stateprovince", "province"],
  zipCode: ["postalzipcode", "zipcode", "zip", "postalcode"],
  picTotalTime: ["pictotaltime", "totaltime", "flighttime"],
  airmenRatings: ["airmenratings", "ratings", "qualifications", "certifications"],
  motivation: [
    "whatmotivatesyoutovolunteerwithourorganization",
    "motivation",
    "whyvolunteer",
  ],
  makeModel: ["aircrafttype", "aircraft", "aircraftmakemodel", "makemodel"],
  nNumber: ["nnumber", "tailnumber", "registration", "regnumber"],
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
    const match = normalizedHeaders.find((header) => aliases.includes(header.normalized));
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

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
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

    let firstName = readCell(row, headerMap.firstName);
    let lastName = readCell(row, headerMap.lastName);

    if (!firstName && !lastName) {
      const fullName = readCell(row, headerMap.fullName);
      if (fullName) {
        const split = splitFullName(fullName);
        firstName = split.firstName;
        lastName = split.lastName;
      }
    }

    if (!firstName) {
      errors.push({ row: rowNumber, message: "Missing pilot name; row skipped." });
      return;
    }

    normalized.push({
      rowNumber,
      firstName,
      lastName: lastName ?? "",
      email: readCell(row, headerMap.email)?.toLowerCase() ?? null,
      phone: readCell(row, headerMap.phone),
      street1: readCell(row, headerMap.street1),
      city: readCell(row, headerMap.city),
      state: readCell(row, headerMap.state),
      zipCode: readCell(row, headerMap.zipCode),
      picTotalTime: readCell(row, headerMap.picTotalTime),
      airmenRatings: readCell(row, headerMap.airmenRatings),
      motivation: readCell(row, headerMap.motivation),
      makeModel: readCell(row, headerMap.makeModel),
      nNumber: readCell(row, headerMap.nNumber)?.toUpperCase() ?? null,
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
 * rather than a duplicated pilot per row. Aircraft with an N-Number are
 * upserted by tail number; aircraft without one are always created fresh,
 * since there's no reliable key to match them on.
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

      const nameKey = `${row.firstName} ${row.lastName}`.trim().toLowerCase();

      if (!pilotId) {
        pilotId = pilotIdByName.get(nameKey) ?? null;

        if (!pilotId && !row.email) {
          const existingByName = await prisma.pilot.findFirst({
            where: {
              firstName: { equals: row.firstName, mode: "insensitive" },
              lastName: { equals: row.lastName, mode: "insensitive" },
            },
          });
          pilotId = existingByName?.id ?? null;
        }
      }

      if (pilotId) {
        summary.pilotsMatched += 1;
        await prisma.pilot.update({
          where: { id: pilotId },
          data: {
            phone: row.phone ?? undefined,
            street1: row.street1 ?? undefined,
            city: row.city ?? undefined,
            state: row.state ?? undefined,
            zipCode: row.zipCode ?? undefined,
            picTotalTime: row.picTotalTime ?? undefined,
            airmenRatings: row.airmenRatings ?? undefined,
            motivation: row.motivation ?? undefined,
          },
        });
      } else {
        const created = await prisma.pilot.create({
          data: {
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            phone: row.phone,
            street1: row.street1,
            city: row.city,
            state: row.state,
            zipCode: row.zipCode,
            picTotalTime: row.picTotalTime,
            airmenRatings: row.airmenRatings,
            motivation: row.motivation,
          },
        });
        pilotId = created.id;
        summary.pilotsCreated += 1;
      }

      pilotIdByName.set(nameKey, pilotId);
      if (row.email) {
        pilotIdByEmail.set(row.email, pilotId);
      }

      if (!row.makeModel) {
        // Pilot-only row (no aircraft info) - nothing further to do.
        continue;
      }

      if (row.nNumber) {
        const existingAircraft = await prisma.aircraft.findUnique({
          where: { nNumber: row.nNumber },
        });

        if (existingAircraft) {
          await prisma.aircraft.update({
            where: { nNumber: row.nNumber },
            data: {
              makeModel: row.makeModel,
              homeBaseAirport: row.homeBaseAirport ?? existingAircraft.homeBaseAirport,
              pilotId,
            },
          });
          summary.aircraftUpdated += 1;
          continue;
        }
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
