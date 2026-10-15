/** "comfort@example.com" becomes "c•••••t@example.com". Avoids showing full PII on screen. */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "•••";
  if (local.length <= 2) return `${local[0] ?? ""}•@${domain}`;
  return `${local[0]}${"•".repeat(Math.min(local.length - 2, 5))}${local.at(-1)}@${domain}`;
}

/**
 * Formats in the runtime's local time zone (the server's clock for the
 * dashboard, which the user sees). Do not pin UTC here: it made "Last
 * sign-in" an hour off from the local time shown in the nav badge.
 */
export function formatDateTime(iso: string, opts: { dateOnly?: boolean } = {}): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    ...(opts.dateOnly ? {} : { timeStyle: "short" }),
  }).format(date);
}
