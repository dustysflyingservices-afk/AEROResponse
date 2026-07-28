import { prisma } from "@/lib/db/prisma";
import type { Aircraft, AircraftCategory, Mission, Pilot } from "@prisma/client";

export interface MatchCriteria {
  requiredCategory?: AircraftCategory | null;
  minUsefulLoadLbs?: number | null;
  minRangeNm?: number | null;
  minRunwayFt?: number | null;
}

export interface AircraftMatch {
  aircraft: Aircraft & { pilot: Pilot };
  isFullMatch: boolean;
  reasons: string[];
}

function humanizeCategory(category: string): string {
  return category.replace(/_/g, " ").toLowerCase();
}

/**
 * Checks one aircraft against mission criteria and returns the list of
 * reasons it falls short (empty array = full match): category, useful load,
 * range, and whether the aircraft's own runway requirement fits within what's
 * available at the mission's staging/destination airport.
 */
function evaluateAircraft(aircraft: Aircraft, criteria: MatchCriteria): string[] {
  const reasons: string[] = [];

  if (criteria.requiredCategory && aircraft.category !== criteria.requiredCategory) {
    reasons.push(
      `Category is ${humanizeCategory(aircraft.category)}, mission needs ${humanizeCategory(
        criteria.requiredCategory
      )}`
    );
  }

  if (criteria.minUsefulLoadLbs) {
    if (!aircraft.usefulLoadLbs) {
      reasons.push("Useful load not on file");
    } else if (aircraft.usefulLoadLbs < criteria.minUsefulLoadLbs) {
      reasons.push(
        `Useful load ${aircraft.usefulLoadLbs} lbs is below the ${criteria.minUsefulLoadLbs} lbs required`
      );
    }
  }

  if (criteria.minRangeNm) {
    if (!aircraft.rangeNm) {
      reasons.push("Range not on file");
    } else if (aircraft.rangeNm < criteria.minRangeNm) {
      reasons.push(`Range ${aircraft.rangeNm} nm is below the ${criteria.minRangeNm} nm required`);
    }
  }

  if (criteria.minRunwayFt && aircraft.minRunwayFt && aircraft.minRunwayFt > criteria.minRunwayFt) {
    reasons.push(
      `Needs ${aircraft.minRunwayFt} ft of runway; only ${criteria.minRunwayFt} ft available`
    );
  }

  return reasons;
}

export async function findMatchingAircraft(criteria: MatchCriteria): Promise<AircraftMatch[]> {
  const aircraft = await prisma.aircraft.findMany({
    include: { pilot: true },
    orderBy: { nNumber: "asc" },
  });

  const matches: AircraftMatch[] = aircraft.map((plane) => {
    const reasons = evaluateAircraft(plane, criteria);
    return { aircraft: plane, isFullMatch: reasons.length === 0, reasons };
  });

  return matches.sort((a, b) => {
    if (a.isFullMatch !== b.isFullMatch) {
      return a.isFullMatch ? -1 : 1;
    }
    const aKey = a.aircraft.nNumber ?? a.aircraft.makeModel;
    const bKey = b.aircraft.nNumber ?? b.aircraft.makeModel;
    return aKey.localeCompare(bKey);
  });
}

export function criteriaFromMission(mission: Mission): MatchCriteria {
  return {
    requiredCategory: mission.requiredCategory,
    minUsefulLoadLbs: mission.minUsefulLoadLbs,
    minRangeNm: mission.minRangeNm,
    minRunwayFt: mission.minRunwayFt,
  };
}
