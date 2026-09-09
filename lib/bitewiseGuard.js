import { NextResponse } from "next/server";

// BiteWise's AI route is called from the phone app, which cannot hold a
// secret. A shared app key does not stop someone who unpacks the bundle,
// but it stops the realistic threat: a stray script finding an open URL
// and draining the Anthropic bill. Same shape as easyrepGuard, kept
// separate so one app's key or limits can change without touching the
// other's.

const APP_KEY = process.env.BITEWISE_APP_KEY || "";

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

export function guard(req, cors) {
  if (APP_KEY) {
    const sent = req.headers.get("x-bitewise-key") || "";
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
