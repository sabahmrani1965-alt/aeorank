import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchSiteMeta } from "@/lib/siteFetch";
import { extractBrandFromTitle, prettyBrand, urlToSlug } from "@/lib/site";
import { pickCategoryQuery } from "@/lib/keywords";
import { analyzeBrandVisibility, isAiVisibilityConfigured } from "@/lib/aivisibility";
import { addToAudience } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 60;

// Each check costs roughly eight paid model calls, so the public checker is
// capped three ways (per email and per IP per UTC day, and a global daily
// cap) and fails closed: if the limits can't be read, it does not run.
const PER_EMAIL_PER_DAY = 1;
const PER_IP_PER_DAY = 2;
const GLOBAL_PER_DAY = Number(process.env.FREE_CHECK_DAILY_CAP || 40);
const BUCKET = "free-checks";

const busy = (msg, status = 429) => NextResponse.json({ ok: false, error: msg }, { status });

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {}
  // Honeypot: real visitors never fill this hidden field.
  if (body.company_site) return NextResponse.json({ ok: false, error: "Rejected." }, { status: 400 });

  const email = String(body.email || "").trim().toLowerCase().slice(0, 200);
  const rawUrl = String(body.url || "").trim().slice(0, 300);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return busy("Please enter a valid email address.", 400);
  const slug = urlToSlug(rawUrl);
  if (!slug) return busy("Please enter a valid website.", 400);
  const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
  let domain;
  try {
    domain = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return busy("Please enter a valid website.", 400);
  }

  if (!isAiVisibilityConfigured()) return busy("The checker is unavailable right now. Try again later.", 503);
  const admin = createAdminClient();
  if (!admin) return busy("The checker is unavailable right now. Try again later.", 503);

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  const salt = process.env.CRON_SECRET || "aeorank";
  const ipHash = createHash("sha256").update(`${ip}|${salt}`).digest("hex").slice(0, 24);
  const emailHash = createHash("sha256").update(`${email}|${salt}`).digest("hex").slice(0, 24);

  // Each check is one small JSON file in a private Storage bucket, under
  // a folder per UTC day; the limits are counts of today's files. Storage,
  // not a table, so no schema change was needed to ship this.
  const bucket = admin.storage.from(BUCKET);
  const day = new Date().toISOString().slice(0, 10);
  const { data: today, error: listError } = await bucket.list(day, { limit: 1000 });
  if (listError) {
    console.error("[free-check] limit check failed:", listError.message);
    return busy("The checker is unavailable right now. Try again later.", 503);
  }
  const names = (today || []).map((f) => f.name);
  if (names.length >= GLOBAL_PER_DAY) return busy("Today's free checks are used up. Please try again tomorrow.");
  if (names.filter((n) => n.includes(`_e${emailHash}_`)).length >= PER_EMAIL_PER_DAY || names.filter((n) => n.endsWith(`_i${ipHash}.json`)).length >= PER_IP_PER_DAY)
    return busy("You've used your free check for today. Try again tomorrow, or start a trial for daily tracking.");

  // Reserve the slot before spending anything, so parallel requests can't
  // all slip under the limit.
  const path = `${day}/${Date.now()}_e${emailHash}_i${ipHash}.json`;
  const save = (record) =>
    bucket.upload(path, JSON.stringify(record), { contentType: "application/json", upsert: true });
  const { error: reserveError } = await save({ email, domain, at: new Date().toISOString() });
  if (reserveError) {
    console.error("[free-check] reserve failed:", reserveError.message);
    return busy("The checker is unavailable right now. Try again later.", 503);
  }

  let meta = { title: "", description: "" };
  try {
    meta = await fetchSiteMeta(url);
  } catch {}
  const brand = extractBrandFromTitle(meta.title) || prettyBrand(slug);
  const description = meta.description || meta.title || `${brand} platform`;
  const categoryQuery = pickCategoryQuery(description, brand);

  const result = await analyzeBrandVisibility(brand, categoryQuery);
  if (!result || result.score === null) {
    return busy("We couldn't reach the AI engines just now. Please try again in a few minutes.", 502);
  }

  await Promise.all([
    save({
      email,
      domain,
      brand,
      at: new Date().toISOString(),
      score: result.score,
      total: result.total,
      hits: result.hits,
      competitors: result.competitors || [],
    }),
    addToAudience({ email, name: "" }),
  ]);

  const byEngine = {};
  for (const r of result.rows) {
    byEngine[r.model] = byEngine[r.model] || { answers: 0, mentions: 0 };
    byEngine[r.model].answers += 1;
    if (r.mentioned) byEngine[r.model].mentions += 1;
  }

  return NextResponse.json({
    ok: true,
    brand,
    query: categoryQuery,
    score: result.score,
    hits: result.hits,
    total: result.total,
    byEngine,
    competitors: (result.competitors || []).slice(0, 8),
  });
}
