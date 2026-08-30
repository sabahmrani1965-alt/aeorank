import { NextResponse } from "next/server";
import { prettyBrand, extractBrandFromTitle, urlToSlug } from "@/lib/site";
import { fetchSiteMeta } from "@/lib/siteFetch";

export const runtime = "nodejs";

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {}

  let url = String(body?.url || "").trim();
  if (!url) return NextResponse.json({ error: "Missing URL." }, { status: 400 });
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;

  const slug = urlToSlug(url);
  const meta = await fetchSiteMeta(url).catch(() => ({ title: "", description: "", logo: "", ok: false }));
  const brand = extractBrandFromTitle(meta.title) || prettyBrand(slug);

  let hostname = "";
  try {
    hostname = new URL(url).hostname.replace(/^www\./, "");
  } catch {}

  const variations = [...new Set([slug, hostname, `${slug}app`].filter(Boolean))].slice(0, 3);

  // Nothing findable in the page's own HTML (no icon link, no og:image) —
  // fall back to a real favicon lookup service rather than leaving the
  // preview blank. Not a guess at what the logo looks like: this genuinely
  // queries Google's favicon index for the domain, it just isn't the
  // site's own markup.
  const logoUrl =
    meta.logo || (hostname ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128` : "");

  return NextResponse.json({
    brand,
    description: meta.description || "",
    variations,
    logoUrl,
  });
}
