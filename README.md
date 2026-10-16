# Zero Reload Auth Dashboard

A Next.js 16 (App Router) + Supabase Auth demo: **server-verified cookie sessions and zero-reload soft navigation — every link and every auth action happens inside the same document (Server Actions ending in `redirect()`), with errors rendered inline.**

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
│   │   ├── actions.ts        # Server Actions: signIn, signUp, signOut (redirect() on success)
│   │   ├── login/page.tsx    # /login
│   │   └── signup/page.tsx   # /signup
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
    │   ├── server.ts         # Cookie-backed Supabase client (HttpOnly cookies)
    │   ├── session.ts        # Session refresh + route guard (used by proxy.ts)
    │   └── user.ts           # getCurrentUser(): verified, cached, public fields only
    ├── validation/auth.ts    # Zod schemas (validated inside the Server Actions)
    └── format.ts             # maskEmail, formatDateTime
```

## How auth navigation works

| Action | What happens |
|---|---|
| **Sign up / Log in** | The form is wired with `useActionState` to a Server Action (`signIn` / `signUp` in `(auth)/actions.ts`). The action validates, calls Supabase, and on success ends with `redirect("/dashboard")` — a **soft navigation**: the dashboard streams into the page that's already open. While it runs, `useFormStatus` reports pending — the button shows "Logging in…" / "Creating account…" with a spinner, and the inputs disable. |
| **Refresh** | `proxy.ts` reads the Supabase cookie, refreshes the token if needed, and the server renders the dashboard already signed in. |
| **Log out** | The button calls the `signOut` Server Action: it revokes the session, clears the auth cookies and `redirect()`s to `/login`. The navbar swaps to Log in / Sign up instantly (`clearUser()`), and the page follows with a soft navigation. |
| **Failed login** | The action returns `{ error, fieldErrors, email }`; the form renders it **inline** — form errors in a banner under the fields, field errors under each input. No URL params, no reload. The email field keeps its value and the cursor lands in the password field, so only the password has to be retyped. |
| **Page links** | Every internal link is a `next/link` `<Link>`; navigations are client-side, so the shared layout (navbar + badge) never re-mounts. |

**Proof:** the **"Page loaded"** badge in the navbar is set once per document — on mount, from `performance.timeOrigin`. Soft navigations (page links, login, signup, logout) never change it. Only a real browser refresh (⌘R / F5) loads a new document and resets the clock. The badge lives in the root layout, so it stays mounted across every soft navigation.

## Security notes

- Credentials are only handled in the Server Actions (POST body, validated with Zod, generic error messages). Next.js checks the Origin header on every action — built-in CSRF protection — and credentials never travel in a URL.
- The server always uses `getUser()`, which verifies the JWT with Supabase. It never trusts a decoded cookie.
- Two layers of route protection: the proxy redirect plus a server check in the page. If config is missing, it fails closed.
- Strict nonce-based CSP, `X-Frame-Options: DENY`, `nosniff`, `Permissions-Policy`, HSTS, and `no-store` on auth pages.
- Email is masked in the UI. **Auth cookies are `HttpOnly`** — both cookie adapters enforce it, and the app has no browser Supabase client, so client JS never needs to see the tokens. A full page reload still restores the session: the cookies ride on every request.
- **TODO(security):** for production, turn email confirmation back on, enable leaked-password protection, consider MFA/OAuth, and add app-level rate limiting (Supabase applies its own auth rate limits).
- **Deliberate behaviour:** every navigation and auth action happens inside the same document — `<Link>` for links, Server Actions ending in `redirect()` for auth, inline errors. The only thing that produces a document request is a manual refresh (or opening the site in a new tab).
