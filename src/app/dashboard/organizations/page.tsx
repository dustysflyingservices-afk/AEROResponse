import Link from "next/link";
import { listOrganizations } from "@/lib/services/organizations";
import { deleteOrganizationAction } from "@/app/dashboard/organizations/actions";
import { DeleteButton } from "@/components/ui/delete-button";

export default async function OrganizationsPage(): Promise<JSX.Element> {
  const organizations = await listOrganizations();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-silver-100">Organizations</h1>
          <p className="mt-1 text-sm text-silver-500">
            Requesting agencies that submit mission requests.
          </p>
        </div>
        <Link
          href="/dashboard/organizations/new"
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          Add Organization
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-surface-border">
        <table className="min-w-full divide-y divide-surface-border">
          <thead className="bg-surface-raised">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-silver-500">
                Name
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-silver-500">
                Contact
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-silver-500">
                Email
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-silver-500">
                Phone
              </th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border bg-surface">
            {organizations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-silver-500">
                  No organizations yet. Add the first requesting agency.
                </td>
              </tr>
            ) : (
              organizations.map((organization) => (
                <tr key={organization.id}>
                  <td className="px-4 py-3 text-sm font-medium text-silver-100">
                    {organization.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-silver-300">
                    {organization.contactName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-silver-300">
                    {organization.contactEmail ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-silver-300">
                    {organization.contactPhone ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="flex justify-end gap-4">
                      <Link
                        href={`/dashboard/organizations/${organization.id}/edit`}
                        className="font-medium text-silver-300 hover:text-silver-100"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteOrganizationAction.bind(null, organization.id)}
                        confirmMessage={`Delete ${organization.name}? This cannot be undone.`}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
