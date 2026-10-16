import { getCurrentUser } from "@/lib/supabase/user";

const FEATURES = [
  { title: "Server Actions", body: "Credentials go to the server in a POST body, never a URL. CSRF is checked on every call." },
  { title: "Cookie sessions", body: "Supabase tokens live in cookies, refreshed by middleware, so a page refresh keeps you signed in." },
  { title: "Protected routes", body: "Middleware verifies the Supabase cookie on every request. Signed out? Protected pages bounce you to /login." },
];

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <section className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center py-24 text-center">
      <span className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-secondary">
        Next.js App Router · Supabase Auth
      </span>

      <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-[-0.025em] text-foreground sm:text-5xl lg:text-6xl">
        Authentication with <span className="text-accent-text">zero page reloads</span>
      </h1>

      <p className="mt-5 max-w-xl text-base leading-relaxed text-secondary sm:text-lg">
        Sign up, log in, refresh, and log out. The session persists and the UI updates instantly, all in one document.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {user ? (
          <a id="cta-dashboard" href="/dashboard" className="btn-primary">
            Go to dashboard →
          </a>
        ) : (
          <>
            <a id="cta-signup" href="/signup" className="btn-primary">
              Get started →
            </a>
            <a id="cta-login" href="/login" className="btn-secondary">
              I have an account
            </a>
          </>
        )}
      </div>

      <div className="mt-20 grid w-full max-w-5xl gap-4 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <article
            key={f.title}
            className="rounded-card border border-border bg-surface p-8 text-left transition-colors duration-150 hover:border-border-hover"
          >
            <h2 className="text-base font-semibold text-foreground">{f.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-secondary">{f.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
