# Technical SEO Re-Audit — www.aeorank.tech (Pass 2)

Date: 2026-09-27. Compares against the pass-1 audit (2026-09-26, see
`findings/technical.md` and `findings/sitemap.md`) after a batch of fixes.

Methodology: live `curl` fetches of all 37 sitemap URLs + the 4 new
noindex auth pages (41 URLs total, all returned live HTML, not just source
inspection), cross-checked against the deployed source in this repo
(HEAD = `1dea192`, matches `git log`). No Lighthouse/PageSpeed API run this
pass (not checked — see "Not checked" section).

---

## 1. VERIFIED FIXED

- **h1 on every page** — confirmed present (exactly one `<h1>`) on all 37
  sitemap URLs (home, /services, /pricing, /blog, /industries, /about,
  /contact, /privacy, /terms, all 28 blog posts, all 4 /industries/*, all 5
  /services/*). **Exception**: the 4 new auth utility pages (/login,
  /signup, /forgot-password, /reset-password) have **zero** `<h1>` — they
  open directly on `<h2>Accounts are coming soon</h2>` /
  `<h2>Log in</h2>` etc. (confirmed in `app/login/page.js`,
  `app/signup/page.js`, `app/forgot-password/page.js`,
  `app/reset-password/page.js`). These are noindex,follow so it's not an
  indexability problem, but the "h1 on every page" claim doesn't literally
  cover them — see NEW below.
- **og:image sitewide** — confirmed on all 41 fetched URLs, all resolve to
  a real 200 `image/png` (1200x630) at `/opengraph-image` (single static
  generated card via `app/opengraph-image.js`, `metadataBase` resolves it
  absolutely). It's one sitewide image, not a per-page dynamic card — that
  matches the described fix ("a generated /opengraph-image card", singular).
- **Sitemap now derived, 37 URLs** — confirmed live at
  `https://www.aeorank.tech/sitemap.xml`: well-formed XML, exactly 37
  `<loc>` entries, all 37 return live 200 pages. `/blog/what-is-aeo` is
  present. Source (`app/sitemap.js`) now imports `posts`, `services`,
  `industries` directly from the page modules instead of hand-copied
  arrays — matches the fix description.
- **Real per-post blog `lastmod`** — confirmed: blog post entries carry
  distinct dates (e.g. `2026-08-28`, `2026-08-27`) parsed from each post's
  own `date` field, not one blanket date. **Partial**: static pages,
  `/industries/*`, and `/services/*` still use `new Date()` (today's build
  date) for `lastmod` — see STILL BROKEN.
- **/login, /signup, /forgot-password, /reset-password → noindex,follow** —
  confirmed via live HTML: all 4 carry
  `<meta name="robots" content="noindex, follow">`. All 4 still return
  live 200 HTML (not blocked at HTTP/robots level), which is correct
  noindex-not-disallow behavior.
- **Apex → www is now 308** — confirmed:
  `http://aeorank.tech` → 308 → `https://aeorank.tech/` → 308 →
  `https://www.aeorank.tech/`. Both hops are now permanent 308s (was 307
  temporary in pass 1).
- **/industries index page created** — confirmed live, 200, real content,
  linked from the homepage and from the global footer, with correct
  BreadcrumbList JSON-LD on child pages now pointing Home → Industries →
  [industry] (previously the child breadcrumb pointed straight at the
  homepage — that's fixed, verified in `/industries/saas`'s JSON-LD).
- **/pricing page created** — confirmed live, 200 (was 404), in the
  sitemap, linked from the homepage and footer, has its own canonical,
  title, description, and Organization/WebSite/BreadcrumbList JSON-LD.
- **Organization + WebSite schema sitewide** — confirmed emitted by
  `components/MarketingLayout.js` (single shared `@id`:
  `#organization` / `#website`) and present in every page fetched that uses
  that layout, including the new /pricing and /industries pages. Not
  present on /login (expected — that page doesn't use MarketingLayout and
  is noindexed anyway).
- **gtag.js on lazyOnload** — confirmed in `app/layout.js`
  (`strategy="lazyOnload"` on both the gtag.js loader and the inline
  config script). Confirmed in live HTML: no blocking
  `<script src="https://www.googletagmanager.com/gtag/js...">` tag in the
  initial document; the only reference is inside Next's lazy-script JSON
  payload, consistent with deferred, post-load injection.
- **Blog body subheads h3 → h2** — confirmed in
  `app/blog/[slug]/page.js` (section headings render via `<h2>`, line
  ~1104) and confirmed live (5x `<h2>` in the fetched
  `/blog/getting-cited-by-claude` body, in addition to the page's single
  `<h1>`).

## 2. STILL BROKEN (carried over from pass 1, unfixed)

- **access-control-allow-origin: `*` on HTML documents** — confirmed still
  present on `https://www.aeorank.tech/` response headers. Not re-detailed
  further per instructions (known, not yet fixed).
- **Missing x-frame-options / x-content-type-options / referrer-policy /
  content-security-policy** — confirmed still absent from response
  headers (only `strict-transport-security` present). Not re-detailed
  further per instructions (known, not yet fixed).
- **No IndexNow integration** — still no `/indexnow.txt` or key file
  (checked `/indexnow.txt` and `/.well-known/indexnow`, both 404). Flagged
  in pass 1 as low priority; still unaddressed. Not part of the shipped
  batch, so not really "regressed," just never done.

## 3. NEW (found this pass, not previously reported)

- **About / Contact / Privacy / Terms have no canonical tag at all**, and
  no page-specific Open Graph override, so they silently inherit the
  **homepage's** `og:title` ("AEOrank: Reddit & AI Visibility Report"),
  `og:description`, and `og:url` (`https://www.aeorank.tech`) instead of
  their own. Confirmed in live HTML and in source
  (`app/about/page.js`, `app/contact/page.js`, `app/privacy/page.js`,
  `app/terms/page.js` — each only sets `title`/`description` in
  `export const metadata`, no `alternates.canonical`, no `openGraph`
  block), unlike `app/services/page.js` and `app/blog/page.js`, which do
  set `alternates: { canonical: ... }`. Impact: sharing /about, /contact,
  /privacy, or /terms on social platforms will show the homepage's title
  and URL in the preview card, not the page's own; and Google has no
  explicit self-referencing canonical signal on these 4 pages (lower risk
  since content is unique, but inconsistent with the rest of the site).
- **Privacy and Terms also inherit the homepage's meta description**
  verbatim ("Help your brand show up in ChatGPT, Claude, and Gemini
  answers through measurable Reddit engagement.") — same root cause
  (`export const metadata` on those two pages sets only `title`, no
  `description`, so it falls through to root `layout.js`'s default).
  Confirmed live on both `/privacy` and `/terms`.
- **Auth pages (/login, /signup, /forgot-password, /reset-password) have
  no `<h1>`** at all — the top-level heading on each is an `<h2>`
  ("Accounts are coming soon" / "Log in" / "Create an account" / "Reset
  your password" / "Set a new password"), so there's a heading hierarchy
  skip in addition to the missing h1. Low severity since all 4 are
  noindex,follow, but worth noting since the sitewide h1 push apparently
  stopped short of these 4 routes.
- **Fragmented entity graph on blog posts**: each `BlogPosting`'s
  `publisher` and `author.worksFor` re-declare a full, separate anonymous
  `Organization` object (`name`/`url`/`logo` inline) instead of referencing
  the sitewide canonical node (`{"@id": "https://www.aeorank.tech/#organization"}`)
  that `MarketingLayout.js` now emits on every page. Not invalid, just
  redundant — three different unlinked Organization nodes on a single
  blog post page (confirmed via JSON-LD parse of `/blog/what-is-aeo`: 1
  canonical `#organization` node from the layout, plus 2 more inline,
  disconnected ones inside `publisher`/`author.worksFor`). This undercuts
  the stated goal of the sitewide entity-graph commit
  (`d16e98f Make the entity graph sitewide and link the one profile we
  have`) — the graph is sitewide but not fully unified on post pages.
  Same pattern also seen on service pages (2x Organization mentions vs.
  the layout's 1).
- **Legacy cross-product routes on the aeorank.tech domain use temporary
  (307) redirects**, inconsistent with the apex fix: `/apply-poster` → 307
  → `/signup`, `/poster` → 307 → `/login`, `/crewquest` → 307 → `/`
  (all via `NextResponse.redirect()` default status in `middleware.js`).
  Low impact — nothing on the site links to these paths internally, so
  crawl exposure is limited to stray backlinks/bookmarks from the
  CrewQuest product — but flagging since it's the same "temporary vs.
  permanent redirect" issue that was just fixed for the apex.
- **New routes /pricing and /industries specifically**: no problems found.
  Both resolve 200, both have correct self-referential canonicals
  (`https://www.aeorank.tech/pricing`, `https://www.aeorank.tech/industries`),
  both are in the sitemap and resolve to the exact URL listed (no redirect
  in the sitemap-to-live-page path), both carry unique title/description,
  both carry Organization+WebSite(+BreadcrumbList on /industries) JSON-LD,
  and both are internally linked from the homepage and global footer (no
  longer orphaned). No crawl trap identified on either. The only issue
  touching these pages is the sitewide `lastmod` one below, which affects
  /industries and all /industries/*, /services/* equally, not something
  introduced specifically by the new pages.
- **`lastmod` still partly fabricated**: the pass-1 fix note says the
  sitemap now uses "real per-post lastmod" — confirmed true for blog only.
  `/industries` (index + 4 children) and `/services` (index + 5 children),
  plus all 9 static pages, still stamp `new Date()` (today, i.e.
  `2026-09-27` for every one of them, and it will read as "changed today"
  on every future deploy regardless of whether the content actually
  changed) rather than any real content date. This is the same
  fabricated-lastmod problem pass 1 flagged as "Low," just narrowed in
  scope rather than eliminated.

## Not checked this pass (ran out of turns — flag for pass 3, don't assume clean)

- Lighthouse/PageSpeed/Core Web Vitals lab measurement (LCP/INP/CLS
  numbers) — only did static-HTML inspection (image `width`/`height`
  present on all 4 home page `<img>` tags, viewport tag correct, no
  render-blocking `<script>` in `<head>` besides a `noModule` legacy
  polyfill). No real field/lab CWV numbers gathered.
- Full meta-description length/duplication audit across all 28 blog posts
  and all 9 services/industries pages (spot-checked home, about, pricing,
  industries, services, blog index only).
- Full alt-text audit on blog post body images.
- robots.txt / sitemap behavior under user-agent variation (AI crawler
  tokens — GPTBot, ClaudeBot, PerplexityBot, etc.) — not checked this
  pass.
- Structured data validation via Google's Rich Results Test / Schema.org
  validator (only did manual JSON-LD parsing for shape/@id checks, not full
  spec validation) for FAQPage, Service, BlogPosting on all instances —
  only spot-checked home, one service page, one blog post, one industry
  page.
- hreflang — confirmed absent sitewide (correct for a single-locale site),
  but did not run the full `seo-hreflang` sub-skill.
- Case-sensitive routing 404s (`/Services` → 404) — reconfirmed this still
  happens (carried from pass 1's low-priority note #7 in
  `findings/technical-agent.md`) but did not re-verify every mixed-case
  variant.

## URL coverage this pass

All 37 sitemap URLs fetched and checked for h1/og:image/canonical/robots
meta/title (100% of the sitemap). Plus the 4 non-sitemap noindex auth
pages (/login, /signup, /forgot-password, /reset-password). Total: 41/41
URLs fetched live, all 200. Deep-dived (full JSON-LD parse, byte size,
image audit) on a smaller sample: home, about, pricing, industries index,
industries/saas, services/aeo-management, blog/what-is-aeo,
blog/getting-cited-by-claude, login.
