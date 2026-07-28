import { prisma } from "@/lib/db/prisma";
import { pilotSchema, type PilotInput } from "@/lib/validation/pilot";
import { aircraftRowSchema, type AircraftRowFormInput } from "@/lib/validation/aircraft";
import type { Aircraft, AircraftCategory, Pilot, Prisma } from "@prisma/client";

export type PilotWithAircraft = Pilot & { aircraft: Aircraft[] };

export interface PilotFilters {
  q?: string;
}

export async function listPilots(filters: PilotFilters = {}): Promise<PilotWithAircraft[]> {
  const where: Prisma.PilotWhereInput = {};

  if (filters.q) {
    where.OR = [
      { firstName: { contains: filters.q, mode: "insensitive" } },
      { lastName: { contains: filters.q, mode: "insensitive" } },
      { email: { contains: filters.q, mode: "insensitive" } },
      { aircraft: { some: { makeModel: { contains: filters.q, mode: "insensitive" } } } },
      { aircraft: { some: { nNumber: { contains: filters.q, mode: "insensitive" } } } },
    ];
  }

  return prisma.pilot.findMany({
    where,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: { aircraft: { orderBy: { nNumber: "asc" } } },
  });
}

export async function getPilot(id: string): Promise<PilotWithAircraft | null> {
  return prisma.pilot.findUnique({
    where: { id },
    include: { aircraft: { orderBy: { nNumber: "asc" } } },
  });
}

function toNullable(value: string | undefined): string | null {
  return value && value.length > 0 ? value : null;
}

function buildPilotData(data: ReturnType<typeof pilotSchema.parse>) {
  return {
    firstName: data.firstName,
    lastName: data.lastName,
    email: toNullable(data.email)?.toLowerCase() ?? null,
    phone: toNullable(data.phone),
    street1: toNullable(data.street1),
    street2: toNullable(data.street2),
    city: toNullable(data.city),
    state: toNullable(data.state),
    zipCode: toNullable(data.zipCode),
    picTotalTime: toNullable(data.picTotalTime),
    airmenRatings: toNullable(data.airmenRatings),
    motivation: toNullable(data.motivation),
    notes: toNullable(data.notes),
  };
}

function buildAircraftData(row: ReturnType<typeof aircraftRowSchema.parse>) {
  return {
    nNumber: toNullable(row.nNumber)?.toUpperCase() ?? null,
    makeModel: row.makeModel as string,
    homeBaseAirport: toNullable(row.homeBaseAirport),
    category: row.category as AircraftCategory,
    usefulLoadLbs: row.usefulLoadLbs ?? null,
    rangeNm: row.rangeNm ?? null,
    minRunwayFt: row.minRunwayFt ?? null,
  };
}

/**
 * Parses and filters raw aircraft rows submitted from the combined pilot
 * form. A row is kept only if it has a make/model (a blank row left over
 * from "Add Another Aircraft" is silently dropped rather than erroring).
 */
function parseAircraftRows(rawRows: AircraftRowFormInput[]) {
  return rawRows
    .map((row) => aircraftRowSchema.parse(row))
    .filter((row) => Boolean(row.makeModel && row.makeModel.trim().length > 0));
}

export async function createPilotWithAircraft(
  pilotInput: PilotInput,
  aircraftRows: AircraftRowFormInput[]
): Promise<Pilot> {
  const pilotData = pilotSchema.parse(pilotInput);
  const validRows = parseAircraftRows(aircraftRows);

  return prisma.$transaction(async (tx) => {
    const pilot = await tx.pilot.create({ data: buildPilotData(pilotData) });

    for (const row of validRows) {
      await tx.aircraft.create({
        data: { ...buildAircraftData(row), pilotId: pilot.id },
      });
    }

    return pilot;
  });
}

export async function updatePilotWithAircraft(
  id: string,
  pilotInput: PilotInput,
  aircraftRows: AircraftRowFormInput[]
): Promise<Pilot> {
  const pilotData = pilotSchema.parse(pilotInput);
  const validRows = parseAircraftRows(aircraftRows);

  return prisma.$transaction(async (tx) => {
    const pilot = await tx.pilot.update({ where: { id }, data: buildPilotData(pilotData) });

    const existingAircraft = await tx.aircraft.findMany({
      where: { pilotId: id },
      select: { id: true },
    });
    const existingIds = new Set(existingAircraft.map((row) => row.id));
    const submittedIds = new Set(
      validRows.filter((row) => row.id).map((row) => row.id as string)
    );

    const idsToDelete = [...existingIds].filter(
      (existingId) => !submittedIds.has(existingId)
    );
    if (idsToDelete.length > 0) {
      await tx.aircraft.deleteMany({ where: { id: { in: idsToDelete } } });
    }

    for (const row of validRows) {
      const data = buildAircraftData(row);
      if (row.id && existingIds.has(row.id)) {
        await tx.aircraft.update({ where: { id: row.id }, data });
      } else {
        await tx.aircraft.create({ data: { ...data, pilotId: id } });
      }
    }

    return pilot;
  });
}

export async function deletePilot(id: string): Promise<void> {
  await prisma.pilot.delete({ where: { id } });
}
