import { headers } from "next/headers";
import { posts } from "./blog/page";
import { services } from "./services/[slug]/page";
import { industries } from "./industries/[slug]/page";
import { DATA_CATEGORIES, loadIndex } from "@/lib/categoryData";
import pageDates from "@/lib/pageDates.json";

// Derived, not hand-maintained. The previous version copied three slug
// arrays by hand and had already drifted: /blog/what-is-aeo was live and
// linked from /blog but missing from the sitemap entirely.

const BASE_URL = "https://www.aeorank.tech";

// Posts carry a human date ("August 28, 2026").
function postDate(post) {
  if (!post?.date) return null;
  const parsed = new Date(`${post.date} 12:00 UTC`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

// <lastmod> only when we know when the page really changed (lib/pageDates.json,
// written from git by scripts/page-dates.mjs). The build date on every page
// told crawlers the whole site changed on each deploy, so they learn to
// ignore it; an unknown date is left out instead.
const withDate = (entry, date) => (date ? { ...entry, lastModified: date } : entry);

export default async function sitemap() {
  const buildDate = new Date().toISOString().slice(0, 10);

  // The same deployment serves easyrepai.app and joincrewquest.com, which
  // used to receive AEOrank's full URL list here. Each host gets its own.
  const host = (headers().get("host") || "").split(":")[0].replace(/^www\./, "");
  if (host === "easyrepai.app") {
    return [
      { url: "https://www.easyrepai.app", lastModified: buildDate, priority: 1.0 },
      { url: "https://www.easyrepai.app/privacy", lastModified: buildDate, priority: 0.3 },
      { url: "https://www.easyrepai.app/terms", lastModified: buildDate, priority: 0.3 },
    ];
  }
  if (host === "joincrewquest.com") {
    return [{ url: "https://www.joincrewquest.com", lastModified: buildDate, priority: 1.0 }];
  }

  const staticPages = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/services`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/pricing`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/proof`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/industries`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/free-ai-visibility-checker`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/tools`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/reddit-markdown-formatter`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/reddit-title-checker`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/reddit-self-promotion-checker`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/affiliates`, changeFrequency: "monthly", priority: 0.6 },
  ].map((p) => withDate(p, pageDates[p.url.slice(BASE_URL.length) || "/"]));

  // The data pages change when the daily collection adds a day, so their date
  // is that day, read from the index the cron writes.
  const index = await loadIndex().catch(() => null);
  const dataDay = (slug) => index?.categories?.find((c) => c.slug === slug)?.lastDay;
  const latest = (index?.categories || []).map((c) => c.lastDay).sort().pop();
  const dataPages = [
    withDate({ url: `${BASE_URL}/ai-recommendations`, changeFrequency: "daily", priority: 0.8 }, latest),
    ...DATA_CATEGORIES.map((c) => withDate({ url: `${BASE_URL}/ai-recommendations/${c.slug}`, changeFrequency: "daily", priority: 0.8 }, dataDay(c.slug))),
  ];

  const blogPages = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
    ...(postDate(post) ? { lastModified: postDate(post) } : {}),
  }));

  const industryPages = Object.keys(industries).map((slug) =>
    withDate({ url: `${BASE_URL}/industries/${slug}`, changeFrequency: "monthly", priority: 0.6 }, pageDates["/industries/*"])
  );

  const servicePages = Object.keys(services).map((slug) =>
    withDate({ url: `${BASE_URL}/services/${slug}`, changeFrequency: "monthly", priority: 0.7 }, pageDates["/services/*"])
  );

  return [...staticPages, ...dataPages, ...blogPages, ...industryPages, ...servicePages];
}
