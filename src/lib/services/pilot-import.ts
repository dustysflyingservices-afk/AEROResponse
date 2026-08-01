import { buildFieldMap } from "@/lib/services/roster-field-mapping";
import {
  createUpsertContext,
  parseAircraftTypeValue,
  splitFullName,
  upsertPilotRow,
  type NormalizedPilotRow,
} from "@/lib/services/pilot-upsert";

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

function readNumberCell(row: RosterRow, header: string | undefined): number | null {
  const text = readCell(row, header);
  if (!text) {
    return null;
  }
  const parsed = Number(text.replace(/,/g, ""));
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

function normalizeRows(rows: RosterRow[]): {
  normalized: Array<{ rowNumber: number; row: NormalizedPilotRow }>;
  errors: ImportRowError[];
} {
  const errors: ImportRowError[] = [];
  const normalized: Array<{ rowNumber: number; row: NormalizedPilotRow }> = [];

  if (rows.length === 0) {
    return { normalized, errors };
  }

  const headerMap = buildFieldMap(Object.keys(rows[0]));

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

    const rawMakeModel = readCell(row, headerMap.makeModel);
    const explicitNNumber = readCell(row, headerMap.nNumber)?.toUpperCase() ?? null;
    const { makeModel, nNumber: parsedNNumber } = parseAircraftTypeValue(rawMakeModel);

    normalized.push({
      rowNumber,
      row: {
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
        makeModel,
        nNumber: explicitNNumber ?? parsedNNumber,
        homeBaseAirport: readCell(row, headerMap.homeBaseAirport),
        usefulLoadLbs: readNumberCell(row, headerMap.usefulLoadLbs),
        rangeNm: readNumberCell(row, headerMap.rangeNm),
        minRunwayFt: readNumberCell(row, headerMap.minRunwayFt),
      },
    });
  });

  return { normalized, errors };
}

/**
 * Imports a volunteer pilot roster from parsed spreadsheet rows. The actual
 * per-row create/update logic lives in pilot-upsert.ts, shared with the
 * Jotform webhook so both paths behave identically.
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

  const context = createUpsertContext();

  for (const { rowNumber, row } of normalized) {
    try {
      const result = await upsertPilotRow(row, context);
      if (result.pilotCreated) {
        summary.pilotsCreated += 1;
      } else {
        summary.pilotsMatched += 1;
      }
      if (result.aircraftCreated) {
        summary.aircraftCreated += 1;
      }
      if (result.aircraftUpdated) {
        summary.aircraftUpdated += 1;
      }
    } catch (error) {
      summary.rowsSkipped += 1;
      summary.errors.push({
        row: rowNumber,
        message: error instanceof Error ? error.message : "Unknown error processing row.",
      });
    }
  }

  return summary;
}
