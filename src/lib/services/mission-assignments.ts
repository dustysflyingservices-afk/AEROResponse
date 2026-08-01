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
 * Aircraft currently assigned to a mission that (a) hasn't ended (not
 * COMPLETED or CANCELLED) and (b) has live tracking explicitly enabled.
 * Tracking is opt-in per mission - having aircraft assigned isn't enough on
 * its own, Ops has to turn tracking on for that specific mission.
 */
export async function getActivelyAssignedAircraftIds(): Promise<string[]> {
  const assignments = await prisma.missionAircraftAssignment.findMany({
    where: {
      mission: {
        status: { notIn: ["COMPLETED", "CANCELLED"] },
        trackingEnabled: true,
      },
    },
    select: { aircraftId: true },
    distinct: ["aircraftId"],
  });
  return assignments.map((a) => a.aircraftId);
}
