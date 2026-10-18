import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasAdminToken } from "@/lib/adminToken";
import { getCategory, loadReddit, loadSummary, REDDIT_VERSION } from "@/lib/categoryData";
import { readQueue, refOf, writeQueue } from "@/lib/outreach";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Daily cold outreach to brands the AI engines leave out of a category
// (same design as SaaSOffers' sender, approved by the owner 2026-10-16).
// The queue is a JSON file in the private Storage bucket "outreach":
// [{ to, firstname, brand, category, status }]. Each email is written at
// send time from that day's /ai-recommendations summary, so the numbers are
// current, and a brand the engines have started naming is skipped.
// One follow-up, FOLLOWUP_DAYS later, to people who neither replied nor opted
// out (the owner marks those on /admin/outreach), quoting that day's numbers.
// Owner token with ?mode=preview shows the next emails and follow-ups
// without sending.
const DAILY_N = 20;
const FOLLOWUP_DAYS = 4;
const FOLLOWUP_N = 20;
const START = "2026-10-19"; // moved up from 10-23 by the owner; categories quote ~20 answers by then
const BOUNCE_PAUSE = 3;
const FROM = "Ilyas Lemzouri <ilyas@aeorank.tech>";
const REPLY_TO = "ilyas@aeorank.tech";

const keyOf = (n) =>
  String(n)
    .toLowerCase()
    .replace(/\.(com|io|ai|co|app)$/, "")
    .replace(/\s+(crm|software|app|platform|suite|desk|books)$/, "")
    .replace(/[^a-z0-9]/g, "");

// "HubSpot and Pipedrive were named in every one." / "Zendesk was named in 91% of them, Freshdesk in 73%."
function leaders(a, b) {
  const pa = Math.round(a.share), pb = Math.round(b.share);
  if (pa === 100 && pb === 100) return `${a.name} and ${b.name} were named in every one.`;
  if (pa === 100) return `${a.name} was named in every one, ${b.name} in ${pb}%.`;
  return `${a.name} was named in ${pa}% of them, ${b.name} in ${pb}%.`;
}

// "HubSpot CRM" -> /\bhubspot\b/gi, so the short name people write counts.
const coreName = (n) => String(n).toLowerCase().replace(/\s+(crm|software|app|platform|suite)$/, "").trim();
const nameRe = (n, flags = "i") => new RegExp(`\\b${coreName(n).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, flags);
const plain = (t) => String(t).replace(/\*\*|__|`|#+\s/g, "").replace(/\s+/g, " ").trim();

// A sentence of a real stored answer that names the leaders, quoted verbatim.
// ChatGPT first: it's the engine the reader has heard of.
function pickQuote(summary, brand) {
  const order = ["ChatGPT", "Gemini", "Claude"];
  const answers = [...(summary.latest || [])].sort((x, y) => order.indexOf(x.engine) - order.indexOf(y.engine));
  const leaders = summary.brands.slice(0, 6).map((b) => b.name);
  for (const minNames of [2, 1]) {
    for (const l of answers) {
      if (nameRe(brand).test(l.answer)) continue;
      const parts = l.answer.split(/\n+|(?<=[.!?])\s+/).map(plain).filter((x) => x.length >= 40 && x.length <= 240);
      const hit = parts.find((x) => leaders.filter((n) => nameRe(n).test(x)).length >= minNames);
      if (hit) return { engine: l.engine, question: plain(l.question).replace(/\s*Name specific products\.?$/i, ""), quote: hit };
    }
  }
  return null;
}

// The busiest stored thread where the leader is named and the brand isn't,
// with real counts from its post and top comments.
function pickThread(summary, brand) {
  const lead = summary.brands[0]?.name;
  if (!lead) return null;
  const best = (summary.threads || [])
    .map((t) => ({ ...t, leadCount: (t.text.match(nameRe(lead, "gi")) || []).length, own: nameRe(brand).test(t.text) }))
    .filter((t) => !t.own && t.leadCount >= 3)
    .sort((x, y) => (y.comments || 0) - (x.comments || 0) || y.leadCount - x.leadCount)[0];
  // "HubSpot CRM" is counted as "hubspot", so it's shown that way too.
  return best ? { ...best, lead: lead.replace(/\s+(CRM|Software|App|Platform|Suite)$/i, "") } : null;
}

function render(item, summary) {
  const cat = getCategory(item.category);
  const name = cat?.name || item.category;
  const [a, b] = summary.brands;
  const hi = item.firstname ? `Hi ${item.firstname},` : "Hi,";
  const since = new Date(`${summary.firstDay}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
  // r = a short hash of the address, so the report visit log says who opened it.
  const ref = refOf(item.to);
  const url = `https://www.aeorank.tech/ai-report/${item.category}/${encodeURIComponent(item.brand)}?r=${ref}`;
  const q = pickQuote(summary, item.brand);
  const t = pickThread(summary, item.brand);

  const blocks = [{ p: hi }];
  if (q) {
    blocks.push({ p: `I asked ${q.engine}: "${q.question}" Part of its answer:` });
    blocks.push({ quote: q.quote });
    blocks.push({ p: `No ${item.brand}. Not in that answer, and not in any of the ${summary.totalAnswers} answers I've collected from ChatGPT, Claude and Gemini.` });
  } else {
    blocks.push({ p: `When buyers ask ChatGPT, Claude or Gemini to recommend ${name}, ${item.brand} doesn't come up: it wasn't named in any of the ${summary.totalAnswers} answers I've collected. ${leaders(a, b)}` });
  }
  if (t) {
    blocks.push({ p: `The engines learn this from threads like "${t.title}" on r/${t.sub}${t.comments ? ` (${t.comments} comments)` : ""}: its post and top comments mention ${t.lead} ${t.leadCount} times and ${item.brand} not once.` });
  }
  blocks.push({ p: `I put the full answers${t ? " and those threads" : ""} on one page for ${item.brand}:` });

  const label = `See ${item.brand}'s AI report`;
  const closing = "Worth a look?";
  const sig = ["Ilyas Lemzouri", "Founder, AEOrank", "https://www.linkedin.com/in/lemzouri-ilyas/"];
  const optout = `If this isn't relevant, reply "no" and I won't email again.`;
  const text = [...blocks.map((x) => (x.quote ? `> ${x.quote}` : x.p)), `${label}: ${url}`, closing, sig.slice(0, 2).join("\n"), optout].join("\n\n");

  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const body = blocks
    .map((x) =>
      x.quote
        ? `<blockquote style="margin:0 0 16px;padding:10px 14px;border-left:3px solid #bbb;background:#f6f6f6;color:#333;font-style:italic">${esc(x.quote)}</blockquote>`
        : `<p style="margin:0 0 16px">${esc(x.p)}</p>`
    )
    .join("");
  const html = `<div style="font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.6;color:#222;max-width:560px">${body}<p style="margin:4px 0 22px"><a href="${esc(url)}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:8px">${esc(label)} &rarr;</a></p><p style="margin:0 0 16px">${closing}</p><p style="margin:0 0 16px">${esc(sig[0])}<br>${esc(sig[1])} · <a href="${sig[2]}" style="color:#555">LinkedIn</a></p><p style="margin:0;color:#777;font-size:13px">${esc(optout)}</p></div>`;
  const subject = q ? `What ${q.engine} recommends instead of ${item.brand}` : subjectOf(item, name);
  return { subject, text, html };
}

const subjectOf = (item, name) => `${item.brand} is missing from AI answers for ${name}`;

function htmlOf(paras, url, label, sig, optout) {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const p = (s) => `<p style="margin:0 0 16px">${s}</p>`;
  return `<div style="font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.6;color:#222;max-width:560px">${paras
    .map((x) => p(esc(x)))
    .join("")}<p style="margin:22px 0 24px"><a href="${esc(url)}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:8px">${esc(label)} &rarr;</a></p>${p(
    `${esc(sig[0])}<br>${esc(sig[1])}<br><a href="${sig[2]}" style="color:#555">LinkedIn</a>`
  )}<p style="margin:0;color:#777;font-size:13px">${esc(optout)}</p></div>`;
}

// The follow-up: what changed since the first email, and an easy reply.
// Never mentions whether they opened the report.
function renderFollowup(item, summary) {
  const cat = getCategory(item.category);
  const name = cat?.name || item.category;
  const [a] = summary.brands;
  const hi = item.firstname ? `Hi ${item.firstname},` : "Hi,";
  const url = `https://www.aeorank.tech/ai-report/${item.category}/${encodeURIComponent(item.brand)}?r=${refOf(item.to)}`;
  const more = summary.totalAnswers - (item.sent_total || summary.totalAnswers);
  const leadShare = Math.round(a.share) === 100 ? "every one" : `${Math.round(a.share)}%`;
  const paras = [
    hi,
    more >= 3
      ? `A quick follow-up. Since my last email, ChatGPT, Claude and Gemini answered ${more} more questions about ${name}, and ${item.brand} still wasn't named in any of them. Across all ${summary.totalAnswers} answers, ${a.name} was named in ${leadShare}.`
      : `A quick follow-up. ${item.brand} still hasn't been named in any of the ${summary.totalAnswers} AI answers about ${name}, while ${a.name} was named in ${leadShare}.`,
    `If it helps, reply "threads" and I'll send you the three Reddit threads I'd start with for ${item.brand}. No call, no strings.`,
  ];
  const sig = ["Ilyas Lemzouri", "Founder, AEOrank", "https://www.linkedin.com/in/lemzouri-ilyas/"];
  const optout = `If this isn't relevant, reply "no" and I won't email again.`;
  const label = `See ${item.brand}'s updated report`;
  const text = [...paras, `${label}: ${url}`, sig.join("\n"), optout].join("\n\n");
  return { subject: `Re: ${item.subject || subjectOf(item, name)}`, text, html: htmlOf(paras, url, label, sig, optout) };
}

async function send(key, to, { subject, text, html }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [to], reply_to: REPLY_TO, subject, text, html }),
  });
  if (!res.ok) throw new Error(`resend ${res.status}`);
  return (await res.json()).id;
}

// Bounces among emails sent in the last 3 days, read from Resend itself
// (AEOrank has no email-events table).
async function recentBounces(items, key) {
  const since = Date.now() - 3 * 86400000;
  const recent = items.flatMap((x) => [
    x.resend_id && Date.parse(x.sent_at || 0) > since ? x.resend_id : null,
    x.followup_id && Date.parse(x.followup_at || 0) > since ? x.followup_id : null,
  ]).filter(Boolean);
  const events = await Promise.all(
    recent.map((id) =>
      fetch(`https://api.resend.com/emails/${id}`, { headers: { Authorization: `Bearer ${key}` } })
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
  const items = await readQueue(admin);
  const today = new Date().toISOString().slice(0, 10);

  const summaries = {};
  for (const slug of new Set(items.map((x) => x.category))) {
    const [sum, reddit] = await Promise.all([loadSummary(slug).catch(() => null), loadReddit(slug).catch(() => null)]);
    // Same test the report page uses before it shows the Reddit section.
    const threads = reddit?.v === REDDIT_VERSION ? reddit.threads : [];
    summaries[slug] = sum && { ...sum, threads, hasReddit: threads.length > 0 };
  }
  const named = (it) => {
    const s = summaries[it.category];
    // The summary keys names with its own keyOf (no desk/books stripping),
    // so try both spellings.
    const plain = String(it.brand).toLowerCase().replace(/[^a-z0-9]/g, "");
    if (s?.mentioned) return s.mentioned.includes(keyOf(it.brand)) || s.mentioned.includes(plain);
    return s?.brands.some((b) => keyOf(b.name) === keyOf(it.brand));
  };

  // Due for the follow-up: first email sent FOLLOWUP_DAYS+ ago, no reply or
  // opt-out marked, still not named.
  const dueFollowup = (x) =>
    x.status === "sent" && !x.followup_at && Date.now() - Date.parse(x.sent_at || 0) >= FOLLOWUP_DAYS * 86400000;

  if (preview) {
    const next = items.filter((x) => (x.status || "queued") === "queued" && summaries[x.category]?.brands?.length >= 2 && !named(x)).slice(0, 5);
    // ?as=followup previews the follow-up for the same people.
    const asFollowup = new URL(req.url).searchParams.get("as") === "followup";
    return NextResponse.json({
      queued: items.filter((x) => (x.status || "queued") === "queued").length,
      followupsDue: items.filter(dueFollowup).length,
      startsOn: START,
      next: next.map((x) => ({ to: x.to, ...(asFollowup ? renderFollowup({ ...x, sent_total: Math.round(summaries[x.category].totalAnswers * 0.6) }, summaries[x.category]) : render(x, summaries[x.category])) })),
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
      try {
        const email = render(it, s);
        it.resend_id = await send(key, it.to, email);
        it.subject = email.subject; // the follow-up replies to this exact subject
        it.status = "sent";
        it.sent_at = new Date().toISOString();
        it.sent_total = s.totalAnswers; // the follow-up says what changed since
        sent.push(it.to);
      } catch {
        it.status = "failed";
      }
    })
  );

  const followedToday = items.filter((x) => (x.followup_at || "").startsWith(today)).length;
  const toFollow = items.filter(dueFollowup).slice(0, Math.max(0, FOLLOWUP_N - followedToday));
  const followed = [];
  await Promise.all(
    toFollow.map(async (it) => {
      const s = summaries[it.category];
      if (!(s?.brands?.length >= 1)) return;
      if (named(it)) {
        it.followup_at = new Date().toISOString();
        it.followup_skipped = "now_named"; // the first email's claim no longer holds
        return;
      }
      try {
        it.followup_id = await send(key, it.to, renderFollowup(it, s));
        it.followup_at = new Date().toISOString();
        it.status = "followed_up";
        followed.push(it.to);
      } catch {
        it.followup_at = new Date().toISOString();
        it.followup_skipped = "send_failed";
      }
    })
  );

  if (toSend.length || toFollow.length) await writeQueue(admin, items);
  return NextResponse.json({
    sent: sent.length,
    followedUp: followed.length,
    remaining: items.filter((x) => (x.status || "queued") === "queued").length,
    bounces,
  });
}
