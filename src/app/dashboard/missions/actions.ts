"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createMission, deleteMission, updateMission } from "@/lib/services/missions";
import {
  assignAircraftToMission,
  unassignAircraftFromMission,
} from "@/lib/services/mission-assignments";
import { formValue } from "@/lib/utils/form-data";

function missionFieldsFromForm(formData: FormData) {
  return {
    pointOfContact: formValue(formData, "pointOfContact"),
    missionCoordinator: formValue(formData, "missionCoordinator"),
    organizationId: formValue(formData, "organizationId"),
    missionDescription: formValue(formData, "missionDescription"),
    cargoPassengers: formValue(formData, "cargoPassengers"),
    aircraftNeededNotes: formValue(formData, "aircraftNeededNotes"),
    specialRequirements: formValue(formData, "specialRequirements"),
    requiredCategory: formValue(formData, "requiredCategory"),
    minUsefulLoadLbs: formValue(formData, "minUsefulLoadLbs"),
    minRangeNm: formValue(formData, "minRangeNm"),
    minRunwayFt: formValue(formData, "minRunwayFt"),
    launchWindow: formValue(formData, "launchWindow"),
    responseNeededBy: formValue(formData, "responseNeededBy"),
    estimatedDuration: formValue(formData, "estimatedDuration"),
    stagingAirport: formValue(formData, "stagingAirport"),
    destinationAirports: formValue(formData, "destinationAirports"),
    situationSummary: formValue(formData, "situationSummary"),
    priority: formValue(formData, "priority"),
    status: formValue(formData, "status"),
    trackingEnabled: formValue(formData, "trackingEnabled"),
  };
}

export async function createMissionAction(formData: FormData): Promise<void> {
  const mission = await createMission(missionFieldsFromForm(formData));
  revalidatePath("/dashboard/missions");
  redirect(`/dashboard/missions/${mission.id}/edit`);
}

export async function updateMissionAction(id: string, formData: FormData): Promise<void> {
  await updateMission(id, missionFieldsFromForm(formData));
  revalidatePath("/dashboard/missions");
  revalidatePath(`/dashboard/missions/${id}/edit`);
  redirect("/dashboard/missions");
}

export async function deleteMissionAction(id: string): Promise<void> {
  await deleteMission(id);
  revalidatePath("/dashboard/missions");
}

export async function toggleAircraftAssignmentAction(
  missionId: string,
  aircraftId: string,
  assign: boolean
): Promise<void> {
  if (assign) {
    await assignAircraftToMission(missionId, aircraftId);
  } else {
    await unassignAircraftFromMission(missionId, aircraftId);
  }
  revalidatePath(`/dashboard/missions/${missionId}/edit`);
}
