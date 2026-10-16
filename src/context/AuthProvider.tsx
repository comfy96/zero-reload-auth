"use client";

import { createContext, useContext, useMemo } from "react";

/**
 * AuthProvider: the client-side mirror of the auth state.
 *
 * The server stays the source of truth. The root layout reads the user
 * (from the cookie, verified by Supabase) and passes the minimum public
 * fields down as `initialUser`. Every navigation and auth action is a full
 * page load, so this provider is re-created from fresh server data on every
 * document — there is no in-place update and no optimistic state.
 */
export type AuthUser = {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: AuthUser | null;
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({ user: initialUser, isAuthenticated: initialUser !== null }),
    [initialUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
