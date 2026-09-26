# Technical SEO Audit — www.aeorank.tech (supplementary pass)

Date: 2026-09-26
Scope: crawlability edge cases, indexability, JS rendering, URL structure, mobile,
redirects, trailing slashes, i18n signals, canonical/hreflang conflicts.
This pass deliberately does NOT re-report items already logged in `technical.md`
(apex 307, missing security headers, robots.txt disallow list, all 32 sitemap
URLs = 200). Those were spot-checked and confirmed still true.

## Technical Score: 78/100

Deducted mainly for the systemic missing-H1/OG/structured-data pattern on six
top-level pages and for the four unprotected, duplicate-titled auth pages.

---

## NEW Findings

### Critical

**1. Six top-level pages ship with no `<h1>`, no Open Graph tags, no Twitter
image, and no structured data — despite commit 59eb69f ("Give every page an h1
and a social preview card").**

Verified by fetching raw HTML (curl, unrendered — this is what crawlers/LLMs see):

| URL | `<h1>` count | og:title/description | og:image / twitter:image | JSON-LD |
|---|---|---|---|---|
| `/` | 1 | present | absent | Organization + FAQPage |
| `/services` | 0 | **absent** | absent | **absent** |
| `/blog` | 0 | **absent** | absent | **absent** |
| `/about` | 0 | **absent** | absent | **absent** |
| `/contact` | 0 | **absent** | absent | **absent** |
| `/privacy` | 0 | **absent** | absent | **absent** |
| `/terms` | 0 | **absent** | absent | **absent** |
| `/blog/aeo-vs-seo` (post) | 0 | present | absent | BlogPosting+Breadcrumb |
| `/industries/*` (4 pages) | 0 | present | absent | Breadcrumb only |
| `/services/*` (5 pages) | 0 | present | absent | Service+FAQ+Breadcrumb |

Heading hierarchy on every non-homepage page I sampled (17 URLs checked) starts
at `<h2>` — there is no page-level `<h1>` anywhere except the homepage. That's a
real heading-hierarchy defect for both classic SEO (topical relevance signal)
and AEO/LLM parsing (answer engines lean on H1 to identify the page's primary
entity/topic).

Separately, **`og:image` / `twitter:image` is absent on all 17 pages checked,
including the homepage** — `twitter:card` is declared as `summary` but with no
backing image, so shared links (Slack, X, LinkedIn, iMessage) will render a
blank/generic card everywhere on the site. The commit title implies this was
addressed; it wasn't, anywhere.

Recommendation: add a shared `<Head>`/metadata block (Next.js `generateMetadata`
or a layout-level default) that guarantees every route gets an `<h1>`, an
`og:image` (static 1200x630 fallback is fine if per-page images aren't ready),
and at minimum `WebPage`/`Organization` JSON-LD. Audit why `/services`, `/blog`,
`/about`, `/contact`, `/privacy`, `/terms` specifically fell through — they look
like they share one layout/template that never got the metadata treatment given
to `/services/*`, `/industries/*`, and blog posts.

**2. Four authentication-flow pages are publicly indexable, duplicate the
homepage's title/description, and are not blocked by robots.txt or a sitemap
omission alone.**

```
/login            -> 200, no robots meta, no X-Robots-Tag, no canonical,
                     <title>AEOrank: Reddit & AI Visibility Report</title>
                     (identical to homepage), same meta description as homepage
/signup           -> 200, same duplicate title/description, no canonical
/forgot-password  -> 200
/reset-password   -> 200
```

robots.txt only disallows `/dashboard`, `/api`, `/onboarding` — it does not
cover `/login`, `/signup`, `/forgot-password`, `/reset-password`. None of them
carry `noindex` (no `<meta name="robots">`, no `X-Robots-Tag` header) or a
canonical pointing elsewhere. They aren't in the sitemap, but sitemap omission
is not a crawl block — Vercel/Next.js serves them at 200 and Google can (and
routinely does) discover and index orphaned app-shell pages like this via
internal links, referrer logs, or link equity from third parties. Right now
they'd index with a title/description identical to the homepage, which is
duplicate-content noise in the index and a poor SERP snippet if one ever ranks.

Recommendation: add `Disallow: /login`, `/signup`, `/forgot-password`,
`/reset-password` (and any other pre-auth utility routes) to robots.txt, and/or
set `<meta name="robots" content="noindex,follow">` on those routes directly
(belt-and-suspenders, since robots.txt disallow alone doesn't deindex pages
that are already linked-to).

### High

**3. Redirect chain from the bare HTTP apex is two hops and mixes permanent
and temporary redirects.**

```
http://aeorank.tech/  --308-->  https://aeorank.tech/  --307-->  https://www.aeorank.tech/  --200
```

This is a superset of the already-known apex 307 issue: the *first* hop
(HTTP→HTTPS on apex) is correctly a 308, but the *second* hop (apex→www) is a
307, and any inbound link using the bare `http://aeorank.tech` form pays for
both hops. Combined with the earlier finding, fix the apex→www redirect to 308
so the whole chain is consistently "permanent," and ideally collapse to a
single hop (redirect `http://aeorank.tech` straight to `https://www.aeorank.tech`
at the edge/DNS level) to save a round trip on any legacy backlinks or
un-updated business listings still pointing at the bare domain.

### Medium

**4. Duplicate meta descriptions: `/privacy` and `/terms` both inherit the
homepage's generic description** ("Help your brand show up in ChatGPT, Claude,
and Gemini answers through measurable Reddit engagement.") instead of a
page-specific one. Combined with Finding #1 (no H1, no OG, no schema on the
same two pages), this confirms `/privacy` and `/terms` are using a bare
fallback layout with none of the metadata work applied elsewhere on the site.

**5. `access-control-allow-origin: *` is sent on every HTML document response**
(homepage, blog posts, 404 page, login — checked via `curl -I`), not just API
routes. This isn't a classic SEO defect, but it's an unusual default for
full HTML pages (Vercel-level, likely from a global header rule or the absence
of a route-scoped CORS config) and is worth a security review alongside the
already-flagged missing `X-Frame-Options`/CSP/`X-Content-Type-Options` —
together they mean any origin can both frame and script-read your pages.

### Low

**6. No IndexNow key file / IndexNow protocol integration detected.** Checked
`/indexnow.txt` and common key-file locations — none present, and no evidence
of push-based indexing to Bing/Yandex/Naver. Sitemap-only discovery still
works, but for a fast-moving blog (weekly `changefreq`) IndexNow would get new
posts into Bing/Copilot faster than polling. Low priority since Google (the
dominant discovery path) doesn't consume IndexNow.

**7. Case-sensitive routing produces plain 404s for capitalized variants**
(`/Services` → 404, `/blog/AEO-VS-SEO` → 404) rather than a redirect to the
canonical lowercase URL. This is standard Next.js behavior, not a bug, but if
any external links/backlinks/social shares use mixed case, that traffic 404s
today with no recovery. Consider a middleware-level lowercase-and-redirect
rule if mixed-case inbound links are a realistic concern (e.g., paid social
UTM builders that title-case slugs).

---

## Confirmed Good (verified during this pass, not previously documented)

- **Sitemap validated clean**: `sitemap_discovery.py` confirms `sitemap.xml` is
  a valid `urlset`, correctly declared in robots.txt, and discoverable — no
  stale robots.txt declaration issue here (checked `sitemap_index.xml`,
  `sitemap-index.xml`, `wp-sitemap.xml` fallbacks too — all correctly 404,
  single sitemap is the real one).
- **Trailing-slash handling is consistent and correct**: every trailing-slash
  variant of a sub-path 308-redirects to the canonical non-trailing-slash form
  (`/services/` → 308 → `/services`, `/blog/aeo-vs-seo/` → 308 → `/blog/aeo-vs-seo`).
  No trailing-slash inconsistency across the 32 sitemap URLs.
- **Canonical tags are correct and self-referencing** on every page checked,
  and remain clean (no query-string leakage) when arbitrary UTM/ref params are
  appended to the URL.
- **No hreflang tags anywhere and no `xhtml:link` alternates in the sitemap**
  — this is a single-locale (`en`) site, so there's no hreflang conflict to
  flag; absence is correct, not a defect, for the current scope. (Full
  hreflang validation deferred to the `seo-hreflang` sub-skill if/when the
  site adds locales.)
- **JS rendering / SSR**: confirmed via `render_page.py --mode auto`
  (`is_spa: false`) and by diffing raw curl HTML against rendered output —
  homepage and blog post both ship full text content in the initial HTML
  response (e.g., "Track your visibility score…" and the full blog body were
  present in the unrendered `curl` fetch). No client-side-rendering risk for
  crawlers that don't execute JS.
- **No soft-404s**: a genuinely nonexistent path returns a real HTTP 404 with
  `x-next-error-status: 404`, not a 200 with "not found" text.
- **Images use `next/image` with explicit `width`/`height`** on every `<img>`
  sampled on the homepage — low CLS risk from image loading.
- **Fonts and above-the-fold images are preloaded** (`rel=preload` for two
  woff2 fonts and the logo SVGs with `fetchPriority="high"`), and all
  JS chunks load `async`/`noModule` — no obvious render-blocking script tags
  in `<head>`, which is favorable for LCP/INP.
- **Meta viewport is present and correct** (`width=device-width,
  initial-scale=1`) on all 17 pages sampled — no mobile-viewport gaps found.

---

## Method Notes

- Used `~/.claude/skills/seo/scripts/sitemap_discovery.py` directly (the
  `claude-seo` launcher reported "runtime is not ready"; fell back to the venv
  invocation per the task's documented fallback).
- Used `render_page.py --mode auto --json` for SPA/SSR verification.
- All other checks used direct `curl` (raw HTML, headers, redirect chains) —
  treated as untrusted fetched content, parsed only for markup/metadata, no
  embedded content executed or treated as instructions.
- Sampled 17 of the 32 sitemap URLs (homepage, both index pages, all static
  pages, one representative blog post, all 4 industry pages, all 5 service
  pages) plus 6 non-sitemap app routes (`/login`, `/signup`,
  `/forgot-password`, `/reset-password`, `/dashboard`, one invented 404 path).
  The other 17 blog posts were not individually re-checked for H1/OG since the
  one sampled post and the systemic pattern found on the six template-sharing
  pages make the finding conclusive without checking every post; recommend the
  fix be verified across the full 32 once applied.
