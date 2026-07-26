import { prisma } from "@/lib/db/prisma";

export default async function DashboardPage(): Promise<JSX.Element> {
  const [openMissionCount, pilotCount, aircraftCount, organizationCount] = await Promise.all([
    prisma.mission.count({ where: { status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] } } }),
    prisma.pilot.count(),
    prisma.aircraft.count(),
    prisma.organization.count(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-silver-100">Dashboard</h1>
      <p className="mt-1 text-sm text-silver-500">
        The matching engine (Milestone 4) is next. For now, manage missions,
        organizations, pilots, and aircraft.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-surface-border bg-surface-raised p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-silver-500">
            Active Missions
          </p>
          <p className="mt-2 text-2xl font-semibold text-brand-500">
            {openMissionCount}
          </p>
        </div>
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
    </div>
  );
}
