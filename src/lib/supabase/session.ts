import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

const PROTECTED_PREFIXES = ["/dashboard"];
const AUTH_PAGES = ["/login", "/signup"];

/**
 * Runs on every matched request, before any page renders.
 *
 * 1. Refreshes the Supabase session. An expired access token is swapped
 *    for a new one, and the updated cookie goes back on the response.
 *    This is what keeps you logged in after a browser refresh.
 * 2. Guards routes. Logged-out users can't reach /dashboard, and
 *    logged-in users skip /login and /signup.
 */
export async function updateSession(
  request: NextRequest,
  requestHeaders: Headers,
): Promise<NextResponse> {
  const next = () => NextResponse.next({ request: { headers: requestHeaders } });
  let response = next();

  const env = getSupabaseEnv();
  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p));
  const isAuthPage = AUTH_PAGES.includes(path);

  // Fail closed: with no Supabase config, nobody gets into protected routes.
  if (!env) {
    return isProtected ? redirectTo(request, "/login") : response;
  }

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = next();
        // Match the server adapter: tokens are HttpOnly (the app has no
        // browser Supabase client that would need to read them).
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, { ...options, httpOnly: true }),
        );
      },
    },
  });

  // IMPORTANT: getUser() checks the JWT with Supabase Auth.
  // Don't swap this for getSession() on the server, because that only
  // decodes the cookie and doesn't verify it.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtected) return redirectTo(request, "/login", response);
  if (user && isAuthPage) return redirectTo(request, "/dashboard", response);

  return response;
}

/** Redirects while keeping any refreshed auth cookies. */
function redirectTo(request: NextRequest, pathname: string, from?: NextResponse) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  from?.cookies.getAll().forEach((c) => redirect.cookies.set(c));
  return redirect;
}
