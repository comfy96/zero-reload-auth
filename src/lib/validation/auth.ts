import { z } from "zod";

/**
 * Validated on the server inside the /api/auth route handlers. Never trust
 * what the client sends. Password rules follow modern guidance: long enough,
 * no forced character classes, and a high upper limit.
 */
const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email("Enter a valid email address."));

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Password is required.").max(128),
});

export const signUpSchema = z.object({
  email,
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .max(128, "Use 128 characters or fewer."),
});

// TODO(security): add leaked-password protection (Supabase Auth → Password
// settings → "Prevent use of leaked passwords") for production.
