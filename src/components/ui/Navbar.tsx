"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ZeroReloadBadge } from "@/components/ui/ZeroReloadBadge";

/**
 * Lives in the root layout, so it is never unmounted. Its contents
 * switch straight away based on the AuthProvider state.
 */
export function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link id="nav-home" href="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-field bg-foreground text-sm font-bold text-background">
            Z
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
            Zero Reload <span className="text-muted">Auth</span>
          </span>
        </Link>

        <div className="flex items-center gap-2.5">
          <ZeroReloadBadge />
          {user ? (
            <>
              {pathname !== "/dashboard" && (
                <Link id="nav-dashboard" href="/dashboard" className="btn-secondary px-4">
                  Dashboard
                </Link>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link id="nav-login" href="/login" className="btn-secondary px-4">
                Log in
              </Link>
              <Link id="nav-signup" href="/signup" className="btn-primary px-4">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
