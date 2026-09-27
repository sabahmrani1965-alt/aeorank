# Content Architecture, pass 2 — clusters, hubs, internal link graph

Re-run of `findings/cluster.md` against the current tree. Corpus is now 19 posts,
5 service pages, 4 industry pages, an `/industries` index and `/pricing`.

Method: static parse of `app/blog/[slug]/page.js` (the `posts` content object),
`app/blog/page.js`, `app/sitemap.js`, the `RELATED` maps in
`app/services/[slug]/page.js` and `app/industries/[slug]/page.js`, plus 8 live
SERPs pulled through WebSearch (28 pairs scored).

Confidence: the link graph, orphan list, word counts and distribution metrics are
**exact**. The SERP overlap numbers are **floor estimates** — no DataForSEO /
Ahrefs / Semrush key is configured, WebSearch returns ~9 results with no
positions, and there is no volume, difficulty or CPC data. Anything below framed
as "higher value" is an argument from commercial proximity and observed SERP
composition, not a measurement.

---

## Verified fixed

| Item from pass 1 | State now |
|---|---|
| `what-is-aeo` missing from `blogSlugs` | Fixed, and structurally can't recur. `app/sitemap.js` imports `posts` from `app/blog/page.js` and `Object.keys` the services/industries maps. All 19 posts are derived. |
| `lastmod` fabricated as `new Date()` on all 32 URLs | Fixed for blog. 19 posts carry real dates, **12 distinct values** (confirmed: Sep 27 ×2, Aug 28 ×2, Aug 27 ×6, Jul 26, Apr 24, Apr 17, Apr 10, Apr 3, Mar 27, Mar 20, Mar 13, Mar 6). Static/service/industry pages still stamp `buildDate` — 18 of 37 URLs still move on every deploy. Minor, but it is the same signal problem at smaller scale. |
| 0 commercial-to-blog links | Fixed. 27 links, 3 per page across 9 pages, via `RELATED` maps. |
| `/industries/*` true orphans, no index | Fixed. `app/industries/page.js` exists, is in the sitemap, and is footer-linked (`components/Footer.js:24`). |
| Blog index pagination hiding posts | Not an issue — `app/blog/page.js` renders all 19, no slice. |

Also worth recording: `/pricing` exists, is in the sitemap, footer-linked.

---

## Answer to question 1: you created one hub and one orphan, not two hubs

### `best-ai-visibility-tools` — wired correctly as a hub, wrong SERP

Outbound: `crowdreply-vs-aeorank`, `profound-vs-peec-vs-aeorank` (both Cluster 4
spokes — **2 of 2, complete**), plus `measure-ai-citation-roi` and
`why-chatgpt-cites-reddit-threads` as cross-cluster, plus
`/services/ai-visibility-audit`. That is exactly the hub wiring the pass-1 matrix
asked for. Structurally this works.

Inbound: **zero. From anywhere.** No blog post links to it, and it is not in any
`RELATED` map. It is reachable only from `/blog` and the sitemap. It is the only
page on the site with a complete outbound hub pattern and a total absence of
inbound links.

On the deliberate choice not to make it a ranked listicle — the honest answer,
and it is a split verdict:

- **As a cluster hub, it works.** It aggregates both vs-posts, it gives them a
  parent, and the "seven questions" frame is a legitimate parent concept for two
  head-to-head comparisons. The judgement call on not asserting competitor
  pricing was right: the table of self-descriptions with links is defensible,
  ages well, and the detection-bug disclosure is real first-hand evidence — that
  is the one thing on the page no competitor can copy.
- **As the page that ranks for the money term, it does not work, and the SERP
  data is unambiguous about why.** `best AI visibility tools` returns 10/10
  ranked listicles (frase, hubspot, zapier, tryprofound, evertune, seranking,
  position.digital, usegrowthos, surferseo, semrush). The evaluation-framing
  SERP — `how to evaluate an AI visibility tool` — returns a *different* 9
  results (yext, sureoak, tryprofound, clicklaboratory, percepture, reachllm,
  getxeo, beamtrace, graph.digital). Exact-URL overlap between those two SERPs:
  **0**. Shared domains: **1** (tryprofound.com, which ranks on both with two
  different articles). Under the thresholds in this skill, 0-1 shared means
  *separate topics*, not variants.

  So the shipped article is not a weaker attempt at the listicle SERP — it is
  aimed at a different SERP entirely. That SERP is real, commercially adjacent,
  and dense with vendors doing exactly this. The article can compete there. But
  the "buying shortlist AEOrank is absent from" that pass 1 flagged is still
  unaddressed, and now harder to address, because the obvious slug and title are
  spent.

  The clean resolution is to keep this page as-is and publish a second,
  genuinely list-shaped page later (`ai-visibility-tools-compared`), with this
  one as its methodology sibling. Do not retrofit this page into a listicle; that
  destroys the one differentiated thing about it.

  One thing to fix regardless: the `metaTitle` is
  `Best AI Visibility Tools: How to Evaluate Them | AEOrank` while the H1 is
  `AI Visibility Tools: How to Actually Evaluate Them`. The meta is chasing the
  listicle term the body deliberately does not serve. That mismatch will read as
  a bounce to Google and will not win the listicle SERP anyway.

### `reddit-ai-visibility-guide` — this is not wired as a hub at all

This is the significant finding of the pass. The post is 1,565 words of prose
(largest on the site), 11 sections, well built. Its internal links are:

```
/blog/aeo-vs-seo
/blog/entity-authority-ai-citation   (×2)
/blog/measure-ai-citation-roi
/services/citation-building
/services
https://www.redditinc.com/blog, developers.google.com ×2, schema.org
```

It links to **zero of its four Reddit-cluster spokes.** Not
`why-chatgpt-cites-reddit-threads`, not
`reply-to-reddit-without-getting-removed`, not `how-we-verify-reddit-threads`,
not `sentiment-in-ai-citations`. All three of its blog links point into Clusters
1 and 2.

Worse, it covers their ground without citing them. Its section
`What gets you removed instead` is the entire subject of
`reply-to-reddit-without-getting-removed`. Its section
`Why Reddit carries weight with AI assistants` is the entire subject of
`why-chatgpt-cites-reddit-threads`. And `how-we-verify-reddit-threads` — the
368-word proprietary trust asset pass 1 called the site's best one — is still at
**zero blog inbound links**, from the post that exists to parent it.

So Cluster 3 does not have a hub. It has a fifth, longer sibling that duplicates
two spokes' topics and points its authority out of the cluster. That is the
opposite of the pass-1 recommendation, and it is a ~10-minute fix: four link
insertions in an existing file.

SERP check on the cannibalization risk: `Reddit AI search visibility guide` vs
`why does ChatGPT cite Reddit threads` share 0 exact URLs and 0 domains. So there
is **no measurable SERP cannibalization** — the two occupy disjoint result sets.
The problem is not ranking conflict, it is that the hub is topically redundant
with its spokes while being structurally disconnected from them.

### Cluster state after the two ships

| Cluster | Hub | Hub wired? | Members | Mean words |
|---|---|---|---|---|
| 1 AEO Foundations | `what-is-aeo` | outbound yes (7), inbound 0 from blog / 5 from commercial | + aeo-vs-seo, aeo-schema-markup-guide, entity-authority-ai-citation | 1,070 |
| 2 Engine-Specific Citation | **none** | — | how-to-get-cited-by-chatgpt, getting-cited-by-claude, optimize-for-perplexity, google-ai-overviews-guide, chatgpt-vs-claude-vs-gemini-citations | 1,026 |
| 3 Reddit & Source Credibility | `reddit-ai-visibility-guide` | **no — 0 of 4 spokes linked** | why-chatgpt-cites-reddit-threads, reply-to-reddit-without-getting-removed, how-we-verify-reddit-threads, sentiment-in-ai-citations | 846 |
| 4 Comparison / BOFU | `best-ai-visibility-tools` | **yes, 2 of 2 spokes** | profound-vs-peec-vs-aeorank, crowdreply-vs-aeorank | 681 |
| — stranded | — | — | partner-network-ai-visibility | 486 |

**Hubs with correct outbound wiring: 2 of 4 (was 1 of 4). Hubs with any blog
inbound links: 0 of 4 (was 0 of 4).** Cluster 2 still has five posts and no
parent — unchanged, and now the largest remaining structural hole.

Cluster 3 still exceeds the 2-4-posts-per-cluster spec at 5 members including the
hub; Cluster 2 does at 5 members with no hub. Splitting `google-ai-overviews-guide`
into its own Google-surface sub-cluster is still the right call.

---

## Answer to question 2: the link graph, measured

```
blog -> blog              45   (was 40)
blog -> commercial        39   (was 32)
commercial -> blog        27   (was 0)
reciprocal blog pairs      1   (was 1)
```

**Reciprocal pairs: still exactly 1** — `aeo-vs-seo` <-> `entity-authority-ai-citation`.
Nothing changed. 44 of 45 blog links remain one-directional, and none of the 27
new commercial links is reciprocated either (no post links to `/industries/*`
at all, see below). The bidirectional hub/spoke requirement is at **0 of 20
mandatory pairs in place**.

### In-degree, full site

| post | total in | from blog | from commercial | out (blog) | out (comm) | words |
|---|---|---|---|---|---|---|
| aeo-vs-seo | 12 | 9 | 3 | 2 | 3 | 846 |
| measure-ai-citation-roi | 11 | 8 | 3 | 1 | 3 | 949 |
| entity-authority-ai-citation | 10 | 7 | 3 | 2 | 3 | 939 |
| why-chatgpt-cites-reddit-threads | 6 | 5 | 1 | 3 | 3 | 852 |
| what-is-aeo | 5 | **0** | 5 | 7 | 1 | 1,061 |
| how-to-get-cited-by-chatgpt | 4 | 4 | 0 | 2 | 3 | 1,041 |
| chatgpt-vs-claude-vs-gemini-citations | 4 | 2 | 2 | 4 | 5 | 1,538 |
| google-ai-overviews-guide | 4 | 2 | 2 | 3 | 2 | 1,025 |
| optimize-for-perplexity | 3 | 2 | 1 | 2 | 3 | 855 |
| aeo-schema-markup-guide | 3 | 1 | 2 | 3 | 3 | 1,433 |
| getting-cited-by-claude | 2 | **0** | 2 | 2 | 1 | 670 |
| reply-to-reddit-without-getting-removed | 2 | 2 | 0 | 1 | 1 | 869 |
| profound-vs-peec-vs-aeorank | 2 | 2 | 0 | 2 | 1 | 569 |
| **reddit-ai-visibility-guide** | 2 | **0** | 2 | 3 | 2 | 1,565 |
| crowdreply-vs-aeorank | 1 | 1 | 0 | 1 | 1 | 523 |
| how-we-verify-reddit-threads | 1 | **0** | 1 | 0 | 1 | 364 |
| **best-ai-visibility-tools** | **0** | **0** | **0** | 4 | 1 | 950 |
| sentiment-in-ai-citations | **0** | 0 | 0 | 2 | 1 | 582 |
| partner-network-ai-visibility | **0** | 0 | 0 | 1 | 1 | 486 |

### Did link equity redistribute? Yes, but only on the blog side

| metric | pass 1 (blog links only) | pass 2 blog only | pass 2 blog + commercial |
|---|---|---|---|
| Gini of in-degree | 0.579 | **0.611** | **0.490** |
| HHI | 1,288 | 1,269 | 984 |
| zero-inbound posts | 6 | 7 | 3 |
| posts with >= 3 inbound | 5 | 5 | **10** |
| max in-degree | 8 | 9 | 12 |

Read this carefully, because the two columns say opposite things.

- **Blog-to-blog distribution got slightly worse.** Gini rose 0.579 -> 0.611.
  The five new blog links landed on pages that were already the most-linked
  (`aeo-vs-seo` 8->9, `measure-ai-citation-roi` 6->8, `entity-authority` 6->7 —
  three of the five came from the new Reddit hub). The rich got richer.
- **Whole-graph distribution improved materially.** Counting the 27 commercial
  links, Gini falls to 0.490, HHI drops 23%, and posts with at least 3 inbound
  links doubles from 5 to 10. This is a real improvement and the 27 links are
  the reason.

The asymmetry matters: the 27 links fixed *blog-side* under-linking. They did not
touch the *commercial-side* skew, because they point the wrong way for that.

### Commercial-side equity: unchanged and still the deeper problem

All 39 blog-to-commercial links, by target:

```
/services/ai-visibility-audit   17  (44%)   was 15 (47%)
/services/citation-building     11  (28%)   was  8
/services/entity-optimization    5  (13%)   was  5
/services/aeo-management         4  (10%)   was  3
/services                        2   (5%)   was  1
/services/aeo-consulting         0    -     was  0
/industries/saas                 0    -     was  0
/industries/startups             0    -     was  0
/industries/software             0    -     was  0
/industries/tech-it              0    -     was  0
/industries (new index)          0    -     new
/pricing (new)                   0    -     new
```

`/services/aeo-consulting` still receives zero internal links from the blog.
All four `/industries/*` pages still receive zero. The new `/industries` index
and the new `/pricing` page also receive zero from the blog — they are reachable
only from the footer. The industry pages now *send* 12 links into the blog while
receiving 0 back, which is worse than the pass-1 state in one narrow sense: they
are now leaking what little crawl authority they have without recovering any.

`/pricing` receiving zero contextual links is a live miss. Three of the four
BOFU-adjacent pages (`best-ai-visibility-tools`, `profound-vs-peec-vs-aeorank`,
`crowdreply-vs-aeorank`) discuss what things cost and none links to the page
that says what AEOrank costs.

---

## Answer to question 3: yes, confirmed and quantified

- `best-ai-visibility-tools`: **0 inbound links from anywhere on the site.**
  Not from any of the 19 posts, not from any of the 9 `RELATED` maps. Reachable
  only via `/blog` and `sitemap.xml`. It is one of exactly **3 total site-wide
  orphans**, alongside `sentiment-in-ai-citations` and
  `partner-network-ai-visibility`.
- `reddit-ai-visibility-guide`: **0 inbound from the blog**, 2 inbound from
  commercial (`/services/citation-building`, `/industries/startups`). Not a total
  orphan, but it has no path in from any of the four posts it is supposed to
  parent.

Orphan accounting, and the number moved both ways depending on definition:

| definition | pass 1 | pass 2 |
|---|---|---|
| 0 inbound blog links | 6 | **7** |
| 0 inbound links site-wide | 6 | **3** |

The 27 commercial links de-orphaned `what-is-aeo`, `getting-cited-by-claude` and
`how-we-verify-reddit-threads` (all now have commercial inbound only). But the
two new posts added themselves to the blog-graph orphan list, so that count went
up. `crowdreply-vs-aeorank` picked up its first blog inbound link — from
`best-ai-visibility-tools`, i.e. from a page that is itself an orphan, so the
equity passed is near zero.

Net: 3 of 19 posts (16%) are still entirely unlinked, and the most recently
published, most expensive-to-produce asset is one of them.

---

## Cannibalization re-check: still clean, one topical overlap to watch

8 head terms, 28 pairs scored on live SERPs.

- Pairs at 7-10 shared URLs (merge): **0**
- Pairs at 4-6 (same cluster): **0**
- Pairs at 2-3 (interlink): **0**
- Max exact-URL overlap across all 28 pairs: **0**
- Max shared-domain overlap: **1**
- Pairs with zero URL *and* zero domain overlap: 21 of 28
- Duplicate primary keywords across the 19 posts: **0**

Shared-domain pairs, for the record: tryprofound.com appears on three of the
eight SERPs; semrush.com, frase.io, optiseon.com and ahrefs.com each on two.
Those are the competitors with genuine cross-topic coverage in this category.

The one thing to watch is not a SERP conflict, it is a content one:
`reddit-ai-visibility-guide` restates the theses of
`why-chatgpt-cites-reddit-threads` and `reply-to-reddit-without-getting-removed`
in section form. That is acceptable *only* if the hub links to both and defers to
them for depth. It currently does neither. Left as-is for another two or three
Reddit posts, this becomes real cannibalization.

---

## Word counts

Prose-only, link labels unwrapped, markup and metadata excluded. Total 17,117
words across 19 posts, mean **901** (was 854 across 17). The two new posts lifted
the mean by 47 words.

Posts meeting the 1,200-1,800 spoke spec: **3 of 19** (was 2 of 17) —
`reddit-ai-visibility-guide` 1,565, `chatgpt-vs-claude-vs-gemini-citations`
1,538, `aeo-schema-markup-guide` 1,433. Posts meeting the 2,500-4,000 pillar
spec: **0**, unchanged. `what-is-aeo` is still 1,061.

My counts read slightly below the figures in the brief (1,565 vs 1,634 for the
Reddit guide; 950 vs 1,003 for the tools post). The difference is markdown link
syntax, table pipes and bold markers, which I strip and a raw count does not.
Either number is fine; be consistent about which you quote.

Sixteen of 19 read-time labels remain inflated at 225 wpm. The two new ones are
the closest to honest yet: `reddit-ai-visibility-guide` labelled 9 min against
7 min actual, `best-ai-visibility-tools` labelled 8 min against 4 min actual.
`what-is-aeo` is still labelled 12 min for a 5-minute read.

---

## The link insertions to make, in order

### Tier 0 — free, no writing, ~30 minutes total

1. **Wire the Reddit hub to its cluster.** In `reddit-ai-visibility-guide`, add
   links to `why-chatgpt-cites-reddit-threads` (from the "Why Reddit carries
   weight" section), `reply-to-reddit-without-getting-removed` (from "What gets
   you removed instead"), `how-we-verify-reddit-threads` (from "Where to actually
   spend the effort") and `sentiment-in-ai-citations` (from "How to measure it
   honestly"). Four insertions. This converts a redundant fifth sibling into an
   actual hub and de-orphans the site's best trust asset.
2. **De-orphan `best-ai-visibility-tools`.** Add inbound from
   `profound-vs-peec-vs-aeorank`, `crowdreply-vs-aeorank` (making both pairs
   reciprocal — takes reciprocal pairs from 1 to 3) and `measure-ai-citation-roi`.
   Add it to `RELATED` for `/services/ai-visibility-audit` and
   `/industries/software`.
3. **Return links for `what-is-aeo`.** It sends 7 and receives 0 from the blog.
   Add a link back from each of the 7. That alone takes reciprocal pairs from 1
   to 8 and gives the cornerstone its first blog-side authority.
4. **Link `/pricing`** from `best-ai-visibility-tools`,
   `profound-vs-peec-vs-aeorank`, `crowdreply-vs-aeorank` and
   `measure-ai-citation-roi`.
5. **Give `/services/aeo-consulting` and the four `/industries/*` pages inbound
   blog links.** Every industry page currently sends 3 and receives 0. At minimum,
   `what-is-aeo` and `aeo-vs-seo` should link to `/industries/saas`;
   `chatgpt-vs-claude-vs-gemini-citations` to `/industries/tech-it`;
   `aeo-schema-markup-guide` to `/industries/software`.
6. **De-orphan `sentiment-in-ai-citations` and `partner-network-ai-visibility`** —
   the two remaining total orphans. Sentiment belongs in
   `/services/ai-visibility-audit`'s `RELATED`; partner-network is genuinely
   stranded and should either get a small distribution cluster or be folded into
   the Reddit cluster as a sourcing tactic.

### Tier 1 — the mandatory hub/spoke matrix, after Tier 0

Cluster 3 (`reddit-ai-visibility-guide`) and Cluster 4
(`best-ai-visibility-tools`) become complete once Tier 0 items 1 and 2 land.
Cluster 1 completes with item 3. Cluster 2 cannot complete until a hub exists —
see gap #1 below. Hub-to-hub links (`what-is-aeo` <-> each of the other three)
are still all missing; without them the clusters are four islands.

---

## Answer to question 4: the remaining gaps, re-ranked

Two of the pass-1 top five shipped. Re-ranked against the current graph, not the
old list. Still ordered by commercial proximity, still not by volume — there is
no volume data.

### 1. `ai-citation-playbook` — "How to Get Cited by AI: The Cross-Engine Playbook"
Was #4. **Now #1.** Hub for Cluster 2.

Cluster 2 is now the only cluster with no hub at all, and it is the biggest: five
posts, 5,129 words, containing the site's second-strongest page
(`chatgpt-vs-claude-vs-gemini-citations`, 1,538 words) which is still awkwardly
acting as de facto parent. The two ships fixed Clusters 3 and 4's hub problem
(3 imperfectly); this is what's left.

It also maps directly onto the retainer pitch — "we manage citations across all
engines" — rather than a one-off audit, which is the only remaining gap that
argues for recurring revenue.

SERP: `how to get cited by ChatGPT, Perplexity, Gemini` returns 9 results, all
playbook/guide-shaped (gotechark, frase, pixelmojo ×2, mersel.ai, buildmvpfast,
verlua, mesmerise, mediaofficers). Notably it is agencies and small vendors, not
hubspot/zapier/semrush — a materially softer field than the tools SERP. Overlap
with the tools SERP: 0 URLs, 1 domain (frase.io). Overlap with every other
sampled term: 0.

Target 3,000-4,000 words, becomes the site's strongest page. Feeds
`/services/aeo-management` and `/services/citation-building`. Wire bidirectionally
to all five spokes plus `what-is-aeo`.

### 2. `aeo-for-b2b-saas` — "Answer Engine Optimization for B2B SaaS"
Was #2. **Holds at #2, and the case got stronger.**

The four `/industries/*` pages now push 12 links into the blog and receive zero
back. This is still the only planned article that can legitimately link into all
four of them, and it is still the only audience-scoped piece in a corpus of 19
topic- and engine-scoped posts. Every existing post already tags `b2b-saas`.

SERP re-checked: 9 results, all agency and vendor guides (elsner, bluetext, madx,
sproutworth, partnerstack, siteimprove, unrealdigitalgroup, semai, storylane).
Zero URL and zero domain overlap with every other term sampled — clean, separate
SERP. The field is agencies selling the service, which means buyers on this term
are researching who to hire.

Target 2,000-2,500 words. Feeds `/industries/saas`, `/industries/startups`,
`/services/aeo-consulting` (still at zero blog inbound). Then spin per-vertical
variants for `tech-it` and `software`.

Only reason it is not #1: it fills a *commercial-page* support gap, whereas
`ai-citation-playbook` fills the last remaining *structural* hole in the cluster
architecture. If the priority is revenue proximity over architecture, swap these
two — the argument is close and I would not fight it.

### 3. `ai-visibility-tools-compared` — the listicle the shipped post deliberately isn't
New entry, and it exists only because of how #1 shipped.

The `best AI visibility tools` SERP is 10/10 ranked listicles and AEOrank is
absent from it. The shipped `best-ai-visibility-tools` targets a provably
different SERP (0 URL overlap, 1 shared domain). So the pass-1 gap is still open.

This is a genuinely awkward recommendation and I want to be straight about it:
the reason it was not written as a listicle is a good reason, and the honest
version of a listicle is hard. But note what tryprofound.com does — it ranks on
*both* SERPs with two separate articles, one evaluation guide and one "18 best
tools for agencies". That is the existence proof that both pages can coexist
without cannibalizing, and the SERP data here says the same.

If written, it should be list-shaped, cite each vendor's own public pricing page
with a retrieval date, state plainly that features change monthly, and link to
`best-ai-visibility-tools` as the methodology behind the ordering. Ranked third,
not first, because the listicle SERP is the most competitive field sampled in
either pass (hubspot, zapier, semrush, surferseo all present) and a 19-post site
with no pillar over 1,600 words is not winning it yet. Do #1 and #2 first, then
this.

### 4. `how-to-audit-ai-visibility` — "How to Run an AI Visibility Audit (Step by Step)"
Was #5. Holds at #4.

`/services/ai-visibility-audit` still absorbs 17 of 39 blog-to-commercial links
(44%) and still has no informational article supporting it. SERP re-checked: 9
step-by-step guides and checklists (yotpo, cision, shadow.inc, billwidmer,
fratzkemedia, goflydragon, mywebaudit, thehyperminds, geneo) — intent is
unambiguously "show me the method", so the article has to actually deliver it.
Zero overlap with all other sampled terms.

The self-cannibalization caveat from pass 1 stands: the honest version teaches
readers to do free what the service charges for. Write the manual method, then an
explicit account of where it breaks at scale. There is now a strong internal hook
for that — the detection-bug disclosure in `best-ai-visibility-tools` is exactly
the "why manual and naive tooling both fail" evidence this article needs, and
linking the two de-orphans the tools post as a side effect.

### 5. `expand what-is-aeo to pillar length` — not a new article, still ranked
Still 1,061 words against a 2,500-4,000 spec, still labelled 12 min, still the
declared cornerstone, still 0 blog inbound. It sends 7 links and receives none.

Ranked fifth as *work*, but note it is the cheapest item on this list that
changes a headline metric, and item 3 in Tier 0 above (return links) costs
nothing and should happen this week regardless of when the expansion does.

### Considered and still below the line
`geo-vs-aeo-vs-llm-seo` — SERP re-checked and it is now harder than pass 1
suggested: ahrefs.com and neilpatel.com both rank, and ahrefs' angle ("GEO, LLMO,
AEO… it's all just SEO") actively argues the term is noise. Purely definitional,
far from any money page, and `aeo-vs-seo` covers part of it. Skip.

`llms-txt-guide` — unchanged assessment. Documentation-led SERP, weak commercial
proximity, standard not widely adopted.

---

## Pre-delivery checklist

| check | state |
|---|---|
| No two posts share a primary keyword | pass — 0 duplicates across 19 |
| Every spoke has >= 3 incoming internal links | **fail** — 9 of 19 have < 3; 3 have 0 |
| Every spoke links to its pillar | **fail** — 0 of 20 mandatory pairs bidirectional |
| Pillar links to every spoke | partial — `what-is-aeo` 7/7 and `best-ai-visibility-tools` 2/2 pass; `reddit-ai-visibility-guide` **0/4**; Cluster 2 has no pillar |
| No orphan pages | **fail** — 3 site-wide orphans, 7 blog-graph orphans |
| Template matches intent | pass — commercial-intent posts use comparison/table blocks, informational use guide structure |
| Word count within spec | **fail** — 0 posts at pillar spec, 3 of 19 at spoke spec |
| Cluster size within 2-5 clusters / 2-4 posts | **fail** — Clusters 2 and 3 have 5 members each |
| SERP overlap supports groupings | **inconclusive** — max overlap 0 across 28 pairs; clustering rests on topical-entity and link-graph evidence, not SERP intersection. No paid SERP API; treat cluster boundaries as well-argued rather than measured. |

---

## Score

Content Architecture: **42 -> 58 / 100.**

Credit for: the sitemap now being derived (a class of bug eliminated, not just an
instance), 12 real `lastmod` values, 27 commercial-to-blog links, the
`/industries` index, whole-graph Gini 0.579 -> 0.490, posts with >= 3 inbound
links 5 -> 10, and one correctly-wired hub.

Withheld for: reciprocal pairs still 1, the Reddit hub linking none of its four
spokes, `best-ai-visibility-tools` shipping as a total orphan, Cluster 2 still
hubless, `/services/aeo-consulting` and all four `/industries/*` still at zero
blog inbound, and no page yet at pillar length.
