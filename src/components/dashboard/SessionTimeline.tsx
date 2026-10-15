const STEPS = [
  { title: "Request hits middleware", body: "Reads the Supabase cookie and refreshes the token if it expired." },
  { title: "Server verifies the user", body: "getUser() validates the JWT with Supabase Auth. It never just trusts the cookie." },
  { title: "Layout seeds AuthProvider", body: "Only public user fields cross into the client context." },
  { title: "UI renders, already signed in", body: "No loading flicker and no client-side token handling." },
];

/** Static explainer of the request lifecycle, handy for presenting. */
export function SessionTimeline() {
  return (
    <article className="rounded-card border border-border bg-surface p-8 lg:col-span-3">
      <h2 className="text-base font-semibold text-foreground">How this page loaded</h2>
      <ol className="relative mt-6 space-y-6 border-l border-border pl-6">
        {STEPS.map((s) => (
          <li key={s.title} className="relative">
            <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border border-border bg-surface" />
            <p className="text-sm font-medium text-foreground">{s.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-secondary">{s.body}</p>
          </li>
        ))}
      </ol>
    </article>
  );
}
