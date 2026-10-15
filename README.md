# Zero Reload Auth Dashboard

A Next.js 16 (App Router) + Supabase Auth demo: **server-verified cookie sessions, soft page-to-page navigation, and deliberate full page loads on auth actions (sign up, log in, log out).**

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
│   │   ├── actions.ts        # Server Actions: signIn, signUp, signOut
│   │   ├── layout.tsx        # Centers the auth card
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
    │   ├── server.ts         # Cookie-backed Supabase client for server code
    │   ├── session.ts        # Session refresh + route guard (used by proxy.ts)
    │   └── user.ts           # getCurrentUser(): verified, cached, public fields only
    ├── validation/auth.ts    # Zod schemas (server-side validation)
    └── format.ts             # maskEmail, formatDateTime
```

## How auth navigation works

| Action | What happens |
|---|---|
| **Sign up / Log in** | The form posts to a Server Action with `fetch`. On success the action returns `{ navigateTo }` and the client hard-navigates with `window.location` — a **full page load**. The session cookie is already set, so the dashboard renders signed in. |
| **Refresh** | `proxy.ts` reads the Supabase cookie, refreshes the token if needed, and the server renders the dashboard already signed in. |
| **Log out** | `clearUser()` blanks the UI instantly. Then the `signOut` action revokes the session, clears the cookies, and the client hard-navigates to `/login` (full page load). |
| **Failed login** | The action returns the error; the form re-renders in place (no reload with JS available). The email is preserved and the cursor lands in the password field — only the password has to be retyped. Even a no-JS full POST keeps the email in the re-rendered document. After a later reload of an auth page, the remembered email fills the form in automatically 7 seconds after load (deliberate demo touch). |
| **Page links** | Home ↔ Dashboard stay soft: Next streams the new route into the open document, no reload. |

**Proof:** the **"Page loaded"** badge in the navbar shows `performance.timeOrigin`. It resets on every full reload (auth actions, manual refresh) and stays put across soft navigation.

## Security notes

- Credentials are only handled in Server Actions (POST body, Origin-checked CSRF protection, validated with Zod, generic error messages).
- The server always uses `getUser()`, which verifies the JWT with Supabase. It never trusts a decoded cookie.
- Two layers of route protection: the proxy redirect plus a server check in the page. If config is missing, it fails closed.
- Strict nonce-based CSP, `X-Frame-Options: DENY`, `nosniff`, `Permissions-Policy`, HSTS, and `no-store` on auth pages.
- Email is masked in the UI. No tokens reach client JS state.
- **TODO(security):** Supabase SSR cookies are not `HttpOnly` (the library design allows browser clients). This app never reads them in the browser, and the CSP limits XSS.
- **TODO(security):** for production, turn email confirmation back on, enable leaked-password protection, consider MFA/OAuth, and add app-level rate limiting (Supabase applies its own auth rate limits).
- **Deliberate behaviour:** sign in, sign up and log out are full page loads, so the session cookie is always resolved on a fresh document; page-to-page navigation (Home ↔ Dashboard) stays soft.
