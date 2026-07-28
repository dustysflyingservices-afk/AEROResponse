"use server";

import { revalidatePath } from "next/cache";
import { deleteAircraft } from "@/lib/services/aircraft";

export async function deleteAircraftAction(id: string): Promise<void> {
  await deleteAircraft(id);
  revalidatePath("/dashboard/aircraft");
  revalidatePath("/dashboard/pilots");
}
