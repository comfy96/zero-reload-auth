/**
 * Next.js validates the Origin header on Server Actions automatically.
 * Route Handlers don't get that for free, so the auth POST endpoints check
 * it themselves: browsers send an Origin header on form POSTs, and when it
 * is present it must be our own host. Requests without one (curl, tooling)
 * cannot carry a cross-site session cookie anyway (SameSite=Lax).
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}
