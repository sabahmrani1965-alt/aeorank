# Content Architecture — Topic Clusters, Cannibalization, Internal Links

Scope: 17 blog posts (not 16 — see below), 5 service pages, 4 industry pages.
Method: static analysis of `app/blog/[slug]/page.js`, `app/blog/page.js`,
`app/sitemap.js`, `app/services/[slug]/page.js`, `app/industries/[slug]/page.js`,
plus 11 live SERPs pulled via WebSearch.

## Confidence caveat — no SERP API

No DataForSEO / Ahrefs / Semrush key is configured. SERP overlap below was
measured by pulling live top-9/10 organic result sets through WebSearch and
computing exact-URL and registered-domain intersections. Limits:

- WebSearch returns ~9 results, not a true top-10 with positions, so overlap
  scores are floor estimates, not exact.
- No search volume, no difficulty, no CPC. The missing-article ranking at the
  bottom is therefore ordered by **commercial proximity** (distance to a money
  page) and by observed SERP composition, not by volume. This is what was asked
  for, but it does mean "high value" here is an argument, not a measurement.
- 11 head terms sampled, 55 pairs scored. Enough to rule out cannibalization on
  the main terms; not enough to rule it out across every long-tail variant.

Numbers that are exact and not estimated: the internal link graph, the orphan
list, prose word counts, and the sitemap omission.

---

## Critical: the pillar page exists, and nothing points at it

`what-is-aeo` is in the blog data file and on the blog index. It was added in
commit `fb8bc50` "Add 'What Is AEO?' cornerstone blog post". It is the only post
built like a hub — it links out to 7 other posts, more than double any other post.

Three things are wrong with it at once:

1. **It is missing from `app/sitemap.js`.** The `blogSlugs` array lists 16 slugs;
   `what-is-aeo` is not one of them. Confirmed against the live
   `https://www.aeorank.tech/sitemap.xml`, which serves 32 URLs and omits
   `/blog/what-is-aeo`. This is also why the brief that started this audit said
   "16 existing posts" — the sitemap is the source everyone is reading from, and
   the cornerstone post is not in it.
2. **It has zero incoming internal links.** None of the 7 posts it links to
   links back. The hub is a dead end in reverse.
3. **It is 1,104 words.** A pillar needs 2,500-4,000. It is currently the
   shortest-per-promise page on the site (labelled "12 min read").

Net effect: the site has a hub-and-spoke architecture where the hub is invisible
to crawlers, receives no internal authority, and is thinner than four of its own
spokes. Fixing the sitemap array is a one-line change and is the single highest
leverage item in this whole findings file.

## The de facto hub is the wrong page

Ranked by incoming internal links:

| post | in | out | commercial links | words |
|---|---|---|---|---|
| aeo-vs-seo | **8** | 2 | 3 | 883 |
| entity-authority-ai-citation | 6 | 2 | 3 | 970 |
| measure-ai-citation-roi | 6 | 1 | 2 | 983 |
| how-to-get-cited-by-chatgpt | 4 | 2 | 3 | 1,076 |
| why-chatgpt-cites-reddit-threads | 4 | 3 | 2 | 875 |
| google-ai-overviews-guide | 2 | 3 | 2 | 1,062 |
| optimize-for-perplexity | 2 | 2 | 3 | 887 |
| chatgpt-vs-claude-vs-gemini-citations | 2 | 4 | 3 | 1,491 |
| reply-to-reddit-without-getting-removed | 2 | 1 | 1 | 889 |
| aeo-schema-markup-guide | 1 | 3 | 3 | 1,489 |
| profound-vs-peec-vs-aeorank | 1 | 2 | 1 | 580 |
| **what-is-aeo** | **0** | **7** | 1 | 1,104 |
| **getting-cited-by-claude** | **0** | 2 | 1 | 690 |
| **sentiment-in-ai-citations** | **0** | 2 | 1 | 595 |
| **partner-network-ai-visibility** | **0** | 1 | 1 | 494 |
| **crowdreply-vs-aeorank** | **0** | 1 | 1 | 539 |
| **how-we-verify-reddit-threads** | **0** | **0** | 1 | 367 |

`aeo-vs-seo` absorbs 8 of the 40 internal blog links — more than any other page —
but it is a definitional comparison post, a classic spoke. All the accumulated
internal authority is pooling in a page that has nowhere to send it (2 outbound
blog links) and that targets a term the site does not need to own commercially.

**Reciprocal link pairs across the entire blog: 1.** Only
`aeo-vs-seo` <-> `entity-authority-ai-citation` link to each other. Every other
one of the 40 internal links is one-directional. The spec for a cluster is
bidirectional spoke-pillar linking; the site currently has effectively none.

## Six orphan posts

Zero incoming internal links from any other post: `what-is-aeo`,
`getting-cited-by-claude`, `sentiment-in-ai-citations`,
`partner-network-ai-visibility`, `crowdreply-vs-aeorank`,
`how-we-verify-reddit-threads`.

`how-we-verify-reddit-threads` is the worst case: 0 in, 0 blog links out, 367
words, reachable only from the paginated blog index. It is a methodology/trust
asset — exactly the kind of page that should be linked from every Reddit-cluster
post and from `/services/citation-building` as the proof-of-work page. Instead
nothing references it.

---

## The actual cluster structure these posts form

Four clusters, plus one stranded post. Assignments are from topical entity
overlap and the existing link graph, corroborated by SERP separation.

### Cluster 1 — AEO Foundations (hub exists, mis-wired)
Hub: `what-is-aeo` (1,104 w — needs 2,500+)
Spokes: `aeo-vs-seo` (883), `aeo-schema-markup-guide` (1,489),
`entity-authority-ai-citation` (970)
Funnels to: `/services/entity-optimization`, `/services/aeo-consulting`
Status: hub present but sitemap-excluded and orphaned. Spokes never link up.
This is the only cluster with a real hub, and it is the one hub that is broken.

### Cluster 2 — Engine-Specific Citation (NO HUB)
Members: `how-to-get-cited-by-chatgpt` (1,076), `getting-cited-by-claude` (690),
`optimize-for-perplexity` (887), `google-ai-overviews-guide` (1,062),
`chatgpt-vs-claude-vs-gemini-citations` (1,491)
Funnels to: `/services/citation-building`, `/services/aeo-management`
Status: **five posts, no hub.** This is the largest cluster on the site and it
has no parent page. `chatgpt-vs-claude-vs-gemini-citations` is being used as a
de facto hub (4 outbound, 2 inbound) but it is a comparison post — it answers
"which engine" not "how do I get cited across engines". Also exceeds the 2-4
posts-per-cluster spec: at 5 members it should be split, with the Google surface
(`google-ai-overviews-guide`) pulled into its own sub-cluster.

### Cluster 3 — Reddit & Source Credibility (NO HUB)
Members: `why-chatgpt-cites-reddit-threads` (875),
`reply-to-reddit-without-getting-removed` (889),
`how-we-verify-reddit-threads` (367), `sentiment-in-ai-citations` (595)
Funnels to: `/services/citation-building`, `/services/ai-visibility-audit`
Status: no hub. `why-chatgpt-cites-reddit-threads` is doing hub duty (4 in, 3
out) but is scoped to ChatGPT specifically, so it cannot parent the sentiment
and verification posts. This is the cluster most differentiated from
competitors — the Reddit-verification angle is genuinely proprietary — and it is
the cluster with the thinnest average post (682 words).

### Cluster 4 — Comparison / BOFU (NO HUB)
Members: `profound-vs-peec-vs-aeorank` (580), `crowdreply-vs-aeorank` (539)
Funnels to: `/services/aeo-management`, `/services/ai-visibility-audit`
Status: no hub, and both members are the two shortest comparison pages on the
site. Competitor SERPs for this space are 1,500-3,000-word ranked listicles
(see gap #1). Two 550-word vs-pages cannot compete with them and have nothing
above them to aggregate into.

### Stranded — `partner-network-ai-visibility` (494 w)
Belongs to no cluster. Its only sibling link is to
`why-chatgpt-cites-reddit-threads`. Topic is affiliate/partner-program
distribution, which is a channel tactic with no supporting content around it.
Either build a small distribution cluster under it or fold it into the Reddit
cluster as a sourcing tactic.

**Summary: 3 of 4 clusters have no hub page at all, and the 4th has a hub that
is excluded from the sitemap and orphaned.**

---

## Cannibalization check: clean

55 pairs scored on exact top-of-SERP URL intersection.

- Pairs at 7-10 shared URLs (should be merged): **0**
- Pairs at 4-6 shared URLs (same cluster confirmed by SERP): **0**
- Pairs at 2-3 shared URLs (interlink): **0**
- Max exact-URL overlap observed across all 55 pairs: **0**
- Max registered-domain overlap: 2 (`what-is-aeo` vs `aeo-vs-seo` share
  hubspot.com and nogood.io; `optimize-for-perplexity` vs
  `measure-ai-citation-roi` share stackmatix.com and aeo.page)

No two posts share a primary keyword, and no two compete on the same SERP. The
topics are correctly differentiated. **The problem is not cannibalization — it
is missing hubs and a one-way funnel.** Do not merge anything.

One caveat: zero overlap across every pair is itself a signal that the posts sit
in adjacent-but-disjoint SERPs with no shared head term above them. That is
consistent with the missing-hub diagnosis — a hub page is exactly what would
share URLs with several spokes at once.

## Word count: 15 of 17 posts are below the spoke minimum

Spoke spec is 1,200-1,800 words. Only `chatgpt-vs-claude-vs-gemini-citations`
(1,491) and `aeo-schema-markup-guide` (1,489) clear it. No post is within range
of the 2,500-4,000 pillar spec. Total prose across the whole blog: 14,512 words,
averaging 854.

This matters more than usual for this specific site. The SERP research surfaced a
consistent finding from cited-content studies — pages of 1,500+ words with
100-150-word answer-style sections earn materially more ChatGPT citations. A site
selling AEO whose own posts average 854 words is failing its own thesis, and the
`/blog` corpus is the primary demonstration asset for the services being sold.

Read-time labels are inflated on 15 of 17 posts (measured at 225 wpm):

- `entity-authority-ai-citation`: labelled 11 min, actual 4 min (970 w)
- `what-is-aeo`: labelled 12 min, actual 5 min (1,104 w)
- `google-ai-overviews-guide`: labelled 10 min, actual 5 min (1,062 w)
- `how-we-verify-reddit-threads`: labelled 5 min, actual 2 min (367 w)

Worth fixing for its own sake, and note it conflicts with `findings/content.md`,
which reports "655-1,717 words, averaging ~1,100". That range was measured over
raw source including metadata and JSX tokens. Prose-only counts are above and are
the ones to use.

---

## The internal link matrix that should exist

Current state: 40 blog-to-blog links, 1 reciprocal pair, 32 blog-to-commercial
links, **0 commercial-to-blog links**.

### Mandatory — bidirectional hub/spoke (currently 0 of 18 in place)

Cluster 1, hub `what-is-aeo`:
- `what-is-aeo` <-> `aeo-vs-seo` (out exists, return link missing)
- `what-is-aeo` <-> `aeo-schema-markup-guide` (out exists, return missing)
- `what-is-aeo` <-> `entity-authority-ai-citation` (out exists, return missing)

Cluster 2, hub NEW `ai-citation-playbook` (see gap #2):
- hub <-> `how-to-get-cited-by-chatgpt`
- hub <-> `getting-cited-by-claude`
- hub <-> `optimize-for-perplexity`
- hub <-> `chatgpt-vs-claude-vs-gemini-citations`
- hub <-> `google-ai-overviews-guide`

Cluster 3, hub NEW `reddit-ai-visibility-guide` (see gap #3):
- hub <-> `why-chatgpt-cites-reddit-threads`
- hub <-> `reply-to-reddit-without-getting-removed`
- hub <-> `how-we-verify-reddit-threads`
- hub <-> `sentiment-in-ai-citations`

Cluster 4, hub NEW `best-ai-visibility-tools` (see gap #1):
- hub <-> `profound-vs-peec-vs-aeorank`
- hub <-> `crowdreply-vs-aeorank`

Plus hub-to-hub, so the four clusters form one graph rather than four islands:
- `what-is-aeo` <-> `ai-citation-playbook`
- `what-is-aeo` <-> `reddit-ai-visibility-guide`
- `what-is-aeo` <-> `best-ai-visibility-tools`

### Recommended — spoke-to-spoke within cluster

Cluster 2: `getting-cited-by-claude` <-> `optimize-for-perplexity` (both
engine-specific, both currently under-linked); `how-to-get-cited-by-chatgpt`
<-> `google-ai-overviews-guide`.
Cluster 3: `how-we-verify-reddit-threads` needs inbound from all three siblings —
it is the methodology proof and currently has none.
Cluster 4: the two vs-posts should reference each other; currently
`crowdreply-vs-aeorank` -> `profound-vs-peec-vs-aeorank` is one-way.

### Missing entirely — commercial pages link nowhere

`/services/[slug]` outbound links: `/`, `/services`, `/signup` x2.
`/industries/[slug]` outbound links: `/`, `/contact` x2, `/signup` x2.

Zero blog links from either template. The funnel is strictly one-directional:
posts push to money pages, money pages push only to signup. Every service and
industry page should carry 3-4 supporting-article links:

| commercial page | should link to |
|---|---|
| /services/aeo-management | ai-citation-playbook, measure-ai-citation-roi, chatgpt-vs-claude-vs-gemini-citations |
| /services/aeo-consulting | what-is-aeo, aeo-vs-seo, aeo-for-b2b-saas |
| /services/citation-building | reddit-ai-visibility-guide, why-chatgpt-cites-reddit-threads, how-we-verify-reddit-threads |
| /services/entity-optimization | entity-authority-ai-citation, aeo-schema-markup-guide, getting-cited-by-claude |
| /services/ai-visibility-audit | sentiment-in-ai-citations, measure-ai-citation-roi, best-ai-visibility-tools |
| /industries/saas | aeo-for-b2b-saas, ai-citation-playbook, measure-ai-citation-roi |
| /industries/startups | aeo-for-b2b-saas, best-ai-visibility-tools, aeo-vs-seo |
| /industries/tech-it | aeo-schema-markup-guide, entity-authority-ai-citation |
| /industries/software | best-ai-visibility-tools, ai-citation-playbook |

### Commercial link distribution is badly skewed

Across all 32 blog-to-commercial links:

    /services/ai-visibility-audit    15   (47%)
    /services/citation-building       8
    /services/entity-optimization     5
    /services/aeo-management          3
    /services                         1
    /services/aeo-consulting          0
    /industries/* (all four)          0

`/services/ai-visibility-audit` is the closing CTA in nearly every post, which
makes it the only commercial page receiving real internal authority.
`/services/aeo-consulting` receives none. The four `/industries/*` pages —
already flagged as thin and near-duplicate in `findings/content.md` — receive
**zero internal links from the blog**. They are the pages meant to win vertical
commercial intent, they are the weakest pages on the site, and nothing supports
them. That combination is why they will not rank.

---

## The 5 highest-value missing articles, ranked by commercial proximity

Ranked by distance to revenue, not volume. Each row names the money page it
feeds and the cluster hole it fills.

### 1. `best-ai-visibility-tools` — "Best AI Visibility Tools / AEO Platforms, Compared"
Commercial proximity: **highest.** BOFU. Hub for Cluster 4.
Feeds: `/services/aeo-management`, `/services/ai-visibility-audit`, `/industries/software`
Why first: the two existing vs-posts (`profound-vs-peec-vs-aeorank`,
`crowdreply-vs-aeorank`) are already bottom-funnel and already convert-adjacent,
but they are 580 and 539 words and have no parent. The SERP for this term is
entirely ranked listicles from direct competitors and adjacent vendors
(nicklafferty.com, evertune.ai, kime.ai, cognizo.ai, frictionai.co, aeovision.ai
— 9 of 9 results). AEOrank is absent from a SERP that is literally a buying
shortlist for its own category. This is the only gap where ranking and revenue
are the same event. Target 2,500-3,000 words, comparison-table template, include
AEOrank honestly positioned alongside Profound/Peec/Otterly/Scrunch.

### 2. `aeo-for-b2b-saas` — "Answer Engine Optimization for B2B SaaS"
Commercial proximity: **very high.** Vertical MOFU.
Feeds: `/industries/saas`, `/industries/startups`, `/services/aeo-consulting`
Why: this single article closes two gaps at once — it is the only piece that can
legitimately link into the four orphaned `/industries/*` pages, and it covers the
one audience framing the blog has zero content for. All 17 existing posts are
topic- or engine-scoped; none is audience-scoped. The SERP is dense with agency
and vendor guides (elsner, bluetext, partnerstack, siteimprove, aeoranks) and
notably includes "9 Best AEO Agencies For B2B SaaS" — buyers researching this
term are researching who to hire. Every existing post already tags `b2b-saas`,
so the topical authority is there; the landing page for it is not. Target
2,000-2,500 words, then spin per-vertical variants for tech-it and software.

### 3. `reddit-ai-visibility-guide` — "Reddit and AI Visibility: The Complete Guide"
Commercial proximity: **high.** Hub for Cluster 3, direct feed to the core service.
Feeds: `/services/citation-building`, `/services/ai-visibility-audit`
Why: this is the defensible moat. Four existing posts sit here, the topic is
proprietary to AEOrank's actual workflow (thread verification at comment level),
and the SERP shows heavy commercial interest with real data hooks (Reddit is the
#2 most-cited domain in ChatGPT; the $60M OpenAI licensing deal). But the four
posts average 682 words with no parent, and `how-we-verify-reddit-threads` — the
single best trust asset on the site — is a 367-word full orphan. A proper hub
here rescues four thin posts and gives `/services/citation-building` the
supporting content it has none of. Target 2,500-3,000 words.

### 4. `ai-citation-playbook` — "How to Get Cited by AI: The Cross-Engine Playbook"
Commercial proximity: **high.** Hub for the largest cluster.
Feeds: `/services/aeo-management`, `/services/citation-building`
Why: five orphan-ish engine posts with no parent is the biggest structural hole
in the blog. This hub aggregates ChatGPT, Claude, Perplexity, Gemini and AI
Overviews into one cross-engine methodology page, which is the framing that maps
directly onto a retainer ("we manage citations across all engines") rather than
a one-off. It also gives `chatgpt-vs-claude-vs-gemini-citations` — currently the
strongest post on the site at 1,491 words — something to sit under instead of
awkwardly acting as hub. Ranked below #3 only because the engine-specific SERPs
are more crowded and the individual posts already exist. Target 3,000-4,000
words, becomes the second-strongest page on the site.

### 5. `how-to-audit-ai-visibility` — "How to Run an AI Visibility Audit (Step by Step)"
Commercial proximity: **high but self-cannibalizing risk.** TOFU-to-service bridge.
Feeds: `/services/ai-visibility-audit`
Why: `/services/ai-visibility-audit` already receives 15 of 32 internal
commercial links — it is the site's main conversion target and has no
informational article supporting it. The SERP is a full page of free
step-by-step guides and downloadable checklists (triplewhale, yotpo, cision,
ahrefs, partnerstack), so the search intent is "show me how", and the content
must genuinely deliver the method to rank. Ranked fifth deliberately: the honest
version of this article teaches readers to do for free what the service charges
for, and several SERP competitors explicitly promise "no paid tools, 6-10
hours". Write it as the manual method plus an explicit, credible account of where
the manual method breaks down at scale (multi-engine, longitudinal, sentiment).
Target 2,000-2,500 words.

### Considered and ranked below the top 5
`geo-vs-aeo-vs-llm-seo` (terminology disambiguation, real search interest, but
purely definitional — sits far from any money page, and `aeo-vs-seo` already
partly covers it); `llms-txt-guide` (technically adjacent to
`/services/entity-optimization`, but the standard is not yet widely adopted and
the SERP is documentation-led, so commercial proximity is weak).

---

## Priority order

1. Add `what-is-aeo` to `blogSlugs` in `app/sitemap.js` — one line, unblocks the
   only existing hub.
2. Add return links from the 7 posts `what-is-aeo` links to, making pillar/spoke
   bidirectional for Cluster 1.
3. Add 3-4 blog links to each `/services/[slug]` and `/industries/[slug]` page —
   ends the one-way funnel, gives the four orphaned industry pages internal support.
4. Link `how-we-verify-reddit-threads` from its three Reddit-cluster siblings;
   de-orphan `getting-cited-by-claude`, `sentiment-in-ai-citations`,
   `crowdreply-vs-aeorank`, `partner-network-ai-visibility`.
5. Publish gap #1 (`best-ai-visibility-tools`), then #2 (`aeo-for-b2b-saas`).
6. Expand `what-is-aeo` to 2,500+ words; correct the 15 inflated read-time labels.
7. Publish gaps #3, #4, #5 as cluster hubs, wiring each per the mandatory matrix.
