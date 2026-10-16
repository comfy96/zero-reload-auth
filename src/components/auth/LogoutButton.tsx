"use client";

import { signOut } from "@/app/(auth)/actions";
import { useAuth } from "@/context/AuthProvider";

/**
 * Logout, without reloading — and with an instant navbar switch:
 * 1. clearUser() is an urgent update, so the navbar swaps to Log in /
 *    Sign up on the very next frame (optimistic).
 * 2. signOut() runs the Server Action: it ends the Supabase session, clears
 *    the auth cookies on the response, then redirect()s to /login — a soft
 *    navigation inside the same document.
 */
export function LogoutButton() {
  const { clearUser } = useAuth();

  return (
    <button
      id="logout-button"
      type="button"
      className="btn-secondary px-4"
      onClick={() => {
        clearUser();
        void signOut();
      }}
    >
      Log out
    </button>
  );
}
