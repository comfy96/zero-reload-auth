import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/user";
import { StatCard } from "@/components/dashboard/StatCard";
import { SessionTimeline } from "@/components/dashboard/SessionTimeline";
import { SettingsMenu } from "@/components/ui/SettingsMenu";
import { maskEmail, formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * Protected route, guarded in two layers:
 * 1. middleware.ts redirects before rendering (fast path).
 * 2. This server-side check (defense in depth). If the middleware were
 *    misconfigured, we still fail closed.
 */
export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const name = user.email.split("@")[0];

  return (
    <section className="py-12">
      <header>
        <div>
          <p className="text-[13px] font-medium text-secondary">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">Hello, {name}</h1>
          <p className="mt-2 leading-relaxed text-secondary">You&apos;re signed in. Try refreshing: you&apos;ll stay right here.</p>
        </div>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard id="stat-status" label="Session" value="Active" tone="success" />
        <StatCard id="stat-email" label="Signed in as" value={maskEmail(user.email)} />
        <StatCard id="stat-joined" label="Member since" value={formatDateTime(user.createdAt, { dateOnly: true })} />
        <StatCard id="stat-last" label="Last sign-in" value={user.lastSignInAt ? formatDateTime(user.lastSignInAt) : "-"} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <SessionTimeline />
        <aside className="rounded-card border border-border bg-surface p-8 lg:col-span-2">
          <h2 className="text-base font-semibold text-foreground">Try it live</h2>
          <ol className="mt-5 space-y-3.5 text-sm leading-relaxed text-secondary">
            {[
              "Note the “Page loaded” time in the navbar.",
              "Press ⌘R / F5: you stay authenticated (cookie session).",
              "Click Log out: the page fully reloads back to /login.",
              "Log back in: a full reload again — the badge time resets.",
            ].map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border text-xs font-medium text-secondary">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </aside>
      </div>

      <SettingsMenu />
    </section>
  );
}
