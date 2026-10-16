"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * AuthProvider: the client-side mirror of the auth state.
 *
 * The server stays the source of truth. The root layout reads the user
 * (from the cookie, checked by Supabase) and passes the minimum public fields
 * down as `initialUser`. Every login, signup or logout re-renders the layout
 * through a soft navigation, so this prop updates without a page reload.
 *
 * `clearUser()` lets the logout button blank the UI *instantly*, before the
 * server round trip has finished (an optimistic update).
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
  clearUser: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: AuthUser | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);

  // Re-sync whenever the server sends a new user (login, signup, logout).
  useEffect(() => setUser(initialUser), [initialUser]);

  const clearUser = useCallback(() => setUser(null), []);

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, clearUser }),
    [user, clearUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
