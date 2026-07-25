"use client";

import { signOut } from "next-auth/react";

export function SignOutButton(): JSX.Element {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-md border border-surface-border px-3 py-1.5 text-sm font-medium text-silver-300 transition hover:bg-surface hover:text-silver-100"
    >
      Sign out
    </button>
  );
}
