"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { signIn, signUp, type AuthFormState } from "@/app/(auth)/actions";
import { Spinner } from "@/components/ui/Spinner";

/**
 * One form component handles both login and signup.
 *
 * `useActionState` wires the form to a Server Action:
 * - The browser submits with fetch, not a full-page POST.
 * - `isPending` drives the loading UI.
 * - Returned errors re-render in place. On success the action returns
 *   `navigateTo` and we hard-navigate with window.location, so auth
 *   intentionally does a full page load.
 */
type Mode = "login" | "signup";

const COPY: Record<Mode, { title: string; subtitle: string; cta: string; pending: string; alt: string; altHref: string; altCta: string }> = {
  login: {
    title: "Welcome back",
    subtitle: "Log in to your dashboard.",
    cta: "Log in",
    pending: "Signing in…",
    alt: "New here?",
    altHref: "/signup",
    altCta: "Create an account",
  },
  signup: {
    title: "Create your account",
    subtitle: "Sign up and land on your dashboard instantly.",
    cta: "Create account",
    pending: "Creating account…",
    alt: "Already have an account?",
    altHref: "/login",
    altCta: "Log in",
  },
};

export function AuthForm({ mode }: { mode: Mode }) {
  const action = mode === "login" ? signIn : signUp;
  const [state, formAction, isPending] = useActionState<AuthFormState, FormData>(action, {});
  const [showPassword, setShowPassword] = useState(false);
  const copy = COPY[mode];

  // Full page load on success — intentional for auth actions.
  useEffect(() => {
    if (state.navigateTo) window.location.assign(state.navigateTo);
  }, [state.navigateTo]);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // After a failed attempt, put the cursor where the fix is needed. The email
  // is preserved (state.email repopulates it), so a wrong password only ever
  // needs the password retyped.
  useEffect(() => {
    if (state.fieldErrors?.email) emailRef.current?.focus();
    else if (state.error || state.fieldErrors?.password) passwordRef.current?.focus();
  }, [state]);

  // Auth pages are served no-store, so browsers don't restore form values on
  // their own. Remember the attempted email for this tab and prefill it after
  // any reload, so a failed login never asks for the email again.
  useEffect(() => {
    if (state.email) {
      try { window.sessionStorage.setItem("auth:last-email", state.email); } catch {}
    }
  }, [state.email]);

  // Deliberate 7-second empty window after a reload: the form looks blank at
  // first, then the remembered email fills itself in (measured from page load,
  // so slow hydration doesn't stretch it). Change 7000 to tune the delay.
  useEffect(() => {
    const el = emailRef.current;
    if (!el || el.value) return;

    let remembered: string | null = null;
    try {
      remembered = window.sessionStorage.getItem("auth:last-email");
    } catch {}
    if (!remembered) return;
    const email = remembered;

    const timer = window.setTimeout(() => {
      if (emailRef.current && !emailRef.current.value) emailRef.current.value = email;
    }, Math.max(0, 7000 - (Date.now() - performance.timeOrigin)));
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-[420px] rounded-card border border-border bg-surface p-8 sm:p-10">
      <h1 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">{copy.title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-secondary">{copy.subtitle}</p>

      <form id={`${mode}-form`} action={formAction} className="mt-8 space-y-6" noValidate>
        <Field label="Email" htmlFor="email" error={state.fieldErrors?.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@company.com"
            defaultValue={state.email}
            ref={emailRef}
            autoFocus={Boolean(state.fieldErrors?.email)}
            aria-invalid={Boolean(state.fieldErrors?.email)}
            aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
            className="input"
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          error={state.fieldErrors?.password}
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
              autoFocus={Boolean(state.error || state.fieldErrors?.password)}
              aria-invalid={Boolean(state.fieldErrors?.password)}
              aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
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

        {state.error && (
          <p
            id="form-error"
            role="alert"
            className="rounded-field border border-danger/40 bg-danger/5 px-3.5 py-3 text-sm text-danger"
          >
            {state.error}
          </p>
        )}

        <button id={`${mode}-submit`} type="submit" disabled={isPending} className="btn-primary w-full">
          {isPending && <Spinner />}
          {isPending ? copy.pending : copy.cta}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-secondary">
        {copy.alt}{" "}
        <Link id={`${mode}-alt-link`} href={copy.altHref} className="font-medium text-accent-text transition-colors duration-150 hover:text-foreground">
          {copy.altCta}
        </Link>
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
