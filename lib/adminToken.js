import { createHash, timingSafeEqual } from "crypto";

// Token for the owner-only admin routes. The repo is public, so only its
// SHA-256 lives here; the token itself is kept outside the repo.
const TOKEN_SHA256 = "a2ee8ca49d97df1713689b87c62b91454624351842ad2b29706d922473ef0cda";

export function hasAdminToken(req) {
  const t = new URL(req.url).searchParams.get("token") || "";
  const a = Buffer.from(createHash("sha256").update(t).digest("hex"));
  const b = Buffer.from(TOKEN_SHA256);
  return a.length === b.length && timingSafeEqual(a, b);
}
