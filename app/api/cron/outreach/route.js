import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasAdminToken } from "@/lib/adminToken";
import { getCategory, loadSummary } from "@/lib/categoryData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Daily cold outreach to brands the AI engines leave out of a category
// (same design as SaaSOffers' sender, approved by the owner 2026-10-16).
// The queue is a JSON file in the private Storage bucket "outreach":
// [{ to, firstname, brand, category, status }]. Each email is written at
// send time from that day's /ai-recommendations summary, so the numbers are
// current, and a brand the engines have started naming is skipped.
// Owner token with ?mode=preview shows the next emails without sending.
const DAILY_N = 20;
const START = "2026-10-23"; // enough answers per category to quote
const BOUNCE_PAUSE = 3;
const BUCKET = "outreach";
const QUEUE = "queue.json";
const FROM = "Ilyas Lemzouri <ilyas@aeorank.tech>";
const REPLY_TO = "ilyas@aeorank.tech";

const keyOf = (n) =>
  String(n)
    .toLowerCase()
    .replace(/\.(com|io|ai|co|app)$/, "")
    .replace(/\s+(crm|software|app|platform|suite|desk|books)$/, "")
    .replace(/[^a-z0-9]/g, "");

async function readQueue(bucket) {
  const { data } = await bucket.download(QUEUE);
  if (!data) return [];
  try {
    const j = JSON.parse(await data.text());
    return Array.isArray(j) ? j : [];
  } catch {
    return [];
  }
}

function render(item, summary) {
  const cat = getCategory(item.category);
  const name = cat?.name || item.category;
  const [a, b] = summary.brands;
  const url = `https://www.aeorank.tech/ai-recommendations/${item.category}`;
  const hi = item.firstname ? `Hi ${item.firstname},` : "Hi,";
  const since = new Date(`${summary.firstDay}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
  const text = `${hi}

When buyers ask ChatGPT, Claude or Gemini to recommend ${name}, ${item.brand} doesn't come up. I've asked them the same questions every day since ${since}, and ${item.brand} wasn't named in any of the ${summary.totalAnswers} answers. ${a.name} was named in ${Math.round(a.share)}% of them, ${b.name} in ${Math.round(b.share)}%.

Every answer is public and updated daily: ${url}

Those engines mostly repeat what they read in a handful of Reddit threads and review pages. AEOrank finds the ones behind the ${name} answers, gets ${item.brand} into those conversations, and reports each week whether the answers have changed.

Plans start at $199 a month, and the first 7 days are free: https://www.aeorank.tech/start?brand=${encodeURIComponent(item.brand)}

Or see it for yourself first: enter your website in our free checker and it shows how often AI engines name ${item.brand}: https://www.aeorank.tech/free-ai-visibility-checker

Ilyas Lemzouri
Founder, AEOrank
https://www.linkedin.com/in/lemzouri-ilyas/

If this isn't relevant, reply "no" and I won't email again.`;
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = `<div style="font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.6;color:#222">${esc(text)
    .replace(/(https:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')
    .split("\n\n")
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("")}</div>`;
  return { subject: `${item.brand} is missing from AI answers for ${name}`, text, html };
}

// Bounces among emails sent in the last 3 days, read from Resend itself
// (AEOrank has no email-events table).
async function recentBounces(items, key) {
  const since = Date.now() - 3 * 86400000;
  const recent = items.filter((x) => x.resend_id && Date.parse(x.sent_at || 0) > since);
  const events = await Promise.all(
    recent.map((x) =>
      fetch(`https://api.resend.com/emails/${x.resend_id}`, { headers: { Authorization: `Bearer ${key}` } })
        .then((r) => r.json())
        .then((j) => j.last_event)
        .catch(() => null)
    )
  );
  return events.filter((e) => e === "bounced").length;
}

export async function GET(req) {
  const cron = process.env.CRON_SECRET && req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
  const preview = hasAdminToken(req) && new URL(req.url).searchParams.get("mode") === "preview";
  if (!cron && !preview) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const key = process.env.RESEND_API_KEY;
  if (!admin || !key) return NextResponse.json({ error: "not configured" }, { status: 500 });
  const bucket = admin.storage.from(BUCKET);
  const items = await readQueue(bucket);
  const today = new Date().toISOString().slice(0, 10);

  const summaries = {};
  for (const slug of new Set(items.map((x) => x.category))) summaries[slug] = await loadSummary(slug).catch(() => null);
  const named = (it) => {
    const s = summaries[it.category];
    // The summary keys names with its own keyOf (no desk/books stripping),
    // so try both spellings.
    const plain = String(it.brand).toLowerCase().replace(/[^a-z0-9]/g, "");
    if (s?.mentioned) return s.mentioned.includes(keyOf(it.brand)) || s.mentioned.includes(plain);
    return s?.brands.some((b) => keyOf(b.name) === keyOf(it.brand));
  };

  if (preview) {
    const next = items.filter((x) => (x.status || "queued") === "queued" && summaries[x.category]?.brands?.length >= 2 && !named(x)).slice(0, 5);
    return NextResponse.json({
      queued: items.filter((x) => (x.status || "queued") === "queued").length,
      startsOn: START,
      next: next.map((x) => ({ to: x.to, ...render(x, summaries[x.category]), html: undefined })),
    });
  }

  if (today < START) return NextResponse.json({ waiting: `sending starts ${START}` });
  const bounces = await recentBounces(items, key);
  if (bounces >= BOUNCE_PAUSE) return NextResponse.json({ paused: true, bounces });

  const sentToday = items.filter((x) => x.status === "sent" && (x.sent_at || "").startsWith(today)).length;
  const toSend = items.filter((x) => (x.status || "queued") === "queued").slice(0, Math.max(0, DAILY_N - sentToday));
  const sent = [];
  await Promise.all(
    toSend.map(async (it) => {
      const s = summaries[it.category];
      if (!(s?.brands?.length >= 2)) return; // not enough data yet; stays queued
      if (named(it)) {
        it.status = "skipped_named";
        return;
      }
      const { subject, text, html } = render(it, s);
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: FROM, to: [it.to], reply_to: REPLY_TO, subject, text, html }),
        });
        if (!res.ok) throw new Error(`resend ${res.status}`);
        it.resend_id = (await res.json()).id;
        it.status = "sent";
        it.sent_at = new Date().toISOString();
        sent.push(it.to);
      } catch {
        it.status = "failed";
      }
    })
  );
  if (toSend.length) {
    await bucket.upload(QUEUE, JSON.stringify(items, null, 1), { contentType: "application/json", upsert: true });
  }
  return NextResponse.json({
    sent: sent.length,
    remaining: items.filter((x) => (x.status || "queued") === "queued").length,
    bounces,
  });
}
