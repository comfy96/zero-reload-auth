import { createClient } from "@/lib/supabase/server";
import { seeOther } from "@/lib/http";
import { isSameOrigin } from "@/lib/security";

/**
 * POST /api/auth/logout — the native form target for the Log out button.
 *
 * The default scope is "global": it revokes the refresh tokens for every
 * session this user has, then clears the auth cookies on this response.
 * The 303 makes the browser follow up with GET /login, so logout is a full
 * document load like every other navigation in this app.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return new Response("Forbidden", { status: 403 });

  const supabase = await createClient();
  await supabase.auth.signOut();

  return seeOther("/login");
}
