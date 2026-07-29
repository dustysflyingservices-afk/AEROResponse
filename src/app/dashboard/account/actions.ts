"use server";

import { getCurrentSession } from "@/lib/auth/session";
import { changeOwnPassword } from "@/lib/services/users";
import { formValue } from "@/lib/utils/form-data";

export async function changePasswordAction(formData: FormData): Promise<void> {
  const session = await getCurrentSession();
  if (!session) {
    throw new Error("You must be signed in.");
  }

  await changeOwnPassword(session.user.id, {
    currentPassword: formValue(formData, "currentPassword"),
    newPassword: formValue(formData, "newPassword"),
    confirmPassword: formValue(formData, "confirmPassword"),
  });

  // No redirect - the form itself shows a success message and stays put,
  // since there's nothing else useful to navigate to after this.
}
