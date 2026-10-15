import { createClient } from "@/lib/supabase/server";
import { signUpSchema } from "@/lib/validation/auth";
import { codesFromZodIssues } from "@/lib/auth-errors";
import { seeOther } from "@/lib/http";
import { isSameOrigin } from "@/lib/security";

/**
 * POST /api/auth/signup — the native form target for /signup.
 *
 * Same shape as the login handler: a real document POST in, a 303 redirect
 * out, with the error (if any) carried on the next URL as `?error=...`.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return new Response("Forbidden", { status: 403 });

  const parsed = signUpSchema.safeParse(Object.fromEntries(await request.formData()));
  if (!parsed.success) {
    return seeOther(`/signup?error=${codesFromZodIssues(parsed.error.issues)}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(parsed.data);

  if (error) {
    const code = error.code === "user_already_exists" ? "email_exists" : "generic";
    return seeOther(`/signup?error=${code}`);
  }

  // With "Confirm email" turned OFF in Supabase, signUp returns a session
  // right away. If it's still ON, there's no session, so tell the presenter.
  if (!data.session) {
    return seeOther("/signup?error=confirmation_required");
  }

  return seeOther("/dashboard");
}
