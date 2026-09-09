import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Early access signups from easyrepai.app.
//
// Writes to EasyRep's own Supabase with the anon key and an insert-only
// RLS policy, the same arrangement as the app's crash reporting. The anon
// key is public by design (it ships inside the iOS bundle), so there is
// no secret here and no new Vercel environment variable: the policy is
// what stops anyone reading the list back.

const SUPABASE_URL =
  process.env.EASYREP_SUPABASE_URL || "https://uvkzjpvmuganojumhzqd.supabase.co";
const SUPABASE_ANON =
  process.env.EASYREP_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2a3pqcHZtdWdhbm9qdW1oenFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NDAxMjMsImV4cCI6MjEwNDMxNjEyM30.z8aZSmRPQpJJCzQ-nAdgHBvdrhfzaYL5U3uE5xk3dwU";

// Deliberately loose. The job is to reject obvious typos and junk, not to
// argue with anyone about what a valid address looks like.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL.test(email) || email.length > 254) {
    return NextResponse.json({ error: "That email doesn't look right." }, { status: 400 });
  }

  const source = typeof body?.source === "string" ? body.source.slice(0, 40) : "site";

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/signups`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
        "Content-Type": "application/json",
        // Signing up twice is not an error, it is the same person being
        // keen. Merge on the unique email instead of failing.
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify([
        {
          email,
          source,
          user_agent: (req.headers.get("user-agent") || "").slice(0, 300),
        },
      ]),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[easyrep/signup] supabase", res.status, detail.slice(0, 300));
      return NextResponse.json({ error: "Couldn't save that, try again." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[easyrep/signup] failed:", e?.message || e);
    return NextResponse.json({ error: "Couldn't save that, try again." }, { status: 502 });
  }
}
