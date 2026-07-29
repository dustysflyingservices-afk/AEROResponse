import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { ChangePasswordForm } from "@/components/account/change-password-form";
import { changePasswordAction } from "@/app/dashboard/account/actions";

export default async function AccountPage(): Promise<JSX.Element> {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-silver-100">My Account</h1>
      <p className="mt-1 text-sm text-silver-500">
        Signed in as {session.user.email}
      </p>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-silver-100">Change Password</h2>
        <div className="mt-3">
          <ChangePasswordForm action={changePasswordAction} />
        </div>
      </div>
    </div>
  );
}
