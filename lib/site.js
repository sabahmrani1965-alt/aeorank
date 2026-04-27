// Fetch a website's <title> and meta description without any third-party services.
// Strict timeout + size cap to keep responses fast.

const UA =
  "Mozilla/5.0 (compatible; AEOrank/1.0; +https://aeorank.com)";

function pick(html, regex) {
  const m = html.match(regex);
  return m ? decodeEntities(m[1].trim()) : "";
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export async function fetchSiteMeta(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      signal: controller.signal,
      redirect: "follow",
    });
    if (!res.ok) throw new Error("status " + res.status);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let html = "";
    let total = 0;
    const MAX = 200_000;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      html += decoder.decode(value, { stream: true });
      if (total > MAX) {
        try { reader.cancel(); } catch {}
        break;
      }
    }
    return parseMeta(html);
  } catch (e) {
    return { title: "", description: "", ok: false, error: String(e.message || e) };
  } finally {
    clearTimeout(timer);
  }
}

export function parseMeta(html) {
  const title =
    pick(html, /<title[^>]*>([\s\S]*?)<\/title>/i) ||
    pick(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  const description =
    pick(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
    pick(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
    pick(html, /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i);
  return { title, description, ok: true };
}

// Convert a slug like "saasoffers" or "launchclub" into something nicer.
// Handles common compound patterns: "saasoffers" → "SaaSOffers", "launchclub" → "LaunchClub".
// Also detects acronym-style slugs (3+ chars, all consonants) → uppercase: "ffn" → "FFN".
export function prettyBrand(slug) {
  if (!slug) return "Your brand";
  const lower = slug.toLowerCase();

  // Pure acronym detection: short, all consonants (3-5 chars).
  if (lower.length >= 2 && lower.length <= 5) {
    const vowels = (lower.match(/[aeiouy]/g) || []).length;
    if (vowels === 0) return lower.toUpperCase(); // ffn → FFN
  }

  // Compound brands: split on known sub-words and re-cap.
  const KNOWN = ["saas", "club", "offers", "hub", "labs", "app", "ai", "kit", "stack", "pad", "deck", "base", "lab", "box", "hq"];
  let s = lower;
  for (const w of KNOWN) {
    s = s.replace(new RegExp(`(?!^)${w}`, "g"), (mm) => "_" + mm);
  }
  return s
    .split("_")
    .filter(Boolean)
    .map((part) => {
      if (part.toLowerCase() === "saas") return "SaaS";
      if (part.toLowerCase() === "ai") return "AI";
      if (part.toLowerCase() === "hq") return "HQ";
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join("");
}

// When the page title is available, try to pull a clean brand name from it.
// Many sites use formats like:
//   "Fédération Française de Natation | FFN"
//   "Notion – The AI workspace that works for you"
//   "Shopify - Start, run, and grow your business"
//   "GitHub: Let's build from here"
// We split on common separators and prefer the shortest meaningful chunk.
export function extractBrandFromTitle(title) {
  if (!title) return null;
  const cleaned = title.trim();
  // Split on common title separators: " | ", " - ", " – ", " — ", " · ", ": "
  // (colon doesn't require leading space — handles "SaaSOffers: tagline")
  const parts = cleaned
    .split(/\s*[|\-–—·]\s+|:\s+/)
    .map((p) => p.trim())
    .map((p) => p.replace(/\.(fr|com|org|net|io|co|de|es|it|uk)$/i, "")) // strip trailing TLDs
    .filter(Boolean);
  if (parts.length === 0) return null;
  // Prefer the shortest meaningful segment (usually the brand)
  const sorted = parts.slice().sort((a, b) => a.length - b.length);
  const shortest = sorted[0];
  if (shortest.length >= 2 && shortest.length <= 32) return shortest;
  // Fall back to first 5 words
  return parts[0].split(/\s+/).slice(0, 5).join(" ");
}
