import { prisma } from "@/lib/db/prisma";

export async function getAssignedAircraftIds(missionId: string): Promise<string[]> {
  const assignments = await prisma.missionAircraftAssignment.findMany({
    where: { missionId },
    select: { aircraftId: true },
  });
  return assignments.map((a) => a.aircraftId);
}

export async function assignAircraftToMission(
  missionId: string,
  aircraftId: string
): Promise<void> {
  await prisma.missionAircraftAssignment.upsert({
    where: { missionId_aircraftId: { missionId, aircraftId } },
    create: { missionId, aircraftId },
    update: {},
  });
}

export async function unassignAircraftFromMission(
  missionId: string,
  aircraftId: string
): Promise<void> {
  await prisma.missionAircraftAssignment.deleteMany({
    where: { missionId, aircraftId },
  });
}

/**
 * Clears every aircraft assignment for a mission - called automatically
 * when a mission's status becomes COMPLETED or CANCELLED, since a checkbox
 * checked "for the duration of the mission" should stop applying once that
 * duration is over rather than lingering indefinitely.
 */
export async function clearAssignmentsForMission(missionId: string): Promise<void> {
  await prisma.missionAircraftAssignment.deleteMany({ where: { missionId } });
}

/**
 * Aircraft currently assigned to any mission that hasn't ended (i.e. not
 * COMPLETED or CANCELLED). This is what drives the public tracking map -
 * only aircraft actively working a mission right now, nothing stale.
 */
export async function getActivelyAssignedAircraftIds(): Promise<string[]> {
  const assignments = await prisma.missionAircraftAssignment.findMany({
    where: {
      mission: { status: { notIn: ["COMPLETED", "CANCELLED"] } },
    },
    select: { aircraftId: true },
    distinct: ["aircraftId"],
  });
  return assignments.map((a) => a.aircraftId);
}
