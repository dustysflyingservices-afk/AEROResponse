import Link from "next/link";
import { listAircraft } from "@/lib/services/aircraft";
import { deleteAircraftAction } from "@/app/dashboard/aircraft/actions";
import { DeleteButton } from "@/components/ui/delete-button";
import {
  AIRCRAFT_CATEGORIES,
  AIRCRAFT_CATEGORY_LABELS,
} from "@/lib/constants/aircraft-category";

interface AircraftPageProps {
  searchParams: {
    q?: string;
    category?: string;
    minUsefulLoadLbs?: string;
    minRangeNm?: string;
  };
}

export default async function AircraftPage({
  searchParams,
}: AircraftPageProps): Promise<JSX.Element> {
  const aircraft = await listAircraft(searchParams);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
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

      <form
        method="get"
        className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-surface-border bg-surface-raised p-4"
      >
        <div className="min-w-[200px] flex-1">
          <label htmlFor="q" className="block text-xs font-medium text-silver-400">
            Search
          </label>
          <input
            id="q"
            name="q"
            defaultValue={searchParams.q ?? ""}
            placeholder="N-Number, make/model, base, pilot..."
            className="mt-1 w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-silver-100 placeholder:text-silver-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-xs font-medium text-silver-400">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={searchParams.category ?? ""}
            className="mt-1 rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-silver-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">Any category</option>
            {AIRCRAFT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {AIRCRAFT_CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="minUsefulLoadLbs"
            className="block text-xs font-medium text-silver-400"
          >
            Min Useful Load (lbs)
          </label>
          <input
            id="minUsefulLoadLbs"
            name="minUsefulLoadLbs"
            type="number"
            min={0}
            defaultValue={searchParams.minUsefulLoadLbs ?? ""}
            className="mt-1 w-32 rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-silver-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label htmlFor="minRangeNm" className="block text-xs font-medium text-silver-400">
            Min Range (nm)
          </label>
          <input
            id="minRangeNm"
            name="minRangeNm"
            type="number"
            min={0}
            defaultValue={searchParams.minRangeNm ?? ""}
            className="mt-1 w-32 rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-silver-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-md border border-surface-border px-4 py-2 text-sm font-medium text-silver-300 hover:bg-surface"
        >
          Filter
        </button>
        <Link
          href="/dashboard/aircraft"
          className="text-sm font-medium text-silver-500 hover:text-silver-300"
        >
          Clear
        </Link>
      </form>

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
