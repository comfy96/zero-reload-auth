/**
 * Logout: a native form POST to the /api/auth/logout route handler.
 *
 * The handler revokes the Supabase session and clears the auth cookies,
 * then redirects to /login — the browser leaves this document entirely.
 * No client state and no optimistic UI: the session dies with the page.
 */
export function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST" className="inline-flex">
      <button id="logout-button" type="submit" className="btn-secondary px-4">
        Log out
      </button>
    </form>
  );
}
