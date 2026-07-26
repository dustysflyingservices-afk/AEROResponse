import Link from "next/link";
import { listAircraft } from "@/lib/services/aircraft";
import { deleteAircraftAction } from "@/app/dashboard/aircraft/actions";
import { DeleteButton } from "@/components/ui/delete-button";
import { AIRCRAFT_CATEGORY_LABELS } from "@/lib/constants/aircraft-category";

export default async function AircraftPage(): Promise<JSX.Element> {
  const aircraft = await listAircraft();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-silver-100">Aircraft</h1>
          <p className="mt-1 text-sm text-silver-500">
            Registered aircraft and their capabilities.
          </p>
        </div>
        <Link
          href="/dashboard/aircraft/new"
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          Add Aircraft
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-surface-border">
        <table className="min-w-full divide-y divide-surface-border">
          <thead className="bg-surface-raised">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-silver-500">
                N-Number
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-silver-500">
                Make / Model
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-silver-500">
                Pilot
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-silver-500">
                Home Base
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-silver-500">
                Category
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-silver-500">
                Useful Load
              </th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border bg-surface">
            {aircraft.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-sm text-silver-500">
                  No aircraft yet. Add one manually or import your pilot roster.
                </td>
              </tr>
            ) : (
              aircraft.map((plane) => (
                <tr key={plane.id}>
                  <td className="px-4 py-3 text-sm font-medium text-silver-100">
                    {plane.nNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-silver-300">{plane.makeModel}</td>
                  <td className="px-4 py-3 text-sm text-silver-300">{plane.pilot.name}</td>
                  <td className="px-4 py-3 text-sm text-silver-300">
                    {plane.homeBaseAirport ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-silver-300">
                    {AIRCRAFT_CATEGORY_LABELS[plane.category]}
                  </td>
                  <td className="px-4 py-3 text-sm text-silver-300">
                    {plane.usefulLoadLbs ? `${plane.usefulLoadLbs} lbs` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="flex justify-end gap-4">
                      <Link
                        href={`/dashboard/aircraft/${plane.id}/edit`}
                        className="font-medium text-silver-300 hover:text-silver-100"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteAircraftAction.bind(null, plane.id)}
                        confirmMessage={`Delete aircraft ${plane.nNumber}?`}
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
