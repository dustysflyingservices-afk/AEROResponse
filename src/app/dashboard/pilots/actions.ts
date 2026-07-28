"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createPilotWithAircraft,
  deletePilot,
  updatePilotWithAircraft,
} from "@/lib/services/pilots";
import { formValue } from "@/lib/utils/form-data";
import type { AircraftRowFormInput } from "@/lib/validation/aircraft";

function pilotFieldsFromForm(formData: FormData) {
  return {
    firstName: formValue(formData, "firstName"),
    lastName: formValue(formData, "lastName"),
    email: formValue(formData, "email"),
    phone: formValue(formData, "phone"),
    street1: formValue(formData, "street1"),
    street2: formValue(formData, "street2"),
    city: formValue(formData, "city"),
    state: formValue(formData, "state"),
    zipCode: formValue(formData, "zipCode"),
    picTotalTime: formValue(formData, "picTotalTime"),
    airmenRatings: formValue(formData, "airmenRatings"),
    motivation: formValue(formData, "motivation"),
    notes: formValue(formData, "notes"),
  };
}

function aircraftRowsFromForm(formData: FormData): AircraftRowFormInput[] {
  const ids = formData.getAll("aircraftId[]") as string[];
  const nNumbers = formData.getAll("nNumber[]") as string[];
  const makeModels = formData.getAll("makeModel[]") as string[];
  const homeBaseAirports = formData.getAll("homeBaseAirport[]") as string[];
  const categories = formData.getAll("category[]") as string[];
  const usefulLoads = formData.getAll("usefulLoadLbs[]") as string[];
  const ranges = formData.getAll("rangeNm[]") as string[];
  const minRunways = formData.getAll("minRunwayFt[]") as string[];

  return makeModels.map((_, index) => ({
    id: ids[index] || undefined,
    nNumber: nNumbers[index] ?? "",
    makeModel: makeModels[index] ?? "",
    homeBaseAirport: homeBaseAirports[index] ?? "",
    category: categories[index] || "OTHER",
    usefulLoadLbs: usefulLoads[index] ?? "",
    rangeNm: ranges[index] ?? "",
    minRunwayFt: minRunways[index] ?? "",
  }));
}

export async function createPilotAction(formData: FormData): Promise<void> {
  await createPilotWithAircraft(pilotFieldsFromForm(formData), aircraftRowsFromForm(formData));

  revalidatePath("/dashboard/pilots");
  revalidatePath("/dashboard/aircraft");
  redirect("/dashboard/pilots");
}

export async function updatePilotAction(id: string, formData: FormData): Promise<void> {
  await updatePilotWithAircraft(
    id,
    pilotFieldsFromForm(formData),
    aircraftRowsFromForm(formData)
  );

  revalidatePath("/dashboard/pilots");
  revalidatePath("/dashboard/aircraft");
  redirect("/dashboard/pilots");
}

export async function deletePilotAction(id: string): Promise<void> {
  await deletePilot(id);
  revalidatePath("/dashboard/pilots");
  revalidatePath("/dashboard/aircraft");
}
