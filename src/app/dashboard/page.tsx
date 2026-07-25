export default function DashboardPage(): JSX.Element {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-silver-100">Dashboard</h1>
      <p className="mt-1 text-sm text-silver-500">
        Welcome to AeroResponse. Organizations, pilots, aircraft, and mission
        tools will appear here as they come online.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-surface-border bg-surface-raised p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-silver-500">
            Active Missions
          </p>
          <p className="mt-2 text-2xl font-semibold text-brand-500">—</p>
        </div>
        <div className="rounded-lg border border-surface-border bg-surface-raised p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-silver-500">
            Registered Pilots
          </p>
          <p className="mt-2 text-2xl font-semibold text-brand-500">—</p>
        </div>
        <div className="rounded-lg border border-surface-border bg-surface-raised p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-silver-500">
            Registered Aircraft
          </p>
          <p className="mt-2 text-2xl font-semibold text-brand-500">—</p>
        </div>
      </div>
    </div>
  );
}
