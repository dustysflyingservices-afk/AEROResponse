import { prisma } from "@/lib/db/prisma";
import { missionSchema, type MissionFormInput } from "@/lib/validation/mission";
import { clearAssignmentsForMission } from "@/lib/services/mission-assignments";
import type { AircraftCategory, Mission, Organization, Prisma } from "@prisma/client";

const ENDED_STATUSES = new Set(["COMPLETED", "CANCELLED"]);

export type MissionWithOrganization = Mission & { organization: Organization | null };

export interface MissionFilters {
  q?: string;
  status?: string;
  priority?: string;
  organizationId?: string;
}

export async function listMissions(
  filters: MissionFilters = {}
): Promise<MissionWithOrganization[]> {
  const where: Prisma.MissionWhereInput = {};

  if (filters.status) {
    where.status = filters.status as Mission["status"];
  }

  if (filters.priority) {
    where.priority = filters.priority as Mission["priority"];
  }

  if (filters.organizationId) {
    where.organizationId = filters.organizationId;
  }

  if (filters.q) {
    where.OR = [
      { missionDescription: { contains: filters.q, mode: "insensitive" } },
      { stagingAirport: { contains: filters.q, mode: "insensitive" } },
      { pointOfContact: { contains: filters.q, mode: "insensitive" } },
      { situationSummary: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return prisma.mission.findMany({
    where,
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMission(id: string): Promise<MissionWithOrganization | null> {
  return prisma.mission.findUnique({
    where: { id },
    include: { organization: true },
  });
}

function toNullable(value: string | undefined): string | null {
  return value && value.length > 0 ? value : null;
}

function buildMissionData(data: ReturnType<typeof missionSchema.parse>) {
  return {
    pointOfContact: toNullable(data.pointOfContact),
    missionCoordinator: toNullable(data.missionCoordinator),
    organizationId: toNullable(data.organizationId),
    missionDescription: data.missionDescription,
    cargoPassengers: toNullable(data.cargoPassengers),
    aircraftNeededNotes: toNullable(data.aircraftNeededNotes),
    specialRequirements: toNullable(data.specialRequirements),
    requiredCategory: (toNullable(data.requiredCategory) as AircraftCategory | null) ?? null,
    minUsefulLoadLbs: data.minUsefulLoadLbs ?? null,
    minRangeNm: data.minRangeNm ?? null,
    minRunwayFt: data.minRunwayFt ?? null,
    launchWindow: toNullable(data.launchWindow),
    responseNeededBy: data.responseNeededBy ?? null,
    estimatedDuration: toNullable(data.estimatedDuration),
    stagingAirport: data.stagingAirport,
    destinationAirports: data.destinationAirports,
    situationSummary: toNullable(data.situationSummary),
    priority: data.priority as Mission["priority"],
    status: data.status as Mission["status"],
  };
}

export async function createMission(input: MissionFormInput): Promise<Mission> {
  const data = missionSchema.parse(input);
  return prisma.mission.create({ data: buildMissionData(data) });
}

export async function updateMission(id: string, input: MissionFormInput): Promise<Mission> {
  const data = missionSchema.parse(input);
  const mission = await prisma.mission.update({ where: { id }, data: buildMissionData(data) });

  if (ENDED_STATUSES.has(mission.status)) {
    await clearAssignmentsForMission(id);
  }

  return mission;
}

export async function deleteMission(id: string): Promise<void> {
  await prisma.mission.delete({ where: { id } });
}
