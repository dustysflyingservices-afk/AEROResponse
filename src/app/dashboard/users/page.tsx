import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentSession } from "@/lib/auth/session";
import { listUsers } from "@/lib/services/users";
import { deleteUserAction } from "@/app/dashboard/users/actions";
import { DeleteButton } from "@/components/ui/delete-button";

export default async function UsersPage(): Promise<JSX.Element> {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await listUsers();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-silver-100">Users</h1>
          <p className="mt-1 text-sm text-silver-500">
            Manage who can sign in to AeroResponse.
          </p>
        </div>
        <Link
          href="/dashboard/users/new"
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          Add User
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-surface-border">
        <table className="min-w-full divide-y divide-surface-border">
          <thead className="bg-surface-raised">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-silver-500">
                Name
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-silver-500">
                Email
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-silver-500">
                Role
              </th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border bg-surface">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 text-sm font-medium text-silver-100">
                  {user.name}
                  {user.id === session.user.id ? (
                    <span className="ml-2 text-xs text-silver-500">(you)</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-sm text-silver-300">{user.email}</td>
                <td className="px-4 py-3 text-sm text-silver-300">
                  {user.role === "ADMIN" ? "Admin" : "Ops"}
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/dashboard/users/${user.id}/edit`}
                      className="font-medium text-silver-300 hover:text-silver-100"
                    >
                      Edit
                    </Link>
                    {user.id === session.user.id ? null : (
                      <DeleteButton
                        action={deleteUserAction.bind(null, user.id)}
                        confirmMessage={`Delete ${user.name}'s account? They will no longer be able to sign in.`}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
