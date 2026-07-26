"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): JSX.Element {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
        Something went wrong
      </p>
      <h1 className="mt-2 text-xl font-semibold text-silver-100">
        AeroResponse hit an unexpected error
      </h1>
      <p className="mt-2 max-w-md text-sm text-silver-500">
        {error.message || "Please try again, or head back to the login page."}
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          Try again
        </button>
        <Link
          href="/login"
          className="rounded-md border border-surface-border px-4 py-2 text-sm font-medium text-silver-300 hover:bg-surface-raised"
        >
          Go to Login
        </Link>
      </div>
    </main>
  );
}
