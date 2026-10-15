import { createHash, timingSafeEqual } from "crypto";

// Token for the owner-only admin routes. The repo is public, so only its
// SHA-256 lives here; the token itself is kept outside the repo.
const TOKEN_SHA256 = "be07aec3d79993b11f68ee8725d57d88182d454ef90fc9eac8b8cb9fda53f250";

export function hasAdminToken(req) {
  const t = new URL(req.url).searchParams.get("token") || "";
  const a = Buffer.from(createHash("sha256").update(t).digest("hex"));
  const b = Buffer.from(TOKEN_SHA256);
  return a.length === b.length && timingSafeEqual(a, b);
}
