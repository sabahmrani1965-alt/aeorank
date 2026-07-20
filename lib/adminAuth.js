import { createClient } from "@/lib/supabase/server";

// Simple email-allowlist admin gate — matches the scale of a solo-founder
// tool. No separate roles table; ADMIN_EMAILS is a comma-separated env var.
export function isAdminEmail(email) {
  if (!email) return false;
  const allowlist = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowlist.includes(email.toLowerCase());
}

// Shared "is the current session an admin" check for API routes — resolves
// the logged-in user via the request-scoped Supabase client and confirms
// their email is on the allowlist. Returns null (not a thrown error) when
// unauthorized, so callers just do `if (!admin) return 403`.
export async function requireAdminUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}
