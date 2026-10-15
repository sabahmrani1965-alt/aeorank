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
// capped three ways and fails closed: if the limits can't be read, it does
// not run.
const PER_EMAIL_PER_DAY = 1;
const PER_IP_PER_DAY = 2;
const GLOBAL_PER_DAY = Number(process.env.FREE_CHECK_DAILY_CAP || 40);
const DAY_MS = 24 * 60 * 60 * 1000;

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
  const ipHash = createHash("sha256").update(`${ip}|${process.env.CRON_SECRET || "aeorank"}`).digest("hex").slice(0, 32);
  const since = new Date(Date.now() - DAY_MS).toISOString();

  const count = async (filter) => {
    let q = admin.from("free_checks").select("id", { count: "exact", head: true }).gte("created_at", since);
    if (filter) q = filter(q);
    const { count: n, error } = await q;
    if (error) throw error;
    return n || 0;
  };
  try {
    const [global, byEmail, byIp] = await Promise.all([
      count(),
      count((q) => q.eq("email", email)),
      count((q) => q.eq("ip_hash", ipHash)),
    ]);
    if (global >= GLOBAL_PER_DAY) return busy("Today's free checks are used up. Please try again tomorrow.");
    if (byEmail >= PER_EMAIL_PER_DAY || byIp >= PER_IP_PER_DAY)
      return busy("You've used your free check for today. Try again tomorrow, or start a trial for daily tracking.");
  } catch (e) {
    console.error("[free-check] limit check failed:", e?.message || e);
    return busy("The checker is unavailable right now. Try again later.", 503);
  }

  // Reserve the slot before spending anything, so parallel requests can't
  // all slip under the limit.
  const { data: row, error: insertError } = await admin
    .from("free_checks")
    .insert({ email, ip_hash: ipHash, domain })
    .select("id")
    .single();
  if (insertError) {
    console.error("[free-check] reserve failed:", insertError.message);
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
    admin
      .from("free_checks")
      .update({ brand, score: result.score, total: result.total, hits: result.hits, competitors: result.competitors || [] })
      .eq("id", row.id),
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
