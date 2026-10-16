"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema } from "@/lib/validation/auth";

/**
 * Server Actions: the only place credentials are handled.
 *
 * Why Server Actions?
 * - The password goes in a POST body to our server and then to Supabase,
 *   never in a URL.
 * - Next.js checks the Origin header on every action (built-in CSRF protection).
 *
 * On success each action ends with redirect(): Next performs a soft
 * navigation, so the dashboard arrives inside the same document — no reload.
 * On failure the action returns an error object that the form renders
 * inline, with the email preserved.
 */

export type AuthFormState = {
  error?: string;
  fieldErrors?: Partial<Record<"email" | "password", string>>;
  email?: string;
};

const GENERIC_ERROR = "Something went wrong. Please try again.";

export async function signIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error, formData);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // Generic message: don't reveal whether the email exists.
    return { error: "Invalid email or password.", email: parsed.data.email };
  }

  redirect("/dashboard");
}

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error, formData);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(parsed.data);

  if (error) {
    return {
      error: error.code === "user_already_exists" ? "An account with this email already exists." : GENERIC_ERROR,
      email: parsed.data.email,
    };
  }

  // With "Confirm email" turned OFF in Supabase, signUp returns a session
  // right away. If it's still ON, there's no session, so tell the presenter.
  if (!data.session) {
    return {
      error: "Account created, but email confirmation is enabled. Disable it in Supabase → Authentication → Sign In / Providers → Email.",
      email: parsed.data.email,
    };
  }

  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  // The default scope is "global": it revokes the refresh tokens for every
  // session this user has, then clears the auth cookies on this response.
  await supabase.auth.signOut();
  redirect("/login");
}

function fromZod(
  error: { issues: { path: PropertyKey[]; message: string }[] },
  formData: FormData,
): AuthFormState {
  const fieldErrors: AuthFormState["fieldErrors"] = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if ((key === "email" || key === "password") && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  const email = formData.get("email");
  return { fieldErrors, email: typeof email === "string" ? email : undefined };
}
