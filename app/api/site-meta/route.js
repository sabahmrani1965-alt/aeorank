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
  const meta = await fetchSiteMeta(url).catch(() => ({ title: "", description: "", ok: false }));
  const brand = extractBrandFromTitle(meta.title) || prettyBrand(slug);

  let hostname = "";
  try {
    hostname = new URL(url).hostname.replace(/^www\./, "");
  } catch {}

  const variations = [...new Set([slug, hostname, `${slug}app`].filter(Boolean))].slice(0, 3);

  return NextResponse.json({
    brand,
    description: meta.description || "",
    variations,
  });
}
