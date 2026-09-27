# GEO Audit — Pass 2 (Delta)

**Site:** https://www.aeorank.tech
**Pass 1:** 2026-09-26 — 50/100
**Pass 2:** 2026-09-27 — **65/100 (+15)**
**Method:** SSR fetch of all 37 sitemap URLs, live bot-UA probes, JSON-LD graph extraction, per-section passage scoring against trafilatura-stripped text.

---

## Score movement

| Dimension | Weight | Pass 1 | Pass 2 | Δ |
|---|---|---|---|---|
| Citability | 25% | 62 | **76** | +14 |
| Structural readability | 20% | 45 | **78** | +33 |
| Multi-modal content | 15% | 18 | **26** | +8 |
| Authority & brand signals | 20% | 28 | **42** | +14 |
| Technical accessibility | 20% | 86 | **88** | +2 |
| **Weighted total** | | **50** | **64.5 → 65** | **+15** |

Structural readability carried the pass. Multi-modal is now the binding constraint.

---

## Verification of the eight claimed fixes

| Claim | Verdict | Evidence |
|---|---|---|
| All 37 pages have exactly one h1 | **Confirmed** | 37/37 pages, `h1 == 1`. Zero exceptions. |
| Blog sections are h2, outline no longer skips | **Confirmed** | All 19 posts are flat h2 outlines with zero h3. No skipped levels anywhere. |
| Lists / tables / bold now present | **Partially confirmed** | Sitewide: 49 `<ul>`, 10 `<ol>`, 221 `<li>`, 4 `<table>`, 112 `<strong>`. But unevenly applied — **7 of 19 posts still have zero lists, zero tables, zero bold** (see below). |
| Outbound citations added | **Partially confirmed** | Only the 2 new posts carry them. **17 of 19 posts have zero outbound citations** beyond the sitewide footer boilerplate (calendly.com, linkedin.com). |
| Two new posts shipped | **Confirmed** | `/blog/reddit-ai-visibility-guide` 1,676w, 10 h2s, 6 lists, 29 li, 1 table, 29 strong, 3 authoritative outbound domains. `/blog/best-ai-visibility-tools` 1,030w, 7 h2s, 1 table, 5 named vendor domains. |
| Organization sitewide + WebSite bound by @id | **Confirmed** | `Organization` + `WebSite` on 37/37 pages. `WebSite.publisher` → `{"@id": ".../#organization"}`. Correctly bound. |
| BlogPosting.image populated | **Confirmed** | 19/19 posts carry `image: ["https://www.aeorank.tech/opengraph-image"]`. Route resolves HTTP 200, immutable cache. Was null 16/16. |
| LinkedIn sameAs linked from footer | **Confirmed** | `www.linkedin.com` present in rendered HTML on 37/37 pages. The single `sameAs` is now corroborated by a real crawlable link. |

### The formatting rollout missed 7 posts

Zero lists, zero tables, zero bold, zero citations — unchanged since pass 1:

- `crowdreply-vs-aeorank` (541w)
- `entity-authority-ai-citation` (941w)
- `how-we-verify-reddit-threads` (389w)
- `partner-network-ai-visibility` (514w)
- `profound-vs-peec-vs-aeorank` (600w)
- `sentiment-in-ai-citations` (604w)
- `why-chatgpt-cites-reddit-threads` (881w)

Two of those are head-to-head comparison posts (`crowdreply-vs-aeorank`, `profound-vs-peec-vs-aeorank`) shipped with **no comparison table**. Comparison queries are precisely the query class answer engines resolve with tabular extraction. This is the most mechanical extraction loss on the site.

---

## AI crawler access — 88/100

All probes against `/blog/reddit-ai-visibility-guide`, full 75,118-byte SSR payload returned to every agent:

| Crawler | Governs | Status |
|---|---|---|
| OAI-SearchBot | ChatGPT Search citability | **200 — allowed** |
| ChatGPT-User | ChatGPT user-initiated fetch | **200 — allowed** |
| Claude-SearchBot | Claude search citability | **200 — allowed** |
| PerplexityBot | Perplexity citability | **200 — allowed** |
| Googlebot | Google Search + AI Overviews | **200 — allowed** |
| bingbot | Bing / Copilot | **200 — allowed** |
| GPTBot | OpenAI *training* only | **200 — allowed** |

`robots.txt` is a single wildcard group: `Allow: /` with `Disallow: /dashboard`, `/api`, `/onboarding`, plus a valid sitemap reference. Correct and sufficient — the app routes that should be closed are closed, and nothing that should be citable is blocked.

Two notes, neither a defect:
- There are **no crawler-specific directives at all**. Search crawlers are allowed by the wildcard, which is what matters for citability. But training crawlers (CCBot, ClaudeBot, Google-Extended, Applebot-Extended, cohere-ai) are also fully allowed by default. That is a licensing posture, not a visibility issue — worth a deliberate decision rather than an accident.
- Apex `aeorank.tech` → `www` via 308. Clean.

**SSR confirmed:** `is_spa: false`, 137KB of content in the raw fetch with no Playwright needed, zero console errors. Technical accessibility is not this site's problem.

### llms.txt — still missing (unchanged)

`/llms.txt` → **404**. `/llms-full.txt` → 404. No `llms.txt` anywhere in the repo (`public/` contains only `easyrep/`, `icon.svg`, `logo-light.svg`, `logo.svg`). No RSL 1.0 licensing (`/license.xml` → 404), no `<link rel="license">`.

Unchanged from pass 1. Low effort to fix, but honest framing: no major answer engine has confirmed consuming llms.txt as a ranking or retrieval input. Treat it as cheap hygiene, not leverage.

---

## Citability — 76 (+14)

**Genuinely better.** Passage geometry is now good across the whole blog, not just the new posts:

- 103 content sections measured. **Median section length 148 words** — inside the 130–170 heuristic band.
- **73 of 103 sections (71%) fall in 100–220 words** — extractable as self-contained answers.
- Only 3 sections under 80 words.
- Question-shaped headings: **56 of 102** (55%) sitewide, up from near-zero question framing in body outlines.

The new flagship post is the template working as intended. Answer-first leads that resolve in the first clause:

- "How long does Reddit visibility take to show up?" → "Slower than paid, faster than domain authority."
- "Does any of this work without the rest of your AEO in place?" → "Partly, and less than you would like."
- "What should you not outsource?" → "The judgement calls, and there are three."

That is directly quotable. 9 of its 10 sections land in the extractable band; 4 headings are strictly interrogative and 8 are question-led.

**Still capping the score:**

1. **17 of 19 posts have zero outbound citations.** Perplexity and ChatGPT both reward citation-dense pages; unsourced assertion reads as marketing copy.
2. **4 tables across 37 pages.** Almost every comparison and pricing claim is prose.
3. **17 sections run over 250 words**, diluting the extractable unit.
4. **16 non-blog pages are under 300 words** — `/about` 92w, `/contact` 26w, 5 service pages 143–160w, 5 industry pages 170–186w, `/pricing` 264w. These pages carry `Service` and `FAQPage` schema but have almost no quotable prose behind the markup. Schema promises an answer the page does not contain.
5. **Unresolved claim integrity** (owner's decision, noted not re-litigated): the homepage still renders "Take advantage of over 5.5B monthly visitors" directly above "With 1.2B monthly visitors, Reddit…" — two contradictory figures in adjacent DOM nodes. A model extracting a statistic from that block cannot resolve which is asserted, so it is likely to skip the passage entirely. This is the one business decision with a measurable citability cost.

---

## Structural readability — 78 (+33)

The largest genuine improvement, and it is real rather than cosmetic.

- **h1 discipline: 37/37.** The pass 1 blocker is gone.
- **Heading hierarchy is valid everywhere.** No skipped levels; blog outlines are flat h2.
- **Schema coverage is now broad and correctly linked:** `Organization` + `WebSite` on 37/37 bound by `@id`; `BlogPosting` + `BreadcrumbList` on 19/19 posts; `Service` on 10 service/industry pages; `FAQPage` on the homepage and 5 service pages; `ItemList` on `/industries`. Zero JSON-LD parse errors across 37 pages.
- 148 images, **0 missing alt text**.

Remaining structural gaps:

- `BlogPosting.publisher` is an **inline duplicate Organization node** rather than an `@id` reference to `#organization`. Every post therefore asserts two Organization entities, one of them unlinked. Trivial fix, tightens the entity graph.
- **No table of contents or anchor-linked headings** on any post. Anchors give answer engines addressable passage targets.
- The 17 overlong sections have **no h3 subdivision** — the flat outline is clean but under-segmented where it matters.
- Homepage carries 9 h2 + 20 h3, most of it feature chrome rather than answer structure.

---

## Multi-modal — 26 (+8), effectively unchanged

This is now the weakest dimension and the one the pass did not address.

- **All 148 images are SVG** — icons, logos, decorative illustration. Zero raster content images.
- **Zero `<video>`, zero `<iframe>`, zero YouTube references** anywhere on the site.
- **Zero original diagrams, screenshots, or charts** inside article bodies. The product is a dashboard and not one screenshot of it appears in any post.
- No `ImageObject` or `VideoObject` beyond the `BlogPosting.image` social card.
- The 4 tables are the site's only data visualisation of any kind.

The `BlogPosting.image` fix is worth the +8 — it went from null on 16/16 to a resolving 200 on 19/19, which matters for AI Overview and Copilot card eligibility. But it is schema hygiene pointing at a generated social card, not multi-modal content. Nothing a model could cite as a figure was added.

YouTube carries the strongest observed correlation with AI citation (~0.737). This site has no YouTube footprint at all.

---

## Authority & brand signals — 42 (+14)

**Genuinely better:**

- The entity is now asserted on **37 pages instead of 1**, with `WebSite` correctly bound to it. Consistent `@id` across every URL is how an engine builds entity confidence.
- The single `sameAs` is **no longer orphaned** — LinkedIn is linked sitewide from the footer, so the machine-readable claim has a crawlable human-visible counterpart.
- The two new posts cite **authoritative third parties** (`developers.google.com`, `schema.org`, `www.redditinc.com`) and the tools post **names five competitors by link** (Profound, Peec, Scrunch, AthenaHQ, CrowdReply). Willingness to name rivals is a trust signal answer engines reward on comparison queries — this is the highest-authority content on the site.

**Unchanged:**

- **One `sameAs` total.** No Reddit, X, YouTube, Crunchbase, G2, or GitHub. For a company whose entire thesis is Reddit visibility, having no linked Reddit presence is a credibility gap a model can notice.
- **Author is still an orphan byline.** `Ilyas Lemzouri` is `author` on 19 posts with `worksFor` set, but there is no `/author` page, no `Person.sameAs`, no bio — and `/about` (92 words) **does not mention him at all**. The byline asserts expertise nothing corroborates.
- **`dateModified` equals `datePublished` on 19/19 posts.** Zero freshness signal. Dates span 2026-03-06 to 2026-09-27, so the older half looks stale and nothing signals maintenance.
- No `foundingDate`, `contactPoint`, or `address` on the Organization. (Blocked on owner-supplied facts — noted, not re-litigated.)
- No third-party reviews, no `AggregateRating`.
- **Wikidata: still absent.** The finding that no vendor in this category has an entity (Peec and AthenaHQ also absent; Profound and Scrunch resolve to a video game and a hair tie) is accurate and the notability argument is sound. Correctly deprioritised — I would not spend effort here.
- The **"Most clients see 200–400% increase in AI citation frequency within 6 months"** claim remains inside `FAQPage` structured data on `/services/citation-building`. Flagging once and moving on, per instruction: an unsubstantiated performance guarantee in a *machine-readable* field is a different risk class from the same claim in prose, because it is offered to engines as a factual answer. It is also the kind of claim that gets a page demoted rather than cited.

---

## Platform scores

| Platform | Pass 1 | Pass 2 | Why |
|---|---|---|---|
| Google AI Overviews | ~55 | **66** | Googlebot allowed, SSR, h1 fixed, broad valid schema, good passage geometry. Held back by 16 thin pages and zero in-content imagery. |
| ChatGPT Search | ~48 | **62** | OAI-SearchBot 200 with full payload. Reddit-topical depth aligns with how ChatGPT weights Reddit. Held back by thin entity corroboration and a single sameAs. |
| Perplexity | ~46 | **60** | PerplexityBot 200. Question-shaped headings and outbound citations help most here — but only 2 of 19 posts have citations, so the gain is concentrated in two URLs. |
| Bing Copilot | ~44 | **55** | bingbot 200, schema solid. Copilot leans hardest on brand and freshness signals, which remain this site's weakest axis. |

Only ~11% of domains are cited by both ChatGPT and Google AIO, so these gaps are worth treating as separate targets rather than one number.

---

## Top 5 remaining changes, by leverage

### 1. Port the proven post template to the 7 unformatted posts, then the remaining 10 — HIGHEST LEVERAGE
**Effort:** ~2h per post, 17 posts. Start with the 7 that have zero formatting.
The site has *demonstrated* it can produce a citable page: `reddit-ai-visibility-guide` hits 80% question-led headings, 9/10 sections in the extractable band, a comparison table, and 3 authoritative citations. 17 posts sit at zero citations and 7 at zero formatting of any kind. Each port should add: 3–5 outbound citations to primary sources, question-shaped h2s, one comparison or data table, bold key claims, and **one original diagram or product screenshot**. This single action moves Citability, Authority, *and* Multi-modal simultaneously across 46% of the site's URLs, and it needs no new facts from the owner. Begin with the two comparison posts that shipped without comparison tables.

### 2. Put original visuals in content
**Effort:** 4–6h for a reusable set.
Multi-modal at 26 is the lowest dimension. Product screenshots of the dashboard (which exist as a product but appear nowhere), plus 3–4 original diagrams, marked up as `ImageObject` with descriptive captions. Zero raster content images across 37 pages is the single most glaring absence on the site.

### 3. Fix the author entity
**Effort:** 2h for the page, minutes for the schema.
Create `/author/ilyas-lemzouri` with a real bio and credentials, link it from all 19 bylines, add `Person.sameAs` → LinkedIn, and mention him on `/about`. The `worksFor` claim is already there; it just has nothing behind it. Even a short honest bio converts 19 orphan bylines into a corroborated author entity.

### 4. Thicken the 10 service and industry pages
**Effort:** 1–2h per page.
143–186 words each, carrying `Service` and `FAQPage` schema that promises answers the pages do not contain. Target 600–800 words structured as 4–5 self-contained 130–170 word answer blocks. These are the commercial-intent pages — the ones you most want named in an answer.

### 5. Ship llms.txt, add anchored TOCs, and reference the Organization by @id
**Effort:** 2h total.
Three cheap items: `/llms.txt` (currently 404) listing canonical URLs with one-line descriptions; anchor-linked headings plus a TOC on every post so engines have addressable passage targets; and replace the inline duplicate `BlogPosting.publisher` Organization with `{"@id": ".../#organization"}` so the graph resolves to one entity instead of two. Also worth a deliberate decision on training-crawler directives, which are currently allowed by default rather than by choice.

---

## Structured findings

```json
{
  "category": "AI Search Readiness",
  "pass": 2,
  "date": "2026-09-27",
  "score": 65,
  "previous_score": 50,
  "delta": 15,
  "dimensions": {
    "citability": {"score": 76, "prev": 62, "delta": 14, "weight": 0.25},
    "structural_readability": {"score": 78, "prev": 45, "delta": 33, "weight": 0.20},
    "multi_modal": {"score": 26, "prev": 18, "delta": 8, "weight": 0.15},
    "authority_brand": {"score": 42, "prev": 28, "delta": 14, "weight": 0.20},
    "technical_accessibility": {"score": 88, "prev": 86, "delta": 2, "weight": 0.20}
  },
  "crawler_access": {
    "OAI-SearchBot": "allowed_200", "Claude-SearchBot": "allowed_200",
    "PerplexityBot": "allowed_200", "ChatGPT-User": "allowed_200",
    "Googlebot": "allowed_200", "bingbot": "allowed_200", "GPTBot": "allowed_200",
    "robots_txt": "wildcard_allow_with_app_disallows",
    "crawler_specific_directives": false
  },
  "llms_txt": {"status": "missing", "http": 404, "unchanged_since_pass1": true},
  "rsl_licensing": {"status": "absent"},
  "rendering": {"ssr": true, "is_spa": false, "console_errors": 0},
  "verified_fixes": {
    "single_h1_all_pages": {"confirmed": true, "coverage": "37/37"},
    "blog_h2_outline": {"confirmed": true, "coverage": "19/19"},
    "lists_tables_bold": {"confirmed": "partial", "note": "7/19 posts still unformatted"},
    "outbound_citations": {"confirmed": "partial", "note": "17/19 posts have none"},
    "organization_sitewide": {"confirmed": true, "coverage": "37/37", "website_id_bound": true},
    "blogposting_image": {"confirmed": true, "coverage": "19/19", "resolves": 200},
    "linkedin_footer_link": {"confirmed": true, "coverage": "37/37"}
  },
  "metrics": {
    "pages_audited": 37, "blog_posts": 19,
    "sections_measured": 103, "median_section_words": 148,
    "sections_in_100_220_band": 73, "sections_over_250": 17,
    "question_shaped_headings": "56/102",
    "tables_sitewide": 4, "ul": 49, "ol": 10, "li": 221, "strong": 112,
    "images": 148, "images_svg": 148, "images_raster": 0,
    "images_missing_alt": 0, "video_or_iframe": 0, "youtube_refs": 0,
    "posts_zero_formatting": 7, "posts_zero_outbound_citations": 17,
    "non_blog_pages_under_300_words": 16,
    "posts_datemodified_equals_datepublished": 19,
    "organization_sameas_count": 1
  },
  "brand_mentions": {
    "wikipedia_wikidata": "absent_category_wide_deprioritised",
    "linkedin": "present_linked_sitewide",
    "reddit": "no_linked_presence",
    "youtube": "none",
    "sameas_profiles": 1
  },
  "platform_scores": {
    "google_aio": 66, "chatgpt": 62, "perplexity": 60, "bing_copilot": 55
  },
  "highest_leverage_item": "Port the reddit-ai-visibility-guide template (outbound citations + question-shaped h2s + one table + one original visual) to the 17 posts lacking it, starting with the 7 that have zero formatting and the 2 comparison posts that have no comparison table.",
  "acknowledged_business_decisions": [
    "5.5B vs 1.2B homepage contradiction (adjacent DOM nodes, measurable citability cost)",
    "+312% used with two meanings",
    "200-400% guarantee inside FAQPage structured data on /services/citation-building",
    "fake-accounts vs 'appearance of real users' conflict",
    "no Wikidata entity (no category vendor has one; notability bar not cleared)",
    "no foundingDate, no contactPoint, orphan author byline (blocked on owner-supplied facts)"
  ]
}
```
