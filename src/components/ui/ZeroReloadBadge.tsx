"use client";

import { useEffect, useState } from "react";

/**
 * The workshop's "proof" widget.
 *
 * `performance.timeOrigin` is set once, when the browser loads the HTML
 * document. Soft navigations (page links, login, signup, logout) leave it
 * unchanged. Only a real full page reload resets it. Since this badge lives
 * in the root layout, it stays mounted across every soft navigation.
 */
export function ZeroReloadBadge() {
  const [loadedAt, setLoadedAt] = useState<string | null>(null);

  useEffect(() => {
    setLoadedAt(
      new Date(performance.timeOrigin).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    );
  }, []);

  return (
    <div
      id="zero-reload-badge"
      title="Time the HTML document was loaded. It only changes on a full page reload."
      className="hidden items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-secondary sm:inline-flex"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-success" />
      Page loaded <span className="font-mono text-foreground">{loadedAt ?? "--:--:--"}</span>
    </div>
  );
}
