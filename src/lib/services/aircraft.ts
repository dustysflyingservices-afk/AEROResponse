import { prisma } from "@/lib/db/prisma";
import { aircraftSchema, type AircraftFormInput } from "@/lib/validation/aircraft";
import type { Aircraft, AircraftCategory, Pilot, Prisma } from "@prisma/client";

export type AircraftWithPilot = Aircraft & { pilot: Pilot };

export interface AircraftFilters {
  q?: string;
  category?: string;
  minUsefulLoadLbs?: string;
  minRangeNm?: string;
}

export async function listAircraft(
  filters: AircraftFilters = {}
): Promise<AircraftWithPilot[]> {
  const where: Prisma.AircraftWhereInput = {};

  if (filters.category) {
    where.category = filters.category as AircraftCategory;
  }

  if (filters.minUsefulLoadLbs) {
    const value = Number(filters.minUsefulLoadLbs);
    if (Number.isFinite(value)) {
      where.usefulLoadLbs = { gte: value };
    }
  }

  if (filters.minRangeNm) {
    const value = Number(filters.minRangeNm);
    if (Number.isFinite(value)) {
      where.rangeNm = { gte: value };
    }
  }

  if (filters.q) {
    where.OR = [
      { nNumber: { contains: filters.q, mode: "insensitive" } },
      { makeModel: { contains: filters.q, mode: "insensitive" } },
      { homeBaseAirport: { contains: filters.q, mode: "insensitive" } },
      { pilot: { name: { contains: filters.q, mode: "insensitive" } } },
    ];
  }

  return prisma.aircraft.findMany({
    where,
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

export async function createAircraft(input: AircraftFormInput): Promise<Aircraft> {
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

export async function updateAircraft(id: string, input: AircraftFormInput): Promise<Aircraft> {
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
