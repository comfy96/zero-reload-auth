"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, signUp, type AuthFormState } from "@/app/(auth)/actions";
import { Spinner } from "@/components/ui/Spinner";

/**
 * One form component handles both login and signup.
 *
 * `useActionState` wires the form to a Server Action (submitted with fetch,
 * not a full-page POST) and `useFormStatus` drives the pending UI: the
 * button shows the pending label with a spinner, and the inputs disable.
 * Success ends with redirect() inside the action — a soft navigation.
 * Errors are returned state and render inline, preserving the email.
 */
type Mode = "login" | "signup";

const COPY: Record<Mode, { title: string; subtitle: string; cta: string; pending: string; alt: string; altHref: string; altCta: string }> = {
  login: {
    title: "Welcome back",
    subtitle: "Log in to your dashboard.",
    cta: "Log in",
    pending: "Logging in…",
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
  const [state, formAction] = useActionState<AuthFormState, FormData>(action, {});
  const [showPassword, setShowPassword] = useState(false);
  const copy = COPY[mode];

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // After a failed attempt, put the cursor where the fix is needed. The email
  // is preserved (state.email repopulates it), so a wrong password only ever
  // needs the password retyped.
  useEffect(() => {
    if (state.fieldErrors?.email) emailRef.current?.focus();
    else if (state.error || state.fieldErrors?.password) passwordRef.current?.focus();
  }, [state]);

  // A soft navigation away and back remounts this form empty. Remember the
  // attempted email for this tab and prefill it, so a failed login never
  // asks for the email again.
  useEffect(() => {
    const el = emailRef.current;
    if (!el || el.value) return;
    try {
      const remembered = window.sessionStorage.getItem("auth:last-email");
      if (remembered) el.value = remembered;
    } catch {}
  }, []);

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

      <form id={`${mode}-form`} action={formAction} onSubmit={rememberEmail} className="mt-8 space-y-6" noValidate>
        <FormFields
          mode={mode}
          state={state}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword((v) => !v)}
          emailRef={emailRef}
          passwordRef={passwordRef}
        />
      </form>

      <p className="mt-8 text-center text-sm text-secondary">
        {copy.alt}{" "}
        <Link
          id={`${mode}-alt-link`}
          href={copy.altHref}
          className="font-medium text-accent-text transition-colors duration-150 hover:text-foreground"
        >
          {copy.altCta}
        </Link>
      </p>
    </div>
  );
}

/**
 * The fields live in a child of the <form> so `useFormStatus()` can report
 * the pending state of the surrounding submission.
 */
function FormFields({
  mode,
  state,
  showPassword,
  onTogglePassword,
  emailRef,
  passwordRef,
}: {
  mode: Mode;
  state: AuthFormState;
  showPassword: boolean;
  onTogglePassword: () => void;
  emailRef: React.RefObject<HTMLInputElement | null>;
  passwordRef: React.RefObject<HTMLInputElement | null>;
}) {
  const { pending } = useFormStatus();
  const copy = COPY[mode];

  return (
    <>
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
          disabled={pending}
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
            disabled={pending}
            autoFocus={Boolean(state.error || state.fieldErrors?.password)}
            aria-invalid={Boolean(state.fieldErrors?.password)}
            aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
            className="input pr-16"
          />
          <button
            id="toggle-password"
            type="button"
            onClick={onTogglePassword}
            disabled={pending}
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

      <button id={`${mode}-submit`} type="submit" disabled={pending} className="btn-primary w-full">
        {pending && <Spinner />}
        {pending ? copy.pending : copy.cta}
      </button>
    </>
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
