import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { resolveAuthError } from "@/lib/auth-errors";

export const metadata: Metadata = { title: "Log in" };

/**
 * Errors arrive as `?error=...` codes set by POST /api/auth/login and are
 * turned into copy here, on the server — no client-side error state at all.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { error } = await searchParams;
  const { formError, fieldErrors } = resolveAuthError(error);

  return <AuthForm mode="login" formError={formError} fieldErrors={fieldErrors} />;
}
