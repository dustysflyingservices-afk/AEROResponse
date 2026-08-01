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

const ICAO_HEX_PATTERN = /^[0-9A-F]{6}$/;

/**
 * Sets and verifies an aircraft's ICAO hex code for ADS-B tracking. This is
 * a deliberate, explicit step rather than something derived automatically
 * from the N-Number - an auto-derived hex that's wrong would silently track
 * the wrong aircraft (or nothing) with no error surfaced anywhere.
 */
export async function verifyAircraftHex(id: string, rawHex: string): Promise<Aircraft> {
  const hex = rawHex.trim().toUpperCase();

  if (!ICAO_HEX_PATTERN.test(hex)) {
    throw new Error("ICAO hex must be exactly 6 hexadecimal characters (0-9, A-F).");
  }

  const existing = await prisma.aircraft.findUnique({ where: { icaoHex: hex } });
  if (existing && existing.id !== id) {
    throw new Error(`That hex is already assigned to aircraft ${existing.nNumber ?? existing.id}.`);
  }

  return prisma.aircraft.update({
    where: { id },
    data: { icaoHex: hex, hexVerified: true },
  });
}

export async function listTrackableAircraft(): Promise<AircraftWithPilot[]> {
  return prisma.aircraft.findMany({
    where: {
      OR: [{ nNumber: { not: null } }, { icaoHex: { not: null } }],
    },
    include: { pilot: true },
    orderBy: { nNumber: "asc" },
  });
}
