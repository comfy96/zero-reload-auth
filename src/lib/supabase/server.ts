import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { requireSupabaseEnv } from "./env";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 *
 * It reads and writes the session through Next's cookie store, so the
 * browser never has to manage tokens itself (they are never put in localStorage).
 */
export async function createClient() {
  const { url, anonKey } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          // HttpOnly: the app never reads these tokens in the browser, so
          // nothing client-side needs to see them. (@supabase/ssr defaults
          // to httpOnly: false to support apps with a browser client; ours
          // has none.)
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, { ...options, httpOnly: true }),
          );
        } catch {
          // Server Components can't write cookies. That's fine: the
          // middleware has already refreshed the session for this request.
        }
      },
    },
  });
}
