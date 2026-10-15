import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { createClient } from "./server";
import { getSupabaseEnv } from "./env";
import type { AuthUser } from "@/context/AuthProvider";

/**
 * Returns the verified current user, or null.
 *
 * - `cache()` removes duplicate calls, so the layout and the page share
 *   one Supabase request per render.
 * - Only safe public fields are returned (no tokens, no metadata).
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  // Auth is per-request by nature: never let Next prerender this statically.
  await connection();
  if (!getSupabaseEnv()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  return {
    id: user.id,
    email: user.email,
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at ?? null,
  };
});
