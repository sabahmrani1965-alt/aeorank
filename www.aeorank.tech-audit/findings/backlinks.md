# Backlink Profile

## Data sources checked (`backlinks_auth.py --check`)

| Source | Available | Notes |
|---|---|---|
| Common Crawl web graph | Yes | Public, no key — used below |
| Verification crawler | Yes | No known-backlink list was supplied to verify, so not applicable this run |
| Moz Link Explorer | **No** | No `MOZ_API_KEY` / config entry on this machine |
| Bing Webmaster Tools | **No** | No `BING_WEBMASTER_API_KEY` on this machine |
| Keywords Everywhere (Open PageRank fallback) | **No** | No key configured |
| DataForSEO | **No** | Extension not installed |

**Tier: 0** (Common Crawl + verification crawler only). No DA/PA, spam score,
referring-domain counts, anchor text, or link-velocity data is obtainable —
those all require Moz, Bing, or DataForSEO, none of which are configured.
This is a hard data ceiling, not an oversight in the analysis.

## Common Crawl result

Source: Common Crawl Web Graph (confidence: 0.50, domain-level only)
Release: `cc-main-2026-jan-feb-mar` (Common Crawl web graphs are published
quarterly — see https://commoncrawl.org/web-graphs)

```
domain: aeorank.tech
in_crawl: false
in_rankings: false
pagerank: null
harmonic_centrality: null
```

**aeorank.tech does not appear in the Common Crawl host graph at all.** It
has no PageRank or harmonic-centrality value because Common Crawl's crawler
has not captured a page on the site being linked to from anywhere in its
sample. This is not a scoring miss — it means Common Crawl currently has
zero visibility into any inbound links to the domain.

## No known-backlinks file to verify

No candidate backlink list was provided for this run, so the verification
crawler (`verify_backlinks.py`) had nothing to check. If you have specific
URLs you believe link to aeorank.tech (a directory listing, a guest post, a
mention), supply them and I can verify each one is live, dofollow, and
pointing at the right target.

## Bottom line: INSUFFICIENT DATA for a numeric score — and that's expected

Per the tiering rules, at Tier 0 fewer than 4 of the 7 scoring factors
(referring domains, domain quality, anchor text, toxic ratio, link velocity,
follow/nofollow, geography) have any data source. **Zero of them do here** —
Common Crawl doesn't populate any of those factors directly, it only gives
a coarse presence/absence signal. So: **no Backlink Health Score is
reported.** A number here would be fabricated, not measured.

That said, "near-zero backlink profile" is exactly what should be expected
for a small startup site at this stage — this is not a red flag, it's a
baseline. The finding that matters isn't "the score is bad," it's "there is
effectively no inbound link graph yet to build authority on," which is a
normal, fixable starting position, not a technical problem with the site.

## Caveat on absence of evidence

Common Crawl only samples a fraction of the web and refreshes quarterly, so
a handful of real links (a directory listing added last week, a fresh
mention) could exist without showing up here yet. Free ways to spot-check
manually, outside this tool's scope: a `site:` search isn't useful for link
discovery, but a manual look at Google Search Console's "Links" report
(if GSC is verified for this property) or signing up for a free Moz account
(2,500 rows/month, takes 5 minutes) would immediately upgrade this to Tier 1
and give real DA/spam-score numbers. Recommended next step if backlink
tracking matters going forward:
`./extensions/dataforseo/install.sh` for Tier 3, or at minimum get a free
Moz API key (https://moz.com/products/api) for Tier 1.

## Link-acquisition angle worth pursuing now

AEOrank's own product proposition — tracking brand citations in Reddit
threads and AI answers — is itself the most realistic link-building lever
available, more so than generic outreach. Recommendations, roughly ordered
by effort-to-payoff for a pre-traction startup:

1. **Publish an original citation-frequency study using the product's own
   data** (e.g., "which SaaS brands get cited most in ChatGPT/Perplexity
   answers this quarter"). This is the single highest-leverage tactic: SEO
   and marketing blogs routinely link to cite a specific stat, and it
   doubles as a case study in the product's own category. The 16 existing
   blog posts (per `findings/content.md`) show there's already
   editorial capacity to do this.
2. **Free directory listings relevant to the AI-tools/SEO-tools category**:
   There's An AI For That, Futurepedia, AlternativeTo, SaaSHub, StartupStash,
   Product Hunt, BetaList, Indie Hackers "Products," G2/Capterra category
   pages. These are low-effort, typically dofollow or at least crawlable,
   and directly on-topic — a natural fit rather than spam.
3. **Founder/company profile pages that double as citations**: Crunchbase,
   Wellfound/AngelList, LinkedIn company page, BuiltWith. Notably these are
   the same class of platform the product itself tracks citations on —
   worth using as a talking point ("we practice what we track").
4. **Genuine participation in r/SEO, r/bigseo, r/marketing, r/juststart**:
   given the product's whole premise is Reddit-citation tracking, showing
   up there credibly (answering questions, not dropping links) is on-brand
   and is exactly the kind of behavior that earns citations rather than
   spammy backlinks.
5. **Podcast/newsletter guesting** in the SEO/AI-search niche — show notes
   links are a reliable, low-volume-but-relevant source for a young domain.

Before spending effort on outreach, fix the two items already flagged
elsewhere in this audit that would undercut any link that does land:
`findings/social.md` (no `og:image` — shared links render as bare text, so
earned mentions on Slack/X/LinkedIn get no preview card) and
`findings/on-page.md` (31 of 32 pages missing an H1).

## Recommendation for other audit angles

This report covers backlinks only. For on-page E-E-A-T and content
authority signals, see `/seo content <url>`. For crawlability/indexing
issues that affect whether new links even get discovered and followed
(robots.txt, sitemap, canonical health), see `/seo technical <url>` and
`findings/technical.md` in this audit.

---
*Sources: Common Crawl Web Graph (confidence: 0.50, domain-level,
quarterly release cc-main-2026-jan-feb-mar), backlinks_auth.py service
check (2026-09-26). Moz, Bing Webmaster, Keywords Everywhere, and
DataForSEO were all unavailable — no credentials configured on this
machine.*
