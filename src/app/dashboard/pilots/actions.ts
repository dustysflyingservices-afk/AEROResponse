"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createPilot, deletePilot, updatePilot } from "@/lib/services/pilots";
import { formValue } from "@/lib/utils/form-data";

export async function createPilotAction(formData: FormData): Promise<void> {
  await createPilot({
    name: formValue(formData, "name"),
    email: formValue(formData, "email"),
    phone: formValue(formData, "phone"),
    qualifications: formValue(formData, "qualifications"),
    notes: formValue(formData, "notes"),
  });

  revalidatePath("/dashboard/pilots");
  redirect("/dashboard/pilots");
}

export async function updatePilotAction(id: string, formData: FormData): Promise<void> {
  await updatePilot(id, {
    name: formValue(formData, "name"),
    email: formValue(formData, "email"),
    phone: formValue(formData, "phone"),
    qualifications: formValue(formData, "qualifications"),
    notes: formValue(formData, "notes"),
  });

  revalidatePath("/dashboard/pilots");
  redirect("/dashboard/pilots");
}

export async function deletePilotAction(id: string): Promise<void> {
  await deletePilot(id);
  revalidatePath("/dashboard/pilots");
}
