/**
 * 303 "See Other" with a RELATIVE Location.
 *
 * POST → redirect → GET is what makes every auth action a full document
 * load: the browser re-requests the target as a plain GET.
 *
 * The Location is deliberately relative — the browser resolves it against
 * the URL it actually requested, so the next document stays on the same
 * host as the POST. Absolute URLs built from `request.url` can point at a
 * different host (dev servers and reverse proxies rewrite it), which would
 * silently drop the auth cookies just set on this same response.
 */
export function seeOther(path: string): Response {
  return new Response(null, { status: 303, headers: { Location: path } });
}
