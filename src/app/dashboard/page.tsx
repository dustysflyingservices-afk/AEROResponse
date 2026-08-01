import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import {
  MISSION_PRIORITY_BADGE_CLASSES,
  MISSION_PRIORITY_LABELS,
  MISSION_STATUS_LABELS,
} from "@/lib/constants/mission";

const ACTIVE_STATUSES = ["NEEDS_REVIEW", "OPEN", "ASSIGNED", "IN_PROGRESS"] as const;

export default async function DashboardPage(): Promise<JSX.Element> {
  const [activeMissions, pilotCount, aircraftCount, organizationCount] = await Promise.all([
    prisma.mission.findMany({
      where: { status: { in: [...ACTIVE_STATUSES] } },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: 10,
    }),
    prisma.pilot.count(),
    prisma.aircraft.count(),
    prisma.organization.count(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-silver-100">Dashboard</h1>
      <p className="mt-1 text-sm text-silver-500">
        Manage missions, organizations, pilots, and aircraft.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-surface-border bg-surface-raised p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-silver-500">
            Organizations
          </p>
          <p className="mt-2 text-2xl font-semibold text-brand-500">
            {organizationCount}
          </p>
        </div>
        <div className="rounded-lg border border-surface-border bg-surface-raised p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-silver-500">
            Registered Pilots
          </p>
          <p className="mt-2 text-2xl font-semibold text-brand-500">{pilotCount}</p>
        </div>
        <div className="rounded-lg border border-surface-border bg-surface-raised p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-silver-500">
            Registered Aircraft
          </p>
          <p className="mt-2 text-2xl font-semibold text-brand-500">{aircraftCount}</p>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-silver-100">Active Missions</h2>
          <Link
            href="/dashboard/missions"
            className="text-sm font-medium text-silver-400 hover:text-silver-200"
          >
            View all missions
          </Link>
        </div>

        {activeMissions.length === 0 ? (
          <p className="mt-3 text-sm text-silver-500">
            No open, assigned, or in-progress missions right now.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-surface-border rounded-lg border border-surface-border bg-surface-raised">
            {activeMissions.map((mission) => (
              <li key={mission.id}>
                <Link
                  href={`/dashboard/missions/${mission.id}/edit`}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-surface"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brand-400 hover:text-brand-500">
                      {mission.missionDescription}
                    </p>
                    <p className="mt-0.5 text-xs text-silver-500">
                      Staging: {mission.stagingAirport ?? "TBD"} &middot;{" "}
                      {MISSION_STATUS_LABELS[mission.status]}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${MISSION_PRIORITY_BADGE_CLASSES[mission.priority]}`}
                  >
                    {MISSION_PRIORITY_LABELS[mission.priority]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
