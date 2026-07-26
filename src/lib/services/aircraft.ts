import { prisma } from "@/lib/db/prisma";
import { aircraftSchema, type AircraftInput } from "@/lib/validation/aircraft";
import type { Aircraft, AircraftCategory, Pilot } from "@prisma/client";

export type AircraftWithPilot = Aircraft & { pilot: Pilot };

export async function listAircraft(): Promise<AircraftWithPilot[]> {
  return prisma.aircraft.findMany({
    orderBy: { nNumber: "asc" },
    include: { pilot: true },
  });
}

export async function getAircraft(id: string): Promise<AircraftWithPilot | null> {
  return prisma.aircraft.findUnique({
    where: { id },
    include: { pilot: true },
  });
}

function toNullable(value: string | undefined): string | null {
  return value && value.length > 0 ? value : null;
}

export async function createAircraft(input: AircraftInput): Promise<Aircraft> {
  const data = aircraftSchema.parse(input);
  return prisma.aircraft.create({
    data: {
      nNumber: data.nNumber,
      makeModel: data.makeModel,
      homeBaseAirport: toNullable(data.homeBaseAirport),
      category: data.category as AircraftCategory,
      usefulLoadLbs: data.usefulLoadLbs ?? null,
      rangeNm: data.rangeNm ?? null,
      minRunwayFt: data.minRunwayFt ?? null,
      pilotId: data.pilotId,
    },
  });
}

export async function updateAircraft(id: string, input: AircraftInput): Promise<Aircraft> {
  const data = aircraftSchema.parse(input);
  return prisma.aircraft.update({
    where: { id },
    data: {
      nNumber: data.nNumber,
      makeModel: data.makeModel,
      homeBaseAirport: toNullable(data.homeBaseAirport),
      category: data.category as AircraftCategory,
      usefulLoadLbs: data.usefulLoadLbs ?? null,
      rangeNm: data.rangeNm ?? null,
      minRunwayFt: data.minRunwayFt ?? null,
      pilotId: data.pilotId,
    },
  });
}

export async function deleteAircraft(id: string): Promise<void> {
  await prisma.aircraft.delete({ where: { id } });
}
