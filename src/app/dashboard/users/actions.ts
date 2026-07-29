"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/lib/auth/session";
import { createUser, deleteUser, updateUser } from "@/lib/services/users";
import { formValue } from "@/lib/utils/form-data";

async function requireAdmin(): Promise<{ id: string }> {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Only admins can manage users.");
  }
  return { id: session.user.id };
}

export async function createUserAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const role = formValue(formData, "role");
  await createUser({
    name: formValue(formData, "name"),
    email: formValue(formData, "email"),
    password: formValue(formData, "password"),
    role: role === "ADMIN" ? "ADMIN" : "OPS",
  });

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}

export async function updateUserAction(id: string, formData: FormData): Promise<void> {
  await requireAdmin();

  const role = formValue(formData, "role");
  const password = formValue(formData, "password");

  await updateUser(id, {
    name: formValue(formData, "name"),
    role: role === "ADMIN" ? "ADMIN" : "OPS",
    password: password || undefined,
  });

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}

export async function deleteUserAction(id: string): Promise<void> {
  const admin = await requireAdmin();

  if (id === admin.id) {
    throw new Error("You can't delete your own account while signed in.");
  }

  await deleteUser(id);
  revalidatePath("/dashboard/users");
}
