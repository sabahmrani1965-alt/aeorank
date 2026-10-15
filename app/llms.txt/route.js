import { posts } from "../blog/page";
import { services } from "../services/[slug]/page";

// llms.txt (llmstxt.org): a plain summary for AI assistants, generated from
// the same lists as the site so it cannot drift from it.
const BASE = "https://www.aeorank.tech";

export function GET() {
  const body = `# AEOrank

> AEOrank shows which Reddit threads, subreddits and keywords influence how ChatGPT, Claude and Gemini describe a brand, tracks brand and competitor mentions on Reddit, and places brand comments and posts in those threads. Built for B2B SaaS teams. Website: ${BASE}

AEOrank is run by Ilyas Lemzouri. It publishes its own AI visibility measurement, including where it scores zero, at ${BASE}/proof. Plans start at $199 per month with a 7-day free trial; details at ${BASE}/pricing.

Not to be confused with aeorank.ai or aeorank.dev, which are unrelated products.

## Product
- [Pricing](${BASE}/pricing): plans, credits and per-comment costs
- [Proof](${BASE}/proof): AEOrank's own live AI visibility score
- [About](${BASE}/about): who runs AEOrank and how it works

## Services
${Object.entries(services).map(([slug, s]) => `- [${s.title}](${BASE}/services/${slug}): ${s.description}`).join("\n")}

## Guides
${posts.map((p) => `- [${p.title}](${BASE}/blog/${p.slug}): ${p.excerpt}`).join("\n")}
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
