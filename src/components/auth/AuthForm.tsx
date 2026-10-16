"use client";

import { useEffect, useRef, useState } from "react";

/**
 * One form component handles both login and signup.
 *
 * Both modes submit as native HTML forms to the /api/auth route handlers:
 * a real document POST with no fetch, no useActionState and no client-side
 * error state. The handler ends in a redirect, so the browser leaves this
 * document and loads the next one. Errors come back on that next document
 * as `?error=...` query params and are rendered server-side.
 */
type Mode = "login" | "signup";

const COPY: Record<Mode, { title: string; subtitle: string; cta: string; alt: string; altHref: string; altCta: string }> = {
  login: {
    title: "Welcome back",
    subtitle: "Log in to your dashboard.",
    cta: "Log in",
    alt: "New here?",
    altHref: "/signup",
    altCta: "Create an account",
  },
  signup: {
    title: "Create your account",
    subtitle: "Sign up and land on your dashboard instantly.",
    cta: "Create account",
    alt: "Already have an account?",
    altHref: "/login",
    altCta: "Log in",
  },
};

export function AuthForm({
  mode,
  formError,
  fieldErrors,
}: {
  mode: Mode;
  /** Server-rendered error for the whole form (from `?error=...`). */
  formError?: string;
  /** Server-rendered per-field errors (from `?error=...`). */
  fieldErrors?: Partial<Record<"email" | "password", string>>;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const copy = COPY[mode];

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Every failed attempt comes back as a fresh document, so the fields are
  // empty. Remember the attempted email for this tab on submit, then put it
  // back as soon as the page loads — a failed login never asks for the email
  // again, and the retry only needs the password.
  useEffect(() => {
    const el = emailRef.current;
    if (!el || el.value) return;
    try {
      const remembered = window.sessionStorage.getItem("auth:last-email");
      if (remembered) el.value = remembered;
    } catch {}
  }, []);

  // After a failed attempt, put the cursor where the fix is needed.
  useEffect(() => {
    if (fieldErrors?.email) emailRef.current?.focus();
    else if (formError || fieldErrors?.password) passwordRef.current?.focus();
  }, [formError, fieldErrors]);

  function rememberEmail(event: React.FormEvent<HTMLFormElement>) {
    const value = (event.currentTarget.elements.namedItem("email") as HTMLInputElement | null)?.value;
    if (!value) return;
    try {
      window.sessionStorage.setItem("auth:last-email", value);
    } catch {}
  }

  return (
    <div className="w-full max-w-[420px] rounded-card border border-border bg-surface p-8 sm:p-10">
      <h1 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">{copy.title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-secondary">{copy.subtitle}</p>

      <form
        id={`${mode}-form`}
        action={`/api/auth/${mode}`}
        method="POST"
        onSubmit={rememberEmail}
        className="mt-8 space-y-6"
        noValidate
      >
        <Field label="Email" htmlFor="email" error={fieldErrors?.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@company.com"
            ref={emailRef}
            autoFocus={Boolean(fieldErrors?.email)}
            aria-invalid={Boolean(fieldErrors?.email)}
            aria-describedby={fieldErrors?.email ? "email-error" : undefined}
            className="input"
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          error={fieldErrors?.password}
          hint={mode === "signup" ? "At least 8 characters." : undefined}
        >
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={mode === "signup" ? 8 : undefined}
              maxLength={128}
              placeholder="••••••••"
              ref={passwordRef}
              autoFocus={Boolean(formError || fieldErrors?.password)}
              aria-invalid={Boolean(fieldErrors?.password)}
              aria-describedby={fieldErrors?.password ? "password-error" : undefined}
              className="input pr-16"
            />
            <button
              id="toggle-password"
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-1.5 my-auto h-8 rounded-md px-2 text-xs font-medium text-secondary transition-colors duration-150 hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </Field>

        {formError && (
          <p
            id="form-error"
            role="alert"
            className="rounded-field border border-danger/40 bg-danger/5 px-3.5 py-3 text-sm text-danger"
          >
            {formError}
          </p>
        )}

        <button id={`${mode}-submit`} type="submit" className="btn-primary w-full">
          {copy.cta}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-secondary">
        {copy.alt}{" "}
        <a
          id={`${mode}-alt-link`}
          href={copy.altHref}
          className="font-medium text-accent-text transition-colors duration-150 hover:text-foreground"
        >
          {copy.altCta}
        </a>
      </p>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-[13px] font-medium text-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
