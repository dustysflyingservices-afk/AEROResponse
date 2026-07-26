"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createOrganization,
  deleteOrganization,
  updateOrganization,
} from "@/lib/services/organizations";

function formValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createOrganizationAction(formData: FormData): Promise<void> {
  await createOrganization({
    name: formValue(formData, "name"),
    contactName: formValue(formData, "contactName"),
    contactPhone: formValue(formData, "contactPhone"),
    contactEmail: formValue(formData, "contactEmail"),
    notes: formValue(formData, "notes"),
  });

  revalidatePath("/dashboard/organizations");
  redirect("/dashboard/organizations");
}

export async function updateOrganizationAction(
  id: string,
  formData: FormData
): Promise<void> {
  await updateOrganization(id, {
    name: formValue(formData, "name"),
    contactName: formValue(formData, "contactName"),
    contactPhone: formValue(formData, "contactPhone"),
    contactEmail: formValue(formData, "contactEmail"),
    notes: formValue(formData, "notes"),
  });

  revalidatePath("/dashboard/organizations");
  redirect("/dashboard/organizations");
}

export async function deleteOrganizationAction(id: string): Promise<void> {
  await deleteOrganization(id);
  revalidatePath("/dashboard/organizations");
}
