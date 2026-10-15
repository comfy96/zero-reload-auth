export function StatCard({
  id,
  label,
  value,
  tone,
}: {
  id: string;
  label: string;
  value: string;
  /** Optional emphasis for status values (e.g. "Active"). */
  tone?: "success";
}) {
  return (
    <article id={id} className="rounded-card border border-border bg-surface p-6">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className={`mt-2.5 truncate text-xl font-semibold ${tone === "success" ? "text-success" : "text-foreground"}`}>
        {value}
      </p>
    </article>
  );
}
