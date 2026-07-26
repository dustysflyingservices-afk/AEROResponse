"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAircraft, deleteAircraft, updateAircraft } from "@/lib/services/aircraft";
import { formValue } from "@/lib/utils/form-data";

export async function createAircraftAction(formData: FormData): Promise<void> {
  await createAircraft({
    nNumber: formValue(formData, "nNumber"),
    makeModel: formValue(formData, "makeModel"),
    homeBaseAirport: formValue(formData, "homeBaseAirport"),
    category: formValue(formData, "category"),
    usefulLoadLbs: formValue(formData, "usefulLoadLbs"),
    rangeNm: formValue(formData, "rangeNm"),
    minRunwayFt: formValue(formData, "minRunwayFt"),
    pilotId: formValue(formData, "pilotId"),
  });

  revalidatePath("/dashboard/aircraft");
  redirect("/dashboard/aircraft");
}

export async function updateAircraftAction(id: string, formData: FormData): Promise<void> {
  await updateAircraft(id, {
    nNumber: formValue(formData, "nNumber"),
    makeModel: formValue(formData, "makeModel"),
    homeBaseAirport: formValue(formData, "homeBaseAirport"),
    category: formValue(formData, "category"),
    usefulLoadLbs: formValue(formData, "usefulLoadLbs"),
    rangeNm: formValue(formData, "rangeNm"),
    minRunwayFt: formValue(formData, "minRunwayFt"),
    pilotId: formValue(formData, "pilotId"),
  });

  revalidatePath("/dashboard/aircraft");
  redirect("/dashboard/aircraft");
}

export async function deleteAircraftAction(id: string): Promise<void> {
  await deleteAircraft(id);
  revalidatePath("/dashboard/aircraft");
}
