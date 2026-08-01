import { prisma } from "@/lib/db/prisma";

export interface NormalizedPilotRow {
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
  usefulLoadLbs: number | null;
  rangeNm: number | null;
  minRunwayFt: number | null;
}

export interface UpsertContext {
  pilotIdByEmail: Map<string, string>;
  pilotIdByName: Map<string, string>;
}

export function createUpsertContext(): UpsertContext {
  return { pilotIdByEmail: new Map(), pilotIdByName: new Map() };
}

export interface UpsertResult {
  pilotId: string;
  pilotCreated: boolean;
  aircraftCreated: boolean;
  aircraftUpdated: boolean;
}

// Aircraft Type values that mean "this pilot doesn't own/fly a specific
// aircraft" rather than an actual aircraft - these should never create an
// Aircraft record.
export const NON_AIRCRAFT_VALUES = new Set([
  "non owner",
  "nonowner",
  "none",
  "n/a",
  "na",
  "no aircraft",
  "renter",
  "student",
  "tbd",
  "unknown",
]);

// Matches a US N-Number: N followed by 1-5 digits and up to 2 trailing
// letters (e.g. N4323X, N12345).
const N_NUMBER_PATTERN = /\bN\d{1,5}[A-Z]{0,2}\b/i;

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

/**
 * Splits a combined "Aircraft Type" value like "Piper Archer II, N4323X"
 * into separate make/model and N-Number when there's no dedicated N-Number
 * field. Also filters out placeholder values ("Non owner", "N/A", etc.)
 * that mean the pilot doesn't have a specific aircraft on file.
 */
export function parseAircraftTypeValue(
  rawMakeModel: string | null
): { makeModel: string | null; nNumber: string | null } {
  if (!rawMakeModel) {
    return { makeModel: null, nNumber: null };
  }

  if (NON_AIRCRAFT_VALUES.has(rawMakeModel.trim().toLowerCase())) {
    return { makeModel: null, nNumber: null };
  }

  const match = rawMakeModel.match(N_NUMBER_PATTERN);
  if (!match) {
    return { makeModel: rawMakeModel, nNumber: null };
  }

  const nNumber = match[0].toUpperCase();
  const makeModel = rawMakeModel
    .replace(match[0], "")
    .replace(/,\s*$/, "")
    .replace(/^\s*,/, "")
    .trim();

  return { makeModel: makeModel.length > 0 ? makeModel : rawMakeModel, nNumber };
}

/**
 * Creates or updates a Pilot (and their Aircraft, if any) from one
 * normalized row. Dedup rule: matched first by email (case-insensitive),
 * then by exact case-insensitive name if no email is present - so the same
 * pilot submitted twice (two aircraft, or a resubmission) becomes one Pilot
 * record with aircraft linked to it, not a duplicate. Aircraft with an
 * N-Number are upserted by tail number; aircraft without one are always
 * created fresh, since there's no reliable key to match them on.
 */
export async function upsertPilotRow(
  row: NormalizedPilotRow,
  context: UpsertContext
): Promise<UpsertResult> {
  let pilotId: string | null = null;
  let pilotCreated = false;

  if (row.email) {
    pilotId =
      context.pilotIdByEmail.get(row.email) ??
      (await prisma.pilot.findUnique({ where: { email: row.email } }))?.id ??
      null;
  }

  const nameKey = `${row.firstName} ${row.lastName}`.trim().toLowerCase();

  if (!pilotId) {
    pilotId = context.pilotIdByName.get(nameKey) ?? null;

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
    pilotCreated = true;
  }

  context.pilotIdByName.set(nameKey, pilotId);
  if (row.email) {
    context.pilotIdByEmail.set(row.email, pilotId);
  }

  if (!row.makeModel) {
    // Pilot-only row (no aircraft info, or a "Non owner" style value).
    return { pilotId, pilotCreated, aircraftCreated: false, aircraftUpdated: false };
  }

  const aircraftData = {
    makeModel: row.makeModel,
    homeBaseAirport: row.homeBaseAirport,
    usefulLoadLbs: row.usefulLoadLbs,
    rangeNm: row.rangeNm,
    minRunwayFt: row.minRunwayFt,
  };

  if (row.nNumber) {
    const existingAircraft = await prisma.aircraft.findUnique({
      where: { nNumber: row.nNumber },
    });

    if (existingAircraft) {
      await prisma.aircraft.update({
        where: { nNumber: row.nNumber },
        data: {
          makeModel: aircraftData.makeModel,
          homeBaseAirport: aircraftData.homeBaseAirport ?? existingAircraft.homeBaseAirport,
          usefulLoadLbs: aircraftData.usefulLoadLbs ?? existingAircraft.usefulLoadLbs,
          rangeNm: aircraftData.rangeNm ?? existingAircraft.rangeNm,
          minRunwayFt: aircraftData.minRunwayFt ?? existingAircraft.minRunwayFt,
          pilotId,
        },
      });
      return { pilotId, pilotCreated, aircraftCreated: false, aircraftUpdated: true };
    }
  }

  await prisma.aircraft.create({
    data: {
      nNumber: row.nNumber,
      ...aircraftData,
      pilotId,
    },
  });
  return { pilotId, pilotCreated, aircraftCreated: true, aircraftUpdated: false };
}
