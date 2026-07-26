import Link from "next/link";

export default function NotFound(): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">404</p>
      <h1 className="mt-2 text-xl font-semibold text-silver-100">
        We couldn&apos;t find that
      </h1>
      <p className="mt-2 max-w-md text-sm text-silver-500">
        The record you're looking for may have been deleted, or the link is
        out of date.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
      >
        Back to Dashboard
      </Link>
    </main>
  );
}
