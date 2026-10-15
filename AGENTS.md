<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Design system

The design system lives in `src/app/globals.css` as CSS variables: light values on `:root`, dark values on `.dark` (the `dark` class is set on `<html>` by `next-themes` — light / dark / system, default system, no flash on load). Tokens: `--background`, `--surface`, `--border`, `--border-hover`, `--foreground`, `--secondary`, `--muted`, `--accent`, `--accent-hover`, `--accent-ink`, `--accent-text`, `--success`, `--danger`; radii `--radius-field` (10px, inputs/buttons) and `--radius-card` (14px); typefaces Geist Sans and Geist Mono via `next/font`.

`@theme inline` maps them 1:1 into Tailwind, so UI uses semantic utilities — `bg-background`, `bg-surface`, `border-border`, `text-foreground`, `text-secondary`, `text-muted`, `bg-accent` + `text-accent-ink` (AA on the accent), `text-accent-text` — plus the `.btn`, `.btn-primary`, `.btn-secondary` and `.input` classes.

Style rules: flat surfaces only (no gradients, glows, grid or noise patterns); depth comes from 1px borders, not shadows; the accent is reserved for primary buttons, links, focus rings and the highlighted word in the landing headline; motion is limited to 150ms color/border/background transitions.

`design-tokens.css` (repo root) is the original Material 3 / Figma export — kept for reference only, no longer imported by the app.
