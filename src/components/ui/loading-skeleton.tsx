export function TableSkeleton({ rows = 5 }: { rows?: number }): JSX.Element {
  return (
    <div className="mt-6 animate-pulse overflow-hidden rounded-lg border border-surface-border">
      <div className="h-10 bg-surface-raised" />
      <div className="divide-y divide-surface-border bg-surface">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="h-12 bg-surface" />
        ))}
      </div>
    </div>
  );
}

export function PageHeaderSkeleton(): JSX.Element {
  return (
    <div className="flex animate-pulse items-center justify-between">
      <div className="space-y-2">
        <div className="h-6 w-40 rounded bg-surface-raised" />
        <div className="h-3 w-64 rounded bg-surface-raised" />
      </div>
      <div className="h-9 w-32 rounded bg-surface-raised" />
    </div>
  );
}

export function ListPageSkeleton(): JSX.Element {
  return (
    <div>
      <PageHeaderSkeleton />
      <TableSkeleton />
    </div>
  );
}

export function FormPageSkeleton(): JSX.Element {
  return (
    <div className="max-w-lg animate-pulse space-y-4">
      <div className="h-6 w-48 rounded bg-surface-raised" />
      <div className="h-10 rounded bg-surface-raised" />
      <div className="h-10 rounded bg-surface-raised" />
      <div className="h-10 rounded bg-surface-raised" />
      <div className="h-9 w-32 rounded bg-surface-raised" />
    </div>
  );
}
