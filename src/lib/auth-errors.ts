/**
 * Auth failures travel back to the pages as `?error=...` codes (set by the
 * /api/auth route handlers), so the error state is rendered server-side on
 * the next document. Codes map back to exactly the messages the forms have
 * always shown.
 *
 * Comma-separated codes are allowed: one submission can fail on both fields,
 * and both should be reported at once.
 */
export type AuthErrorCode =
  | "invalid_email"
  | "password_required"
  | "password_short"
  | "password_long"
  | "invalid_credentials"
  | "email_exists"
  | "confirmation_required"
  | "generic";

type AuthErrorCopy = {
  formError?: string;
  fieldErrors?: Partial<Record<"email" | "password", string>>;
};

const MESSAGES: Record<AuthErrorCode, AuthErrorCopy> = {
  invalid_email: { fieldErrors: { email: "Enter a valid email address." } },
  password_required: { fieldErrors: { password: "Password is required." } },
  password_short: { fieldErrors: { password: "Use at least 8 characters." } },
  password_long: { fieldErrors: { password: "Use 128 characters or fewer." } },
  invalid_credentials: { formError: "Invalid email or password." },
  email_exists: { formError: "An account with this email already exists." },
  confirmation_required: {
    formError:
      "Account created, but email confirmation is enabled. Disable it in Supabase → Authentication → Sign In / Providers → Email.",
  },
  generic: { formError: "Something went wrong. Please try again." },
};

/** Maps the `?error=` search param to the copy the form renders. */
export function resolveAuthError(code: string | string[] | undefined): AuthErrorCopy {
  const raw = Array.isArray(code) ? code.join(",") : code;
  if (!raw) return {};

  const result: AuthErrorCopy = {};
  for (const part of raw.split(",")) {
    const entry = MESSAGES[part as AuthErrorCode];
    if (!entry) continue;
    if (entry.fieldErrors) result.fieldErrors = { ...result.fieldErrors, ...entry.fieldErrors };
    if (!result.formError && entry.formError) result.formError = entry.formError;
  }
  return result;
}

/** Turns a Zod issue into its `?error=` code. */
export function codeFromZodIssue(issue: {
  code?: string;
  path: PropertyKey[];
  minimum?: number | bigint;
}): AuthErrorCode | null {
  const field = issue.path[0];
  if (field === "email") return "invalid_email";
  if (field === "password") {
    if (issue.code === "too_small") {
      return Number(issue.minimum) === 8 ? "password_short" : "password_required";
    }
    if (issue.code === "too_big") return "password_long";
    return "password_required";
  }
  return null;
}

/** All distinct `?error=` codes for a failed parse, in issue order. */
export function codesFromZodIssues(
  issues: Array<{ code?: string; path: PropertyKey[]; minimum?: number | bigint }>,
): string {
  const codes = new Set<string>();
  for (const issue of issues) {
    const code = codeFromZodIssue(issue);
    if (code) codes.add(code);
  }
  return [...codes].join(",") || "generic";
}
