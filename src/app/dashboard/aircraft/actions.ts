"use server";

import { revalidatePath } from "next/cache";
import { deleteAircraft, verifyAircraftHex } from "@/lib/services/aircraft";
import { formValue } from "@/lib/utils/form-data";

export async function deleteAircraftAction(id: string): Promise<void> {
  await deleteAircraft(id);
  revalidatePath("/dashboard/aircraft");
  revalidatePath("/dashboard/pilots");
}

export async function verifyAircraftHexAction(id: string, formData: FormData): Promise<void> {
  await verifyAircraftHex(id, formValue(formData, "icaoHex"));
  revalidatePath("/dashboard/aircraft");
  revalidatePath("/dashboard/tracking");
}
