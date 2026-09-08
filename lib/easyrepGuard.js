import { NextResponse } from "next/server";

// EasyRep's AI routes are called from the phone app, which cannot hold a
// secret. A shared app key does not stop a determined attacker who pulls
// it out of the bundle, but it does stop the realistic threat: someone
// finding the open URL and pointing a script at it. Paired with a small
// per-IP rate limit, that is the difference between a stray request and
// a drained Anthropic bill.

const APP_KEY = process.env.EASYREP_APP_KEY || "";

// Requests per IP per rolling window, per route family. In-memory, so it
// resets on cold start; that is fine for abuse control at this scale.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;
const hits = new Map();

function clientIp(req) {
  const fwd = req.headers.get("x-forwarded-for") || "";
  return fwd.split(",")[0].trim() || "unknown";
}

export function rateLimited(req) {
  const ip = clientIp(req);
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.start > WINDOW_MS) {
    hits.set(ip, { start: now, n: 1 });
    if (hits.size > 5000) hits.clear();
    return false;
  }
  rec.n += 1;
  return rec.n > MAX_PER_WINDOW;
}

// Returns a Response when the request should be refused, else null.
export function guard(req, cors) {
  if (APP_KEY) {
    const sent = req.headers.get("x-easyrep-key") || "";
    if (sent !== APP_KEY) {
      return NextResponse.json({ error: "Not authorized." }, { status: 401, headers: cors });
    }
  }
  if (rateLimited(req)) {
    return NextResponse.json(
      { error: "Too many requests, give it a minute." },
      { status: 429, headers: cors }
    );
  }
  return null;
}
