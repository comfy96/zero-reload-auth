/**
 * Supabase environment config.
 *
 * Both values are public: Supabase's security comes from Row Level
 * Security, not from hiding the anon key. Nothing in this file touches
 * the `service_role` key, and nothing ever should.
 */
export type SupabaseEnv = { url: string; anonKey: string };

export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

/** Throws a clear setup error instead of falling back to a fake value. */
export function requireSupabaseEnv(): SupabaseEnv {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase is not configured. Copy .env.local.example to .env.local and add your project URL and anon key.",
    );
  }
  return env;
}
