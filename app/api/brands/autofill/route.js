import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prettyBrand, extractBrandFromTitle, urlToSlug } from "@/lib/site";
import { fetchSiteMeta } from "@/lib/siteFetch";
import { generateCompanyDescription, isLlmConfigured } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 20;

// Same scrape lib/site.js uses for the onboarding wizard's step 1→2
// autofill, plus an AI-written description when the site's own meta
// description is missing or too thin to be useful on its own.
export async function POST(req) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body = {};
  try {
    body = await req.json();
  } catch {}

  let url = String(body?.url || "").trim();
  if (!url) return NextResponse.json({ error: "Enter a website first." }, { status: 400 });
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;

  const slug = urlToSlug(url);
  const meta = await fetchSiteMeta(url).catch(() => ({ title: "", description: "", ok: false }));
  const companyName = extractBrandFromTitle(meta.title) || prettyBrand(slug);

  let hostname = "";
  try {
    hostname = new URL(url).hostname.replace(/^www\./, "");
  } catch {}

  let description = meta.description || "";
  if (description.length < 40 && isLlmConfigured()) {
    const aiDescription = await generateCompanyDescription(meta.title, hostname);
    if (aiDescription) description = aiDescription;
  }

  const variations = [...new Set([slug, hostname, `${slug}app`].filter(Boolean))].slice(0, 3);

  return NextResponse.json({ companyName, description, variations });
}
