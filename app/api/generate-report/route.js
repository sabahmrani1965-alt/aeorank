import { NextResponse } from "next/server";
import { fetchSiteMeta, prettyBrand, extractBrandFromTitle } from "@/lib/site";
import { pickCategoryQuery } from "@/lib/keywords";
import { searchSubreddits, searchPosts } from "@/lib/reddit";
import { generateBrandAnswers, isLlmConfigured } from "@/lib/llm";
import { sendEmail, isEmailConfigured, addToAudience } from "@/lib/email";
import { renderReportEmail } from "@/lib/reportEmail";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function getBaseUrl(req) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("host");
  if (host) return `${proto}://${host}`;
  return "https://aeorank.tech";
}

function emailLooksValid(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || "");
}

function urlLooksValid(s) {
  try { new URL(s); return true; } catch { return false; }
}

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}

  const email = String(body.email || "").trim().slice(0, 200);
  let url = String(body.url || "").trim();
  const brandSlug = String(body.brandSlug || "").trim().slice(0, 80);

  if (!emailLooksValid(email)) {
    return NextResponse.json({ ok: false, error: "Invalid email." }, { status: 400 });
  }
  if (!url) return NextResponse.json({ ok: false, error: "Missing URL." }, { status: 400 });
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  if (!urlLooksValid(url)) {
    return NextResponse.json({ ok: false, error: "Invalid URL." }, { status: 400 });
  }

  const baseUrl = getBaseUrl(req);
  const slug = brandSlug || (() => {
    try {
      const h = new URL(url).hostname.replace(/^www\./, "");
      return h.split(".")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    } catch { return "brand"; }
  })();
  const reportUrl = `${baseUrl}/report/${encodeURIComponent(slug)}?url=${encodeURIComponent(url)}`;

  // Always log the lead — Vercel logs surface this even if email fails.
  const lead = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    createdAt: new Date().toISOString(),
    email,
    url,
    brandSlug: slug,
    reportUrl,
    ip: req.headers.get("x-forwarded-for") || "unknown",
  };
  console.log(`[lead/report] ${lead.createdAt} | ${email} | url=${url} | ${reportUrl}`);

  // Sync to Resend Audience in parallel with the rest of the work. We
  // include it under the same Promise.race timer below so Vercel doesn't
  // suspend the function before the POST completes.
  const audienceSync = addToAudience({ email }).catch((e) => {
    console.error("[lead/report] audience sync failed:", e?.message || e);
  });

  // Generate report data + send email in the background. We respond fast.
  // The user is already navigating to the report page, so the email is async.
  const work = (async () => {
    try {
      const meta = await fetchSiteMeta(url).catch(() => ({ title: "", description: "", ok: false }));
      const brand = extractBrandFromTitle(meta.title) || prettyBrand(slug);
      const description = meta.description || meta.title || `${brand} — public website`;
      const categoryQuery = pickCategoryQuery(description, brand);
      const postQuery = `${brand} ${categoryQuery}`;

      const [subs, postsA, postsB, llmAnswers] = await Promise.all([
        searchSubreddits(categoryQuery, 8),
        searchPosts(postQuery, 6),
        searchPosts(categoryQuery, 4),
        isLlmConfigured()
          ? generateBrandAnswers(brand, description, categoryQuery)
          : Promise.resolve([]),
      ]);
      const posts = [...new Map([...postsA, ...postsB].map((p) => [p.permalink, p])).values()]
        .sort((a, b) => b.ups - a.ups)
        .slice(0, 5);

      // Forward an admin notification first (quick, even if user email fails).
      const adminTo = process.env.LEAD_EMAIL_TO;
      if (adminTo && isEmailConfigured()) {
        await sendEmail({
          to: adminTo,
          subject: `[AEOrank lead] ${email} — ${brand}`,
          text: [
            `New free-report request`,
            ``,
            `Email: ${email}`,
            `URL: ${url}`,
            `Brand: ${brand}`,
            `Report: ${reportUrl}`,
            ``,
            `IP: ${lead.ip}`,
            `When: ${lead.createdAt}`,
          ].join("\n"),
        });
      }

      // Send the user-facing report email
      if (isEmailConfigured()) {
        const { html, text } = renderReportEmail({
          brand,
          url,
          description,
          subreddits: subs,
          posts,
          llmAnswers,
          reportUrl,
          baseUrl,
        });
        await sendEmail({
          to: email,
          subject: `Your AEOrank report for ${brand}`,
          html,
          text,
          replyTo: adminTo || undefined,
        });
      }
    } catch (e) {
      console.error("[lead/report] background work failed:", e?.message || e);
    }
  })();

  // On Vercel, after returning a response Node may suspend the function
  // before background promises finish. Wait briefly so the email + audience
  // sync have a chance to complete before serverless tear-down — capped
  // to ~12s.
  await Promise.race([
    Promise.all([work, audienceSync]),
    new Promise((r) => setTimeout(r, 12000)),
  ]);

  return NextResponse.json({ ok: true, id: lead.id, reportUrl });
}
