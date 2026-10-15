/**
 * The workshop's "proof" widget.
 *
 * It shows the timestamp the server rendered this document at. Every click,
 * refresh, login and logout lands on a brand-new document, so the time
 * changes every time — there is no client-side navigation anywhere in this
 * app. The value is computed per request in the root layout, so it is baked
 * into the HTML and identical after hydration.
 */
export function ZeroReloadBadge({ loadedAt }: { loadedAt: string }) {
  return (
    <div
      id="zero-reload-badge"
      title="Time the HTML document was loaded. It only changes on a full page reload."
      className="hidden items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-secondary sm:inline-flex"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-success" />
      Page loaded <span className="font-mono text-foreground">{loadedAt}</span>
    </div>
  );
}
