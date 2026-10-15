/**
 * Shared layout for /login and /signup. `(auth)` is a route group:
 * it organizes files without adding a segment to the URL.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <section className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-5 py-12">{children}</section>;
}
