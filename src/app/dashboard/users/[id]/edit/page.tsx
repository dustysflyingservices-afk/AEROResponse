import { redirect, notFound } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { getUser } from "@/lib/services/users";
import { updateUserAction } from "@/app/dashboard/users/actions";
import { UserForm } from "@/components/users/user-form";

export default async function EditUserPage({
  params,
}: {
  params: { id: string };
}): Promise<JSX.Element> {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const user = await getUser(params.id);
  if (!user) {
    notFound();
  }

  const action = updateUserAction.bind(null, user.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-silver-100">Edit User</h1>
      <div className="mt-6">
        <UserForm user={user} action={action} />
      </div>
    </div>
  );
}
