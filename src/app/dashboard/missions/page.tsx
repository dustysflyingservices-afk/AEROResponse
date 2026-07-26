import Link from "next/link";
import { listMissions } from "@/lib/services/missions";
import { listOrganizations } from "@/lib/services/organizations";
import { deleteMissionAction } from "@/app/dashboard/missions/actions";
import { DeleteButton } from "@/components/ui/delete-button";
import {
  MISSION_PRIORITIES,
  MISSION_PRIORITY_BADGE_CLASSES,
  MISSION_PRIORITY_LABELS,
  MISSION_STATUSES,
  MISSION_STATUS_LABELS,
} from "@/lib/constants/mission";

interface MissionsPageProps {
  searchParams: {
    q?: string;
    status?: string;
    priority?: string;
    organizationId?: string;
  };
}

export default async function MissionsPage({
  searchParams,
}: MissionsPageProps): Promise<JSX.Element> {
  const [missions, organizations] = await Promise.all([
    listMissions(searchParams),
    listOrganizations(),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-silver-100">Missions</h1>
          <p className="mt-1 text-sm text-silver-500">
            Active and past volunteer pilot activations.
          </p>
        </div>
        <Link
          href="/dashboard/missions/new"
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          New Mission
        </Link>
      </div>

      <form
        method="get"
        className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-surface-border bg-surface-raised p-4"
      >
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="q" className="block text-xs font-medium text-silver-400">
            Search
          </label>
          <input
            id="q"
            name="q"
            defaultValue={searchParams.q ?? ""}
            placeholder="Description, staging airport, contact..."
            className="mt-1 w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-silver-100 placeholder:text-silver-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-xs font-medium text-silver-400">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={searchParams.status ?? ""}
            className="mt-1 rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-silver-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">All statuses</option>
            {MISSION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {MISSION_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="priority" className="block text-xs font-medium text-silver-400">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue={searchParams.priority ?? ""}
            className="mt-1 rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-silver-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">All priorities</option>
            {MISSION_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {MISSION_PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="organizationId"
            className="block text-xs font-medium text-silver-400"
          >
            Organization
          </label>
          <select
            id="organizationId"
            name="organizationId"
            defaultValue={searchParams.organizationId ?? ""}
            className="mt-1 rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-silver-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">All organizations</option>
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md border border-surface-border px-4 py-2 text-sm font-medium text-silver-300 hover:bg-surface"
        >
          Filter
        </button>
        <Link
          href="/dashboard/missions"
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
                Mission
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-silver-500">
                Staging
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-silver-500">
                Organization
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-silver-500">
                Priority
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-silver-500">
                Status
              </th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border bg-surface">
            {missions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-silver-500">
                  No missions match your filters yet.
                </td>
              </tr>
            ) : (
              missions.map((mission) => (
                <tr key={mission.id}>
                  <td className="max-w-xs truncate px-4 py-3 text-sm font-medium text-silver-100">
                    {mission.missionDescription}
                  </td>
                  <td className="px-4 py-3 text-sm text-silver-300">
                    {mission.stagingAirport}
                  </td>
                  <td className="px-4 py-3 text-sm text-silver-300">
                    {mission.organization?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${MISSION_PRIORITY_BADGE_CLASSES[mission.priority]}`}
                    >
                      {MISSION_PRIORITY_LABELS[mission.priority]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-silver-300">
                    {MISSION_STATUS_LABELS[mission.status]}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="flex justify-end gap-4">
                      <Link
                        href={`/dashboard/missions/${mission.id}/edit`}
                        className="font-medium text-silver-300 hover:text-silver-100"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteMissionAction.bind(null, mission.id)}
                        confirmMessage="Delete this mission? This cannot be undone."
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
