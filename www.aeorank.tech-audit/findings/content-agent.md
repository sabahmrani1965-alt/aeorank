# Content Quality — deep pass (content-agent)

Scope: all 17 blog posts (including `/blog/what-is-aeo`, which is live and listed
on `/blog` but absent from `sitemap.xml`), 5 `/services/*`, 4 `/industries/*`,
`/about`, `/contact`, homepage, `/privacy`, `/terms`.

Method: post/service/industry copy parsed directly out of the Next.js source
(`app/blog/[slug]/page.js`, `app/services/[slug]/page.js`,
`app/industries/[slug]/page.js`) so prose is measured without nav/footer chrome;
cross-checked against live `render_page.py` extractions of
`/blog/how-we-verify-reddit-threads`, `/blog/aeo-schema-markup-guide`,
`/industries/saas`, `/industries/software`, `/services/aeo-consulting`, `/about`.

**Scores:** content quality **46/100** · E-E-A-T **32/100** · AI-citation
readiness **38/100**. Breakdown at the end.

---

## 1. The four /industries/* pages: NOT near-duplicate in wording — the real problem is different (and worse)

**This corrects `content.md`,** which says the four pages are "close enough to
read as near-duplicates to a crawler." On the text-duplication axis that is
wrong. Measured pairwise on the actual body copy (intro + 4 challenge
titles/descriptions + 5 approach bullets + 3 stat labels):

| pair | word Jaccard | 3-gram Jaccard |
|---|---|---|
| saas vs startups | 0.17 | 0.00 |
| saas vs tech-it | 0.21 | 0.01 |
| saas vs software | 0.20 | 0.01 |
| startups vs tech-it | 0.15 | 0.01 |
| startups vs software | 0.11 | 0.01 |
| tech-it vs software | 0.18 | 0.00 |

3-gram overlap of 0.00–0.01 means essentially **zero shared phrasing**. Word-level
0.11–0.21 is normal for four pages on one topic. A dedup crawler will not collapse
these. Do not spend effort "rewriting for uniqueness" — the wording is already
unique.

What is actually wrong is **structural isomorphism plus absent substance**:

    page        intro  challenges  approach  stats  body words
    saas          1        4          5        3       179
    startups      1        4          5        3       193
    tech-it       1        4          5        3       177
    software      1        4          5        3       184

Identical scaffold on all four (exactly 1 intro, exactly 4 challenge cards,
exactly 5 approach bullets, exactly 3 stats), and the H2s are hardcoded in the
shared component so they are *literally* the same strings on all four pages:
"Challenges we **solve**", "How we **help**", "Let's build your **AEO
advantage**". Each page differs only by vocabulary substitution into a fixed
frame. `trafilatura` extracts **174 words** of main content from
`/industries/saas` and **175** from `/industries/software` — roughly half the
297/301 raw counts in the brief, because the raw count includes nav, stat band,
and two CTA blocks.

So: genuinely thin (174 words against a 500–600 floor for this page type), fully
templated, and — per the separate agent's finding, which I confirmed — orphaned.

**Orphan status confirmed independently:**
- `grep -rno 'href="/industries/[a-z-]*"' app components` → **zero matches**. Nothing in the codebase links to any industry page.
- `components/Header.js` links only to `/`. `components/Footer.js` links to `/`, `/#faq`, `/about`, `/blog`, `/contact`, `/privacy`, `/terms`. Neither nav links to `/services` or `/industries`.
- `/industries` index returns **404**, yet the `BreadcrumbList` on all four pages declares position 2 as `name: "Industries"` with `item: https://www.aeorank.tech` — a breadcrumb whose label does not match its target.
- Zero inbound links from blog prose (blog prose links to `/services/*` 36 times; to `/industries/*` 0 times).
- `/llms.txt` returns **404**, so there is no AI-surface fallback either.

Orphaned + 174 words + commercial intent + a rigid repeated template + unsourced
performance stats is the shape of a doorway-page set. That combination, not
duplicate text, is the risk.

### 1a. High severity: the stat bands look fabricated, and one number is reused with two different meanings

All twelve figures appear with no source, no methodology, no date, and no case
study anywhere on the site:

    /industries/saas       +312%   Average AI Citation Increase
    /industries/saas       4–6mo   To Meaningful Share-of-Voice
    /industries/saas       +180%   AI-Sourced Pipeline Growth
    /industries/startups   +417%   Citation Growth for Emerging Categories
    /industries/startups   3–4mo   To First Meaningful Wins
    /industries/startups   +560%   AI-Sourced Lead Volume
    /industries/tech-it    +312%   Technical Query Citations
    /industries/tech-it    +189%   Enterprise-Qualified Leads
    /industries/tech-it    6–9mo   To Category Dominance
    /industries/software   +241%   Vertical-Specific AI Citations
    /industries/software   +130%   Demo Requests from AI Traffic
    /industries/software   4–8mo   To Vertical Category Leadership

**`+312%` is used twice, labelled "Average AI Citation Increase" on
`/industries/saas` and "Technical Query Citations" on `/industries/tech-it`.**
The same number cannot be both. This is the strongest single indicator on the
site that the figures were invented to fill a template rather than measured.

### 1b. The stat bands contradict the site's own stated position, in two places

- `/about`: "We don't promise specific LLM citations. **Nobody can.**"
- Homepage FAQ (also in `FAQPage` JSON-LD): "No, **nobody can guarantee** what an LLM will say."
- `/services/citation-building` FAQ (also in `FAQPage` JSON-LD): "Most clients see **200–400% increase in AI citation frequency within 6 months**."

A prospect or an AI engine summarising "is AEOrank credible" will hit both
statements. Under the QRG this is a first-order trust failure, and it is
self-inflicted: the honest statement is already written, the stat bands
undercut it.

### 1c. Positioning split across the site (entity inconsistency)

The site describes two different companies:

- Site title / homepage / `/about` / `/contact`: a **Reddit-engagement product**. `"AEOrank: Reddit & AI Visibility Report"`; `/about` meta: "appear in AI chat answers through measurable Reddit engagement"; `/about` main content is entirely about mapping subreddits.
- `/services/*` and `/industries/*`: a **full-service enterprise AEO agency** — "Dedicated AEO Strategist", Gartner/Forrester/TrustRadius profile optimisation, Wikidata and Wikipedia strategy, 100+ query audits, $2,000–$6,500/mo plans.

`/about` yields 92 words of extractable main content and never mentions
services, strategists, or agency delivery. The site's own
`/blog/aeo-schema-markup-guide` warns against exactly this: "If five different
articles describe your product in five different ways, AI gets confused."

### 1d. Services pages: the FAQ answers — the most citable prose on those pages — are invisible to extractors

`app/services/[slug]/page.js:334-339` renders every FAQ inside
`<details><summary>`, collapsed by default. Verified on
`/services/aeo-consulting`: the string `"consulting is 30"` appears twice in the
raw HTML but `extracted_text` contains it **not at all**
(`'consulting is 30' in extracted_text` → `False`). The same is true of card
titles ("Dedicated AEO Strategist") and the whole stat band on industry pages —
extraction keeps only the `<p>` descriptions, dropping every `<h4>` and label.
So 15 Q&A pairs across 5 service pages are asserted in `FAQPage` JSON-LD while
being unavailable as quotable text. `/services/aeo-consulting` extracts to 147
words.

Same defect on `/about`: "vote rings" and "What we won't do" are present in the
HTML once each but absent from the 92-word extraction. **The site's strongest
trust content — "We don't run vote rings", "We don't post in subreddits that
disallow commercial content", "We don't promise specific LLM citations" — is in
markup that main-content extractors discard.** Note also that "onboarding call"
appears 0 times in the live `/about` HTML although it is in the source list I
read; I did not chase that down (**not assessed**).

---

## 2. AI-typical phrasing and invisible Unicode

### Invisible Unicode watermarks: CLEAN — nothing found

Scanned `app/blog/[slug]/page.js`, `app/industries/[slug]/page.js`,
`app/services/[slug]/page.js`, `app/about/page.js`, `app/page.js`,
`app/blog/page.js` for U+200B, U+200C, U+200D, U+2060, U+FEFF, U+00AD, U+202F,
U+00A0, U+2011, U+2028, U+2029, U+180E, U+2061–U+2064, U+034F, U+115F, U+3164,
**plus every character in Unicode category `Cf`**. Result: `none` on all six
files. No zero-width watermark, no soft hyphens, no non-breaking spaces. Report
this as a pass — it is a real credibility point for this site.

### Surface AI clichés: also near-clean

Across all 14,227 words of post prose, a 40-term cliché lexicon returned only 4
distinct hits, 17 occurrences total: `leverage` ×12, `unlock` ×3, `landscape`
×1, `it's not just` ×1. No `delve`, no `dive into`, no `in today's`, no
`tapestry`, no `testament to`, no `ever-evolving`, no `seamless`, no `robust`,
no `game-changer`, no `holistic`, no `synergy`. Zero instances of the
`"It's not X. It's Y."` antithesis. The prose has clearly been de-clichéd.

### But two structural fingerprints survive, and both are visible

**(a) 115 "Label. Explanation." pseudo-list paragraphs across 14 of 17 posts.**
Paragraphs that open with a short nominal fragment terminated by a period, then
explain it — an LLM list-flattening tic. Per post:

    aeo-schema-markup-guide                   23
    aeo-vs-seo                                13
    measure-ai-citation-roi                   12
    google-ai-overviews-guide                 11
    what-is-aeo                                9
    optimize-for-perplexity                    8
    chatgpt-vs-claude-vs-gemini-citations      7
    sentiment-in-ai-citations                  6
    reply-to-reddit-without-getting-removed    6
    how-to-get-cited-by-chatgpt                6
    entity-authority-ai-citation               5
    getting-cited-by-claude                    4
    why-chatgpt-cites-reddit-threads           3
    crowdreply-vs-aeorank                      2
    partner-network-ai-visibility              0
    profound-vs-peec-vs-aeorank                0
    how-we-verify-reddit-threads               0

Concrete instances, `/blog/getting-cited-by-claude`:

> "**Wikipedia and Wikidata presence.** Claude treats a well-maintained Wikipedia entry as a strong trust signal…"
> "**Analyst and academic references.** Coverage from Gartner, Forrester, or similar research firms carries real weight."
> "**Neutral, comparison-style writing.** Claude appears to favor content that reads like independent research…"
> "**Consistency across sources.** The same entity-authority fundamentals that help every engine matter more here…"

`/blog/aeo-schema-markup-guide`:

> "**Organization schema.** The single highest-leverage schema for B2B SaaS AEO."
> "**WebSite + SearchAction schema.** Helps with navigation and tells engines your domain structure."
> "**FAQPage schema.** Useful when implemented on actually-useful FAQ content."
> "**Article schema for blog content.** Helps your published content get attributed correctly…"

Two costs. It is the QRG's "repetitive structure across pages" marker, applied
identically in 14 posts. And because these labels are plain prose sentences
rather than `<h3>`, `<strong>`, or `<li>`, they give an AI engine no structured
hierarchy to lift — the content is list-shaped but not list-marked-up.

**(b) Zero em dashes in 14,227 words, with 81 mid-sentence colons standing in.**
`U+2014` count across all 17 posts: **0**. `U+2013` (en dash) appears 11 times,
correctly, in numeric ranges ("60–90 days", "30–50%"). Curly apostrophes: 0.
Mid-sentence colons followed by lowercase — the em-dash substitute: **81**.

Zero em dashes at that word count is statistically implausible for natural
English prose and is the signature of a find-and-replace de-em-dashing pass over
an LLM draft. Examples where a colon or comma is doing an em dash's job:

- `/industries/tech-it`: "Technical buyers, CIOs, CISOs, platform engineers, DevOps leads, rely heavily on AI tools" — ungrammatical, comma directly before the verb, the residue of a removed dash pair.
- `/services/aeo-management`: "Entity optimization, citation building, content creation, schema implementation: all in one package."
- `/services/citation-building`: "All citations are earned: expert commentary, original research placements, directory optimization."

**(c) The same pass also stripped legitimate hyphens, concentrated in the newest
posts.** Hyphen density per 1,000 words, by publish date:

    2026-03-06  google-ai-overviews-guide                 11.1
    2026-04-17  chatgpt-vs-claude-vs-gemini-citations      18.6
    2026-04-24  aeo-schema-markup-guide                    10.8
    ...
    2026-08-27  partner-network-ai-visibility               2.1
    2026-08-27  sentiment-in-ai-citations                   1.7
    2026-08-28  crowdreply-vs-aeorank                       5.7
    2026-08-28  how-we-verify-reddit-threads                0.0

The March–April batch runs 6.6–18.6/1k; the late-August batch collapses to
0.0–2.1/1k. Resulting visible copy errors, all in `/blog/crowdreply-vs-aeorank`:
"Reddit focused AI visibility tools", "third party reviews", "sub 5% comment
removal rate", "One 14 day hands on review", "mid tier usage", "aged, high karma
Reddit accounts". These are straightforward proofreading defects on the page
that names a competitor.

**(d) One metadata typo:** `/blog/getting-cited-by-claude` has
`metaTitle: 'Getting Cited by Claude: Why Its the Hardest | AEOrank'` — "Its"
missing its apostrophe, and the metaTitle is also truncated relative to the H1
("Why It's the Hardest Engine to Crack"). This is the string that shows in SERPs.

---

## 3. E-E-A-T

### Author identity is an orphan byline

All 17 posts carry `author: 'Ilyas Lemzouri'`. A repo-wide grep for "Lemzouri"
across `app`, `components`, `lib`, `public` (all `.js`, `.json`, `.md`) returns
matches **only inside `app/blog/[slug]/page.js`**. Consequently:

- No author bio on any post, no `/author/*` page, no team section.
- `/about` names no human at all — no founder, no team, no legal entity, no postal address.
- `/contact` offers a form and a Calendly link only — no email address, no phone, no address.
- `BlogPosting.author` (`app/blog/[slug]/page.js:810`) is `{'@type':'Person', name, worksFor}` with **no `url` and no `sameAs`** — an unresolvable Person entity.

So a name appears on 17 articles and is described nowhere on the site. There is
no way for a reader or an engine to establish who this is or why they are
credible.

### Experience is asserted 30 times and evidenced zero times

30 first-person experience claims in the prose, all unfalsifiable:

- "We've **audited dozens** of B2B SaaS brands across all three engines"
- "We've **tested schema implementations across dozens of B2B SaaS clients** over the last year"
- "We've **watched share-of-voice climb meaningfully** on AI engines after a single Organization schema cleanup"
- "we've laid out here is **based on actual client work and actual citation tracking** over the last year"
- "we see Reddit-mention frequency translate into ChatGPT citation likelihood"

Not one is attached to a named client, a number, a date range, a query set, a
screenshot, or a methodology note. Zero case studies exist on the site. Zero
external links appear in 14,227 words of blog prose (`](http` count: 0) — so
even third-party facts are unsourced.

### The two genuinely strong E-E-A-T assets are the two most neglected pages

- `/blog/how-we-verify-reddit-threads` is the site's **only** real first-hand-process post — its entire premise is "here is our actual verification procedure." It is the **thinnest article on the site at 364 words**, contains **0 numeric facts**, has **1 internal link**, and **0 pseudo-list tics**. Biggest wasted asset on the site.
- `/blog/crowdreply-vs-aeorank` has the best epistemic hygiene anywhere here: it hedges explicitly ("This part is sourced from third party reviews of CrowdReply, not from their own site, so treat it as reported rather than confirmed"; "We can't independently verify the account mechanics ourselves") and discloses its own bias. But it has **0 external links** — it attributes claims to "multiple reviews" and "one 14 day hands on review" without naming or linking any of them, and cites competitor pricing with no "as of" date. It also accuses a named competitor of aged-account use, "controlled upvoting", and Reddit ToS violations on the strength of unnamed sources. Add the source URLs and a dated verification line, or soften the accusations.

`/blog/profound-vs-peec-vs-aeorank` has no self-interest disclosure at all
(regex for "our own / we build / disclosure / we're biased" → no match) despite
ranking AEOrank against two named competitors.

### The site fails its own published checklist — the most damaging finding for an AEO vendor

`/blog/aeo-schema-markup-guide` publishes a "spend 30 minutes" audit. AEOrank
fails at least four of its own six checks:

| Its own advice | AEOrank's actual implementation |
|---|---|
| "at least 6 `sameAs` entries"; "Strong AEO setups have 8–12+" | `app/page.js:46` — **1** `sameAs`, a single LinkedIn URL (verified live) |
| "Missing founding date… helps AI engines distinguish you" | No `foundingDate` in Organization schema |
| "Include author with link to author profile… `sameAs` to LinkedIn" | Author Person has no `url`, no `sameAs` |
| "Confirm `datePublished`, `dateModified`. **Confirm dates are accurate.**" | Both fields are set to the *same* variable, `post.updated` (lines 807-808), so `dateModified` can never diverge from `datePublished` by construction |
| "FAQ schema on pages that actually have meaningful FAQ content, **not stuffed onto marketing pages**" | `FAQPage` JSON-LD on all 5 `/services/*` marketing pages, answers collapsed in `<details>` |

### Freshness signals are internally contradictory

- **0 of 17** posts have ever been updated (`updated` == publish date on every one), and by construction they cannot be.
- `app/sitemap.js` sets `lastModified = new Date()` for **all 32 URLs on every build**. Live sitemap: a single `<lastmod>2026-09-16</lastmod>` repeated 32 times. So the sitemap claims every page changed on 2026-09-16 while `BlogPosting.dateModified` for `/blog/google-ai-overviews-guide` says 2026-03-06. Google will learn to distrust the `lastmod`.
- Cadence looks assigned rather than earned: **8 consecutive posts exactly 7 days apart, every one a Friday** (2026-03-06 → 2026-04-24), then a 93-day gap, then **6 posts all dated 2026-08-27** and 2 more on 2026-08-28. 8 of 17 posts (47%) land in a two-day window.
- Nothing published in 29 days.

### Read time is overstated on all 17 posts

Every `readTime` implies a reading speed of 73–155 wpm against a normal 200–250;
median **99 wpm**. Every post overstates its length roughly 2–3×:

    slug                                       words  claimed  @225wpm  implied wpm
    how-we-verify-reddit-threads                 364    5 min  1.6 min       73
    entity-authority-ai-citation                 909   11 min  4.0 min       83
    what-is-aeo                                 1061   12 min  4.7 min       88
    crowdreply-vs-aeorank                        524    6 min  2.3 min       87
    aeo-schema-markup-guide                     1395    9 min  6.2 min      155

A visible, trivially verifiable inaccuracy on 17/17 pages, on a site selling
measurement rigour.

---

## 4. Word counts: the brief's figures are chrome-inflated

The brief's "655–1717 words, average ~1100" measures rendered page text
including nav, CTA blocks, related-posts, and footer. Article prose only:

    slug                                       words  H2s  FRE  FKGL  ASL  numeric facts
    how-we-verify-reddit-threads                 364    4   59  10.1  20.2       0
    partner-network-ai-visibility                486    4   48  12.7  24.3       0
    crowdreply-vs-aeorank                        529    4   54  11.3  22.0      15
    profound-vs-peec-vs-aeorank                  569    5   49  11.2  19.6       4
    sentiment-in-ai-citations                    582    4   51  10.5  17.6       0
    getting-cited-by-claude                      670    4   47  11.7  20.3       0
    aeo-vs-seo                                   813    5   61   7.3  10.4      12
    optimize-for-perplexity                      827    5   52   9.0  12.0       4
    why-chatgpt-cites-reddit-threads             852    4   52  11.2  20.8       5
    reply-to-reddit-without-getting-removed      869    4   59   9.5  17.7       0
    measure-ai-citation-roi                      902    6   60   8.2  13.3       6
    entity-authority-ai-citation                 907    5   56   8.4  11.5       1
    google-ai-overviews-guide                    995    6   53   9.0  12.6      14
    how-to-get-cited-by-chatgpt                  997    7   60   8.3  13.7       9
    what-is-aeo                                 1062    6   50  10.4  16.6       1
    aeo-schema-markup-guide                     1401    7   53   8.7  11.4      13
    chatgpt-vs-claude-vs-gemini-citations       1402    6   45  10.8  15.4       3

    17 posts, 14,227 words, average 836

- **0 of 17 posts reach the 1,500-word topical-coverage floor for a blog post.** 14 of 17 are under 1,000. (Word count is not a direct ranking factor — treat as a coverage signal, not a target.)
- Verified live: `/blog/how-we-verify-reddit-threads` extracts to 389 words, `/blog/aeo-schema-markup-guide` to 1,446 — close to my source-parsed figures, confirming blog extraction is clean (unlike the commercial pages).
- Readability is acceptable but drifting: FRE 45–61, FKGL 7.3–12.7. The six worst (FKGL > 11) are all late-August posts; `partner-network-ai-visibility` has a 24.3-word average sentence at FKGL 12.7.
- **Five posts contain zero numeric facts**: `how-we-verify-reddit-threads`, `partner-network-ai-visibility`, `sentiment-in-ai-citations`, `getting-cited-by-claude`, `reply-to-reddit-without-getting-removed`. Nothing quotable for an AI engine to lift.

## 5. Metadata templating: PASS

Ran the required heuristic on all 33 title/description pairs
(`metadata_template.py --pairs-file`):

    pages_checked: 33   templated_count: 0   templated_ratio: 0.0
    shared_cta_phrases: {}   site_flags: []   site_risk: low

No bulk-generated metadata pattern. Secondary issues the heuristic does not cover:

- **3 pages share one description verbatim** — `/`, `/privacy`, `/terms` all carry "Help your brand show up in ChatGPT, Claude, and Gemini answers through measurable Reddit engagement." The legal pages inherit the root layout metadata.
- **Three title separator styles** across 33 pages: `" | "` ×17 (blog), `" - "` ×4 (about, contact, privacy, terms), `": "` ×3 (services, blog, home), and **9 with no brand token at all** — all 4 industry and all 5 service titles ("AEO for SaaS Companies", "Citation Building Services").
- 8 descriptions exceed 160 chars; worst is `what-is-aeo` at 203.
- No title exceeds 60 chars; no description under 70. Both fine.

## 6. `/blog/what-is-aeo` — live but missing from sitemap

`app/sitemap.js` hardcodes a 16-slug `blogSlugs` array that has drifted from the
17-entry `posts` object in `app/blog/[slug]/page.js`. `what-is-aeo` is omitted.
It returns 200, is linked from `/blog`, is the designated pillar (11 outbound
internal links, the highest on the site, 1,062 words) — and receives **0 inbound
links from any blog post's prose**. The hub-and-spoke is inverted: the pillar is
the most isolated post and the only one excluded from the sitemap. I did analyse
it; it is included in every table above.

---

## Scores

**Content quality: 46/100.** Blog prose is genuinely well-written, specific, and
de-clichéd, with real engine-by-engine differentiation and strong internal
linking. Dragged down by: 0/17 posts at the coverage floor (avg 836), four
orphaned 174-word commercial pages, 147–175-word extractable service pages, read
times inflated 2–3× site-wide, and a de-punctuation pass that introduced visible
copy errors.

**E-E-A-T: 32/100** (this skill's internal weighting, not Google's — Google
publishes no numeric weights and states only that trust matters most):

| Factor | Weight | Score | Why |
|---|---|---|---|
| Experience | 20% | 35 | 30 first-person claims, zero evidence — no named client, dataset, screenshot, or dated test. The one true process post is the site's thinnest. |
| Expertise | 25% | 45 | Topic command is real and non-generic. Author is an orphan byline: no bio, no credentials, no Person `sameAs`, named nowhere outside the post data file. |
| Authoritativeness | 25% | 22 | 1 `sameAs`. No press, case studies, or third-party validation. 0 external links in 14,227 words. 4 commercial pages fully orphaned; `/llms.txt` 404. |
| Trustworthiness | 30% | 28 | Unsourced stat bands with `+312%` reused for two different metrics; "200–400% increase" in FAQ schema directly contradicting "nobody can guarantee" on `/about` and the homepage; split Reddit-tool vs full-agency positioning; no address, legal entity, or email; `dateModified` structurally fake. |

**AI-citation readiness: 38/100.** Positives: clean heading hierarchy in posts,
BlogPosting + FAQPage + BreadcrumbList schema present, strong intra-blog
linking, no invisible-Unicode contamination, non-SPA server-rendered HTML.
Negatives: main-content extraction discards every service FAQ answer, every card
title, and every stat band; 5 posts carry zero quotable numbers; 0 external
citations; 115 list-shaped passages left as plain prose instead of marked-up
lists; unresolvable author entity; 1 `sameAs`; no `/llms.txt`; pillar post absent
from sitemap.

## Top fixes, in order

1. Delete or substantiate all 12 industry stat bands. The duplicated `+312%` is the priority — as it stands it is evidence against the site.
2. Reconcile the "200–400% increase" service FAQ with "nobody can guarantee" on `/about` and the homepage. Both are currently in `FAQPage` JSON-LD.
3. Give `/industries/*` internal links, or delete the four pages. Orphaned + 174 words + templated + unsourced stats is the worst combination on the site. Build an `/industries` index (currently 404) and fix the breadcrumb whose "Industries" label points at the homepage.
4. Move service FAQ answers out of default-collapsed `<details>` into extractable markup, and promote card `<h4>` titles into real headings.
5. Create an author identity: bio block on posts, `/about` founder section, `Person.url` + `sameAs` in `BlogPosting.author`.
6. Attach evidence to one experience claim. Turn `how-we-verify-reddit-threads` (364 words, 0 numbers) into the flagship methodology piece with real counts.
7. Separate `datePublished` from `dateModified`; stop stamping sitemap `lastmod` with the build date.
8. Recalculate all 17 `readTime` values at ~225 wpm.
9. Add `what-is-aeo` to `app/sitemap.js` and link to it from the posts that reference its subtopics.
10. Reconcile the Reddit-product vs full-service-agency positioning, then add `sameAs` entries and a `foundingDate` to Organization schema.
11. Proofread the late-August batch for stripped hyphens; fix the `"Why Its the Hardest"` metaTitle typo; add source URLs and an "as of" date to both comparison posts, and a self-interest disclosure to `profound-vs-peec-vs-aeorank`.

## Not assessed

- Per-post keyword targeting / cannibalisation across the 17 posts and 9 commercial pages.
- Factual accuracy of the AEO claims themselves (e.g. "Claude weights Wikipedia more heavily than ChatGPT") — plausible and non-generic, but unverified.
- Whether the single LinkedIn `sameAs` URL resolves to a populated company page (returns 200, but LinkedIn returns 200 for auth walls).
- Why "onboarding call" appears in the `/about` source list but 0 times in the live `/about` HTML.
- `/privacy` and `/terms` body content beyond their metadata.
- Live-rendered extraction for the other 13 blog posts and 4 service pages (6 pages sampled; blog extraction verified clean on 2).
