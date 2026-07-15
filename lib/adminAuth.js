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
