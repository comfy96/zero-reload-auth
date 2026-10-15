# Zero Reload Auth Dashboard

A Next.js 16 (App Router) + Supabase Auth demo: **server-verified cookie sessions and deliberate full page loads everywhere — every link and every auth action is a real document request (POST → 303 → GET), with errors rendered server-side from `?error=` codes.**

## Quick start

```bash
npm install
cp .env.local.example .env.local   # add your Supabase URL + anon key
npm run dev                        # http://127.0.0.1:3000
```

### Supabase setup (demo environment)

1. Create a project at [supabase.com](https://supabase.com).
2. **Project Settings → API**: copy the *Project URL* and *anon/publishable key* into `.env.local`.
3. **Authentication → Sign In / Providers → Email**: turn **"Confirm email" OFF** so signup lands straight on the dashboard.

## Folder structure

```
src/
├── proxy.ts                  # Runs before every request: CSP nonce, session refresh, route guards
├── app/                      # Routes (App Router). Folders = URLs
│   ├── layout.tsx            # Root layout: reads the user on the server, seeds <AuthProvider>
│   ├── page.tsx              # Landing page  (/)
│   ├── globals.css           # Tailwind v4 design tokens + component classes
│   ├── (auth)/               # Route group: shared layout, no URL segment
│   │   ├── layout.tsx        # Centers the auth card
│   │   ├── login/page.tsx    # /login  (renders ?error= server-side)
│   │   └── signup/page.tsx   # /signup (renders ?error= server-side)
│   ├── api/auth/             # Route handlers: the native form POST targets
│   │   ├── login/route.ts    # POST → 303 /dashboard | /login?error=...
│   │   ├── signup/route.ts   # POST → 303 /dashboard | /signup?error=...
│   │   └── logout/route.ts   # POST → 303 /login (clears the session)
│   └── dashboard/page.tsx    # /dashboard (protected)
├── components/
│   ├── auth/                 # AuthForm (login + signup), LogoutButton
│   ├── dashboard/            # StatCard, SessionTimeline
│   └── ui/                   # Navbar, Background, Spinner, ZeroReloadBadge
├── context/
│   └── AuthProvider.tsx      # Client-side mirror of the server's auth state
└── lib/
    ├── supabase/
    │   ├── env.ts            # Reads env vars, fails loudly if missing
    │   ├── server.ts         # Cookie-backed Supabase client for server code
    │   ├── session.ts        # Session refresh + route guard (used by proxy.ts)
    │   └── user.ts           # getCurrentUser(): verified, cached, public fields only
    ├── validation/auth.ts    # Zod schemas (server-side validation)
    ├── auth-errors.ts        # ?error= codes ↔ messages (server-rendered)
    ├── security.ts           # same-origin check for the POST endpoints
    ├── http.ts               # 303 "See Other" helper (relative Location)
    └── format.ts             # maskEmail, formatClockTime, formatDateTime
```

## How auth navigation works

| Action | What happens |
|---|---|
| **Sign up / Log in** | The form is a native `<form method="POST">` posting to `/api/auth/login` (or `/api/auth/signup`) — a real document request, no fetch. The route handler validates, calls Supabase, and answers `303 See Other`: **/dashboard** on success (the session cookies ride on that same response) or back to the auth page with an `?error=` code on failure. The browser follows with a plain GET, so the dashboard arrives as a fresh document, already signed in. |
| **Refresh** | `proxy.ts` reads the Supabase cookie, refreshes the token if needed, and the server renders the dashboard already signed in. |
| **Log out** | The button is a native form POST to `/api/auth/logout`. The handler revokes the session, clears the auth cookies, and 303-redirects to `/login` — another full document load. |
| **Failed login** | The handler redirects back with `?error=invalid_credentials`; the message is rendered **server-side** on the new document. The email is remembered for the tab and prefilled on load, and the cursor lands in the password field — only the password has to be retyped. |
| **Page links** | Every link is a plain `<a href>`: no `next/link`, no prefetching, no client-side router. Home ↔ Dashboard reloads the whole document, like a traditional multi-page app. |

**Proof:** the **"Page loaded"** badge in the navbar shows the timestamp the server rendered the document at (computed per request in the root layout, baked into the HTML). It changes on every click, refresh and auth action — visible proof that every navigation is a full page load.

## Security notes

- Credentials are only handled in the `/api/auth` route handlers (POST body, validated with Zod, generic error messages). Route handlers don't get the automatic Origin check that Server Actions have, so they verify the Origin header themselves (`src/lib/security.ts`).
- The server always uses `getUser()`, which verifies the JWT with Supabase. It never trusts a decoded cookie.
- Two layers of route protection: the proxy redirect plus a server check in the page. If config is missing, it fails closed.
- Strict nonce-based CSP, `X-Frame-Options: DENY`, `nosniff`, `Permissions-Policy`, HSTS, and `no-store` on auth pages.
- Email is masked in the UI. No tokens reach client JS state.
- **TODO(security):** Supabase SSR cookies are not `HttpOnly` (the library design allows browser clients). This app never reads them in the browser, and the CSP limits XSS.
- **TODO(security):** for production, turn email confirmation back on, enable leaked-password protection, consider MFA/OAuth, and add app-level rate limiting (Supabase applies its own auth rate limits).
- **Deliberate behaviour:** every navigation and auth action is a full page load — plain `<a>` links, native form POSTs (`303 See Other` → GET), no client-side router and no prefetching. The cookie session is therefore always resolved on a fresh document.
