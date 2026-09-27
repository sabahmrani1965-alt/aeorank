# GEO / Answer-Engine Visibility Audit — www.aeorank.tech

Audited 2026-09-26. Live production fetch of 32 sitemap URLs (homepage, 16 posts,
5 services, 4 industries, about/contact/blog/legal). SSR checked via
`render_page.py --mode auto`; passage scoring run against trafilatura
`extracted_text`, not raw HTML.

## GEO Readiness Score: 50 / 100

| Dimension | Weight | Score | Weighted |
|---|---|---|---|
| Citability | 25% | 62 | 15.5 |
| Structural readability | 20% | 45 | 9.0 |
| Multi-modal content | 15% | 18 | 2.7 |
| Authority & brand signals | 20% | 28 | 5.6 |
| Technical accessibility | 20% | 86 | 17.2 |
| **Total** | | | **50.0** |

Technical access is close to ideal and passage writing is genuinely good. The score
is held down by off-site entity absence, zero multi-modal assets, and machine-invisible
document structure.

## Crawler access — verified live, per capability

Every bot below was issued a real request to `/blog/how-to-get-cited-by-chatgpt`.
All seven returned HTTP 200 with a byte-identical 51,016-byte payload: no UA
cloaking, no WAF/edge blocking, no truncated bot variant.

| Crawler | What it governs | robots.txt | Live fetch |
|---|---|---|---|
| OAI-SearchBot | ChatGPT Search citability | Allowed (`*`) | 200 |
| Claude-SearchBot | Claude search citability | Allowed (`*`) | 200 |
| PerplexityBot | Perplexity citability | Allowed (`*`) | 200 |
| Googlebot | Google Search + AI Overviews inclusion | Allowed (`*`) | 200 |
| bingbot | Bing index -> Copilot | Allowed (`*`) | 200 |
| GPTBot | OpenAI *training* only | Allowed (`*`) | 200 |
| ClaudeBot | Anthropic *training* only | Allowed (`*`) | 200 |

robots.txt is 128 bytes: `User-Agent: *` / `Allow: /`, disallowing only
`/dashboard`, `/api`, `/onboarding`, plus a valid sitemap reference. There is no
per-AI-bot section at all — access is permissive by omission rather than by
declared stance. Nothing is blocked that affects citability. Training crawlers
(GPTBot, ClaudeBot, CCBot, Google-Extended, Applebot-Extended) are also
unrestricted; that is a licensing decision, not a visibility one.

Note the standard confusions, since the product sells on this: GPTBot status says
nothing about ChatGPT Search citability (OAI-SearchBot governs that), ClaudeBot
says nothing about Claude search (Claude-SearchBot does), Google-Extended affects
Gemini/Vertex training and grounding only and never AI Overviews inclusion, and
Applebot-Extended affects Apple Intelligence training only and never
Siri/Spotlight/Safari discoverability.

## llms.txt and RSL

`/llms.txt` -> 404 (confirmed). Also 404: `/llms-full.txt`,
`/.well-known/llms.txt`, `/ai.txt`. No RSL 1.0 licensing anywhere:
`/.well-known/rsl.xml`, `/rsl.xml`, `/license.xml` all 404, and robots.txt
carries no `License`, `RSL` or `Content-Signal` directive.

Weight this honestly. llms.txt is not consumed by Google Search, and neither
OpenAI nor Perplexity has committed to reading it. Publishing one will not move
citations. The reason to ship it here is positional, not technical: a company
selling AI-visibility services is asked about llms.txt by prospects, and a 404 is
a sales objection. Treat it as a half-hour credibility task, not an SEO lever,
and do not let it displace the entity work below.

## CORRECTION: the h1 fix is not live

The brief lists "every page now has exactly one h1 (fixed today)" as established.
It is committed but **not deployed**. Live production has an h1 on the homepage
only; all 31 other pages have zero h1 — verified by raw `<h1` grep against
freshly fetched HTML for all 16 posts, /about, /blog, /contact, /services, the
5 /services/* pages and /industries/saas.

Cause: `git log origin/main..HEAD` shows two unpushed commits, including 59eb69f
("Give every page an h1 and a social preview card"). The same gap means the new
`app/opengraph-image.js` social card is also not live, so every AEOrank link
pasted into Slack, X, LinkedIn or a chat window still renders as a bare URL.

**Push and deploy before anything else in this report.** Everything else is a
content change; this one is already written and is sitting in a local branch.

### Follow-up defect inside the pending fix

59eb69f converts the post title from `h2` to `h1` (correct — no duplicate title
heading). But body subheadings across all 16 posts are `h3`, and they are not
touched. Post-deploy the outline becomes h1 -> h3 (skipping h2), while the
"More from the blog" related-posts strip stays at `h2` — so the only h2 on the
page is navigation chrome, and it outranks every substantive body section in the
document outline. Promote body subheads h3 -> h2 in `app/blog/[slug]/page.js` and
demote or unheading the related-posts strip.

## Passage-level citability

This is the site's real strength and should not be rewritten.

Measured across all 80 body sections of the 16 posts (section = text between h3
boundaries inside `<article>`): median 138 words, mean 147, 22% land in the
130–170 band, only 6% fall under 90 words. Sections open with a direct declarative
answer rather than a windup, and they are genuinely self-contained — lifting one
out of context still yields a complete claim. Word counts run 389–1,450, which is
appropriate; nothing is padded to hit a length target. Treat 130–170 as the
third-party heuristic it is, not a target: Google has said content need not be
pre-chunked for AI.

Four defects sit on top of good writing:

**1. Zero outbound citations, site-wide.** Not one of the 16 posts links to a
single external source (0 external hrefs after excluding schema.org URLs). The
posts make checkable empirical claims — "meaningful citation gains within 60
days", "3–4 months to see the needle move", "AI engines update their internal
representations slowly" — with nothing to verify against. Answer engines
preferentially cite pages that themselves cite, because corroborability is what
makes a passage safe to repeat. This is the single cheapest citability fix
available.

**2. Bullets are fake and collapse into run-on paragraphs.** There is no `<ul>`,
`<ol>`, `<table>` or even `<strong>` in any of the 16 posts. Lists are literal
`•` characters with `\n` separators inside a single inline-styled `<p>`. Example
from `/blog/how-to-get-cited-by-chatgpt`:

```
["$","p","3",{"style":{...},"children":["• Audit every place your brand appears
(crunchbase, LinkedIn, G2, product databases, Wikidata)...\n• Implement
Organization schema with accurate sameAs links...\n• File a Wikidata entry..."]}]
```

Trafilatura renders that as one continuous paragraph with inline bullet glyphs —
which is what an extractor sees. A four-step checklist that would be trivially
liftable as a list becomes an unparseable blob. Converting these to real `<ul>/<li>`
is a markup change with no visual cost.

**3. Comparison posts have no comparison tables.** `/blog/crowdreply-vs-aeorank`,
`/blog/profound-vs-peec-vs-aeorank` and `/blog/chatgpt-vs-claude-vs-gemini-citations`
are the highest-intent pages on the site and the exact query shape answer engines
render as a table. All three are prose-only. Zero `<table>` elements site-wide.

**4. Headings are statement-shaped, not question-shaped.** Across 80 body
subheads, essentially none are phrased as a question. Actual examples: "The one
thing nobody tells you about ChatGPT citations", "Start with the knowledge graph,
not the blog", "What we've seen work", "Timeline: be realistic". These read well
but they do not match the retrieval key. This is the sharpest
practise-what-you-preach miss on the site, because
`/blog/how-to-get-cited-by-chatgpt` explicitly instructs the reader to "rewrite
your top 20 buyer questions as standalone pages, each with the answer in the
first 2–3 sentences" — advice the blog itself does not follow in a single heading.

FAQ handling is done correctly and is worth noting as a positive: on
`/services/ai-visibility-audit` the FAQPage schema questions and answers are
present in the visible DOM verbatim, not injected into JSON-LD only. That is the
compliant pattern.

## Homepage: a sourced-statistics failure that matters more here than elsewhere

The homepage contradicts itself on its central statistic, inside one card:

- `<h3>`: "Take advantage of over **5.5B** monthly visitors"
- the `<p>` directly beneath it: "With **1.2B** monthly visitors, Reddit threads
  now rank within the top 5 results..."
- the adjacent CSS bar chart: "**5.5B+** Monthly Visits / +43% YoY Growth",
  with a 2020–2026 axis

Two different figures for the same quantity, 4.6x apart, adjacent in the DOM,
neither attributed to a source. An extractor pulling that card gets a
self-refuting passage, and a model checking the claim against Reddit's own
reported figures finds no support for either number as stated. Other unsourced
absolutes in the same section: "you'll capture 90% of the demand", "capture over
90% of the traffic", "We've seen one well-placed comment generate $50K+", and
"Reddit is the top cited source for AI & LLM answers".

Pick one figure, attribute it inline to a named source with a date, and either
source or remove the 90% and $50K claims. For a company whose product is
citation credibility, an unsourced contradicted statistic on the homepage is the
most expensive 20 minutes of copy on the site.

The bar chart is also invisible to machines: it is div/CSS-rendered with no
`<img>`, no alt text, no table equivalent, and no `Dataset`/`ImageObject` schema.

## Trust contradiction across pages

/about states: "We don't run vote rings or operate fake accounts."
The homepage states: "**Create the appearance of real users** recommending your
brand on Reddit, so every time someone googles your brand, they'll be met with
overwhelming social proof."

The homepage FAQ schema also asserts "no spam, no shortcuts". Answer engines
synthesise across a whole site and reward internal consistency; a model asked
"is AEOrank legitimate?" can retrieve both passages and will surface the tension.
Beyond GEO this is a reputational exposure worth resolving in copy.

## Entity clarity and disambiguation for "AEOrank"

This is the weakest dimension and the one the product is nominally expert in.

**No knowledge-base entity exists.** Verified via API, not inferred:
Wikidata `wbsearchentities` for "AEOrank" returns 0 results; English Wikipedia
search returns `totalhits: 0`. There is no node for answer engines to anchor to.

**Organization schema is present but nearly empty as an entity record.**
On the homepage only (`@id: https://www.aeorank.tech/#organization`): name, url,
logo, description, and exactly one `sameAs` — a LinkedIn company page
(`/company/aeoranktech`, confirmed 200). Missing: `foundingDate`, `founder`,
`address`/`areaServed`, `contactPoint`, `alternateName`, and any second
`sameAs` (no X, GitHub, Crunchbase, G2, Product Hunt, YouTube, Reddit).

**The site links to zero social profiles.** Outbound non-self hrefs on the
homepage are exactly three: a Calendly booking link, `saasoffers.tech`, and the
GTM script. The LinkedIn page asserted in `sameAs` is not linked from any page —
so the one identity claim the schema makes has no on-page reciprocal.

**/about carries no schema at all.** No `AboutPage`, no `Organization`, no
founder `Person`. The About page is the canonical place to ground the entity and
it is structurally silent. It also gives no founding date, no location, no legal
entity, and no team.

**The author entity is unresolvable.** All 16 posts carry
`author: {"@type":"Person","name":"Ilyas Lemzouri","worksFor":{...}}` with no
`url` and no `sameAs`, there is no author bio block on any post (checked all 16),
and `/author/ilyas-lemzouri` returns 404. Visible byline and date do render on
every post, which is good — but the person is a string, not an entity, so none of
the topical authority accrues anywhere a model can reuse.

**No product entity.** The site sells a credit-based SaaS ("Usage-Based Credits",
"Pay only for what you generate") with no `SoftwareApplication`, `Product` or
`Offer` schema anywhere. /industries/* pages carry `BreadcrumbList` only.

**Naming/disambiguation risk.** "AEOrank" is one token away from the generic
category phrase "AEO rank"/"AEO ranking", the site's own copy uses "AEO" as a
common noun constantly, and the homepage `<title>` is
"AEOrank: Reddit & AI Visibility Report" — which reads like the name of a report,
not a company or product. There is no clean definitional sentence anywhere in the
form "AEOrank is a [category] that [does X] for [audience]". The closest is
/about's "AEOrank helps brands show up in those answers", which is dependent on
the preceding sentence for meaning and so does not survive extraction. The
homepage extracted text (4,613 chars) contains no definition at all — it opens
mid-pitch. A model has nothing to copy when asked "what is AEOrank?".

Compounding it: the flagship case study is the sister product `saasoffers.tech`,
and three posts name competitors (CrowdReply, Profound, Peec AI) in titles. Those
competitor entities are better established than AEOrank's own, so comparison
pages currently donate more entity signal than they capture.

Title-tag branding is also inconsistent, which dilutes name reinforcement: all 16
blog titles correctly end "| AEOrank", but `/services/ai-visibility-audit` is
titled just "AI Visibility Audit" and `/industries/saas` just "AEO for SaaS
Companies" — no brand token on any services or industries page. (Minor: the
`/blog/getting-cited-by-claude` title reads "Why Its the Hardest", missing the
apostrophe.)

## Multi-modal content

Effectively absent, and this is the dimension with the strongest known
correlation to AI citation.

- Zero `<img>` elements inside the `<article>` body of all 16 posts.
- `BlogPosting.image` is `null` on all 16 — this forfeits Google Article rich
  result eligibility and any AI Overview thumbnail.
- No video anywhere on the site; no YouTube channel discoverable from the site or
  from `sameAs`. YouTube mentions carry the strongest observed correlation with AI
  citation (~0.737), far above Domain Rating (~0.266), so this is the highest-value
  missing asset class rather than a nice-to-have.
- The only data visualisation (homepage Reddit traffic chart) is CSS-rendered with
  no text or schema equivalent, and it displays the disputed 5.5B figure.
- `og:image` exists only in the unpushed commit.

## Freshness

All 16 posts have `dateModified` exactly equal to `datePublished` — no post has
ever been revised. Publication clusters: 8 posts on 2026-08-27/28, the rest
2026-03-06 to 2026-04-24. Nothing published or updated in September. The
`render_page.py` publication-date heuristic returned 2026-01-01 for the homepage,
which suggests no meaningful date signal there either. For a category the site
itself describes as shifting monthly, never-updated posts are a weak
trustworthiness signal.

## Platform-specific readiness

| Platform | Score | Governing crawler (verified) | Limiting factor |
|---|---|---|---|
| Google AI Overviews | 52 | Googlebot 200 | No h1 live on 31/32 pages; no Knowledge Graph / Wikidata entity; `BlogPosting.image` null blocks rich-result eligibility. Google-Extended is irrelevant to AIO inclusion. |
| ChatGPT Search | 48 | OAI-SearchBot 200 | Access is fine; the constraint is entity weakness and near-zero third-party corroboration. GPTBot status is not evidence here. |
| Perplexity | 55 | PerplexityBot 200 | Best-positioned: direct, well-sized, self-contained passages suit its extraction. Held back by zero outbound citations and no lists/tables. |
| Bing Copilot | 45 | bingbot 200 | Leans on the Bing entity graph: no Wikidata, no verified social identity, no product entity. |

Only ~11% of domains are cited by both ChatGPT and Google AI Overviews, so treat
these as four separate programmes rather than one.

## Top 5 highest-impact changes

1. **Push the two unpushed commits and deploy.** Restores one h1 on 31 pages and
   ships og:image site-wide. Effort: minutes. Highest ratio on the list — the work
   is already done and currently delivers nothing. Then promote blog body subheads
   h3 -> h2 (~30 min) so the outline is not h1 -> h3 with nav chrome as the only h2.
2. **Fix the homepage statistic contradiction and source the remaining claims.**
   Reconcile 5.5B vs 1.2B to one attributed figure with a date; source or drop
   "90% of demand", "$50K+", "top cited source". Also resolve the
   "no fake accounts" vs "create the appearance of real users" conflict.
   Effort: 1–2 hours copy. Directly governs whether the homepage is safe to cite.
3. **Build the entity record.** Expand Organization schema (`foundingDate`,
   `founder`, `contactPoint`, `areaServed`, `alternateName`) and grow `sameAs`
   beyond the single LinkedIn URL; link those profiles in the footer so the claims
   are reciprocal; add `Organization` + founder `Person` schema to /about; add
   `SoftwareApplication`/`Offer` for the product; give the author a `url` +
   `sameAs` and a real `/author/...` page; file a Wikidata entry. Add one clean
   definitional sentence ("AEOrank is a ... that ... for ...") to the homepage and
   /about. Effort: 1–2 days, plus Wikidata review latency.
4. **Make the structure machine-readable.** Convert the fake `•` paragraphs to
   real `<ul>/<li>` across all 16 posts; add real comparison `<table>`s to the
   three vs-posts; add `<strong>` on the key claim per section; add a 40–60 word
   answer-first block under each subhead where one is missing. Effort: 1 day.
5. **Add citations and multi-modal assets.** Two to four outbound source links per
   post (currently zero site-wide); one diagram or screenshot per post with
   descriptive alt text; populate `BlogPosting.image`; stand up a YouTube channel
   with short explainers for the top comparison and how-to topics, then add it to
   `sameAs`. Effort: 2–3 days for citations and images; YouTube is an ongoing
   programme but carries the strongest correlation available.

Ship `/llms.txt` alongside item 1 as a ten-minute credibility item, with no
expectation of ranking or citation effect.

## Does the site practise what it sells?

Mostly not yet, and the gaps are specific rather than vague.
`/blog/how-to-get-cited-by-chatgpt` prescribes four things and the site does none
of them for itself:

| The blog's own advice | AEOrank's own state |
|---|---|
| "Implement Organization schema with accurate sameAs links to **every** canonical profile" | One `sameAs` (LinkedIn), not linked from any page |
| "File a Wikidata entry if you qualify" | Wikidata search: 0 results |
| "Rewrite your top 20 buyer questions as standalone pages, answer in the first 2–3 sentences" | ~0 of 80 subheads are question-shaped; no question-page set exists |
| "Third-party citations do more work than you think" | Zero outbound citations in 16 posts; no G2/press/third-party proof |

`/blog/aeo-schema-markup-guide` has a section titled "Organization schema: the
foundation everyone gets wrong" while the site's own Organization schema is
missing founder, foundingDate, contactPoint and all but one sameAs. The same post
covers "Article, Product, SoftwareApplication" while the site has no Product or
SoftwareApplication markup and null Article images.

The underlying writing quality is good enough that closing these gaps is
mechanical, not a rewrite. The credibility upside is larger than the ranking
upside: every item above is something a prospect can check in a browser in two
minutes.

## Audit-data.json — AI Search Readiness category

```json
{
  "category": "AI Search Readiness",
  "score": 50,
  "dimensions": {
    "citability": 62,
    "structural_readability": 45,
    "multi_modal": 18,
    "authority_brand_signals": 28,
    "technical_accessibility": 86
  },
  "crawler_access": {
    "robots_txt": "User-Agent: * / Allow: / ; Disallow /dashboard /api /onboarding",
    "ua_fetch_test": "all 7 bots HTTP 200, byte-identical 51016B payload",
    "oai_searchbot": "allowed",
    "claude_searchbot": "allowed",
    "perplexitybot": "allowed",
    "googlebot": "allowed",
    "bingbot": "allowed",
    "gptbot_training": "allowed",
    "claudebot_training": "allowed",
    "ai_specific_directives": false
  },
  "llms_txt": {
    "status": "missing",
    "variants_checked_404": ["/llms.txt", "/llms-full.txt", "/.well-known/llms.txt", "/ai.txt"],
    "impact": "low - not consumed by Google Search; no OpenAI or Perplexity commitment"
  },
  "rsl_1_0": { "status": "absent", "endpoints_404": ["/.well-known/rsl.xml", "/rsl.xml", "/license.xml"], "robots_license_directive": false },
  "rendering": { "ssr": true, "is_spa": false, "csr_dependency": false },
  "entity": {
    "wikidata": false,
    "wikipedia": false,
    "organization_schema": true,
    "same_as_count": 1,
    "same_as": ["https://www.linkedin.com/company/aeoranktech"],
    "social_links_on_page": 0,
    "about_page_schema": false,
    "founder_person_entity": false,
    "author_resolvable": false,
    "author_page": "404",
    "product_schema": false,
    "definitional_sentence": false
  },
  "citability": {
    "sections_measured": 80,
    "median_section_words": 138,
    "mean_section_words": 147,
    "pct_in_130_170_band": 22,
    "pct_under_90_words": 6,
    "question_shaped_headings": 0,
    "outbound_citations_total": 0,
    "real_list_elements": 0,
    "table_elements": 0,
    "strong_elements": 0
  },
  "multi_modal": {
    "article_images": 0,
    "blogposting_image_populated": 0,
    "posts_total": 16,
    "video_assets": 0,
    "youtube_channel_linked": false,
    "og_image_live": false
  },
  "freshness": { "posts": 16, "posts_ever_revised": 0, "newest_publish_date": "2026-08-28", "date_modified_equals_published": 16 },
  "platform_scores": { "google_aio": 52, "chatgpt_search": 48, "perplexity": 55, "bing_copilot": 45 },
  "blocking_issues": [
    { "id": "h1-not-deployed", "severity": "high", "detail": "59eb69f unpushed; 31 of 32 live pages have zero h1; og:image also not live" },
    { "id": "homepage-stat-contradiction", "severity": "high", "detail": "5.5B vs 1.2B Reddit monthly visitors in adjacent DOM nodes, both unsourced" },
    { "id": "no-entity-record", "severity": "high", "detail": "no Wikidata/Wikipedia; single sameAs; no founder/author entity; no definitional sentence" },
    { "id": "fake-list-markup", "severity": "medium", "detail": "bullets are literal glyphs in a single <p>; 0 ul/ol/table/strong across 16 posts" },
    { "id": "zero-outbound-citations", "severity": "medium", "detail": "no external source links in any post" },
    { "id": "no-multimodal", "severity": "medium", "detail": "0 article images, 16/16 null BlogPosting.image, no video/YouTube" },
    { "id": "trust-copy-conflict", "severity": "medium", "detail": "/about 'no fake accounts' vs homepage 'create the appearance of real users'" },
    { "id": "heading-hierarchy-post-deploy", "severity": "low", "detail": "body subheads stay h3; only h2 will be 'More from the blog' nav chrome" }
  ],
  "verification_limits": ["Reddit search API returned 403; off-site Reddit/YouTube mention volume not programmatically verified"]
}
```
