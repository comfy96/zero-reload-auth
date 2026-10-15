"use client";

import { useTransition } from "react";
import { signOut } from "@/app/(auth)/actions";
import { useAuth } from "@/context/AuthProvider";
import { Spinner } from "@/components/ui/Spinner";

/**
 * Logout:
 * 1. clearUser() blanks the auth UI right away (optimistic).
 * 2. The signOut Server Action ends the Supabase session and clears cookies.
 * 3. We then hard-navigate to /login, so logout is a full page load.
 */
export function LogoutButton() {
  const { clearUser } = useAuth();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      id="logout-button"
      type="button"
      disabled={isPending}
      className="btn-secondary px-4"
      onClick={() =>
        startTransition(async () => {
          clearUser();
          await signOut();
          window.location.assign("/login");
        })
      }
    >
      {isPending ? <Spinner /> : null}
      {isPending ? "Signing out…" : "Log out"}
    </button>
  );
}
