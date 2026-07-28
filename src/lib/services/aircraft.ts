import { prisma } from "@/lib/db/prisma";
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
      { pilot: { firstName: { contains: filters.q, mode: "insensitive" } } },
      { pilot: { lastName: { contains: filters.q, mode: "insensitive" } } },
    ];
  }

  return prisma.aircraft.findMany({
    where,
    orderBy: { nNumber: "asc" },
    include: { pilot: true },
  });
}

export async function deleteAircraft(id: string): Promise<void> {
  await prisma.aircraft.delete({ where: { id } });
}
