/**
 * Next.js's redirect() throws a special error internally to interrupt
 * rendering and trigger navigation. When a Server Action is called directly
 * from client code (rather than via a native <form action>), that signal can
 * end up in a normal try/catch alongside real errors. This helper lets forms
 * tell the difference and re-throw the redirect instead of showing a bogus
 * error message.
 */
export function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}
