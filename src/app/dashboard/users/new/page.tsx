import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { UserForm } from "@/components/users/user-form";
import { createUserAction } from "@/app/dashboard/users/actions";

export default async function NewUserPage(): Promise<JSX.Element> {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-silver-100">Add User</h1>
      <div className="mt-6">
        <UserForm action={createUserAction} />
      </div>
    </div>
  );
}
