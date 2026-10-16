import { createClient } from "@/lib/supabase/server";
import { signInSchema } from "@/lib/validation/auth";
import { codesFromZodIssues } from "@/lib/auth-errors";
import { seeOther } from "@/lib/http";
import { isSameOrigin } from "@/lib/security";

/**
 * POST /api/auth/login — the native form target for /login.
 *
 * A route handler can't live at /login itself (it would conflict with the
 * page), so the form posts here as a real document request: no fetch, no
 * Server Action. Every path ends in a redirect and the browser follows it
 * with a GET:
 *
 * - success → 303 /dashboard (the new auth cookies ride on this response)
 * - failure → 303 /login?error=... (the page renders the error server-side)
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return new Response("Forbidden", { status: 403 });

  const parsed = signInSchema.safeParse(Object.fromEntries(await request.formData()));
  if (!parsed.success) {
    return seeOther(`/login?error=${codesFromZodIssues(parsed.error.issues)}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // Generic message: don't reveal whether the email exists.
    return seeOther("/login?error=invalid_credentials");
  }

  return seeOther("/dashboard");
}
