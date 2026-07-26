import Link from "next/link";
import { listPilots } from "@/lib/services/pilots";
import { deletePilotAction } from "@/app/dashboard/pilots/actions";
import { DeleteButton } from "@/components/ui/delete-button";

export default async function PilotsPage(): Promise<JSX.Element> {
  const pilots = await listPilots();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-silver-100">Pilots</h1>
          <p className="mt-1 text-sm text-silver-500">
            Volunteer pilots and the aircraft they own.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/pilots/import"
            className="rounded-md border border-surface-border px-4 py-2 text-sm font-medium text-silver-300 hover:bg-surface-raised"
          >
            Import Roster
          </Link>
          <Link
            href="/dashboard/pilots/new"
            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Add Pilot
          </Link>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-surface-border">
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
                Phone
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-silver-500">
                Aircraft
              </th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border bg-surface">
            {pilots.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-silver-500">
                  No pilots yet. Add one manually or import your roster.
                </td>
              </tr>
            ) : (
              pilots.map((pilot) => (
                <tr key={pilot.id}>
                  <td className="px-4 py-3 text-sm font-medium text-silver-100">
                    {pilot.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-silver-300">
                    {pilot.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-silver-300">
                    {pilot.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-silver-300">
                    {pilot.aircraft.length === 0
                      ? "—"
                      : pilot.aircraft.map((aircraft) => aircraft.nNumber).join(", ")}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="flex justify-end gap-4">
                      <Link
                        href={`/dashboard/pilots/${pilot.id}/edit`}
                        className="font-medium text-silver-300 hover:text-silver-100"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deletePilotAction.bind(null, pilot.id)}
                        confirmMessage={`Delete ${pilot.name}? Their linked aircraft will also be removed.`}
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
