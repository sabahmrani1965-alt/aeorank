# Search Experience (SXO) Findings — Pass 2 — www.aeorank.tech

Re-analysed 2026-09-27 (pass 1: 2026-09-26). Method: SERP-backwards. 6 SERPs re-sampled
via WebSearch, 12 target URLs re-rendered with `render_page.py --mode always`, page types
re-classified against `references/page-type-taxonomy.md`.

**SXO Gap Score: 60/100 — up 20 from 40/100.**
(Separate from the SEO Health Score.)

| Dimension | Pass 1 | Pass 2 | Δ |
|---|---|---|---|
| Page Type | 7/15 | **11/15** | +4 |
| Content Depth | 3/15 | **8/15** | +5 |
| UX Signals | 8/15 | **12/15** | +4 |
| Schema | 9/15 | **11/15** | +2 |
| Media | 4/15 | **6/15** | +2 |
| Authority | 3/15 | **5/15** | +2 |
| Freshness | 6/10 | **7/10** | +1 |
| **Total** | **40/100** | **60/100** | **+20** |

Two CRITICAL page-type mismatches were eliminated outright. One new HIGH mismatch was
created. The commercial layer (5 service pages, 4 industry pages) is structurally
unchanged and is now the entire remaining Page Type and Depth deficit.

---

## 1. Verified changes (rendered production HTML, not repo state)

| Claim | Verified | Evidence |
|---|---|---|
| /pricing exists, public, in sitemap | YES | 431 w, H1 "Pay for the work, not the dashboard.", 1 HTML table, Lite $199 / Pro $299 / Max $449, 7-day trials, per-action credit rates ($10/$7/$5 per comment, $20/$15/$10 per post, $0.10 upvote), top-ups at $1/credit |
| Self-serve vs managed resolved | YES | H2 "Would you rather we ran it?" states plainly that plans are self-serve and managed runs $500 one-time to $3,000/mo |
| citation-building retitled | YES | Title "AI Citation Building Services", H1 "Secure the AI Citations Engines Actually Trust", meta leads with "not local NAP directory listings" |
| aeo-consulting retitled | YES | Title "Answer Engine Optimization Consulting", H1 "Strategic Answer Engine Optimization Consulting for In-House Teams" |
| Two new blog posts | YES | /blog/reddit-ai-visibility-guide 1,854 w live / 11 H2 / 8 lists / 1 table / 29 bold; /blog/best-ai-visibility-tools 1,212 w / 8 H2 / 1 table |
| Blog scannability | YES | Question-shaped H2s throughout ("How does it detect a mention?", "What gets you removed instead") |
| /industries index + footer links | YES | /industries live, ItemList schema, 4 H2s; footer now carries /industries and /pricing |
| 27 commercial→blog links | YES | "Read more on this" module present on every service and industry page |
| H1s deployed (pass-1 blocker) | YES | Commit `59eb69f` is live. Every one of 12 rendered URLs now has exactly 1 H1; pass 1 found zero outside the homepage |
| Breadcrumb trail visible | YES | "Home / AEO for SaaS Companies" renders on child pages |
| Sitemap | 36 URLs | /pricing and /industries both present |

Unchanged by the owner's stated choice, recorded without re-argument: +312% carries two
meanings (homepage traffic delta vs /industries "Average AI Citation Increase"); 5.5B and
1.2B monthly-visitor figures still sit 20 words apart in the same homepage block; the
200–400% figure is still in live FAQPage schema (see 4.1 — it has changed status); zero
case studies and zero named clients, with a frozen baseline study re-measuring 2026-11-26.

---

## 2. Re-assessed SERPs — are the new titles winnable?

### 2.1 "AI citation building services" — YES, winnable. Collision resolved.

Pass 1 found 9/9 local-SEO NAP results and rated this a CRITICAL entity collision.
Adding "AI" flipped the entity. Current top 9:

| Result | Type |
|---|---|
| provenroi.com/services/ai-citation-building | Service Page (AI citations) |
| verbatimdigital.com "AI Citation & Mention Building" | Service Page (AI citations) |
| marketdisruptorsagency.com "AI Citation Building for Local Business Visibility" | Service Page (AI + local hybrid) |
| adamsilvaconsulting.com "AI Authority Building — 90-Day Citation Program" | Service Page (AI citations) |
| aeoengine.ai "Citation Building Services: Complete Guide 2026" | Blog Post |
| aeoengine.ai "Best Services for Improving AI Citations 2026" | Comparison |
| brandmentions.link "Best AI Citation Building Services for 2026" | Comparison |
| brightlocal.com/citation-builder | Service Page (local NAP) |
| sourcely.net "Top 10 AI Tools for Citations" | Comparison (academic citation tools, off-intent) |

**Consensus: Service Page 4–5/9, Comparison 3/9, Blog 1/9. Dominant type = Service Page.
Target page type = Service Page. Severity: ALIGNED (depth gap).**

The disambiguation worked, and the SERP synthesis independently confirms the diagnosis
from pass 1: "Most pages ranking for this term sell local SEO citation work from 2018,
repackaged with an AI label." AEOrank is now in the right entity space with the right page
type. Two caveats: only the meta description carries the "not local NAP" disambiguator —
it is not in the H1 area or the visible body, so it disambiguates for Google but not for a
reader who lands from an ambiguous query; and 311 words will not beat a 90-day-program
page. Residual local drift exists (Market Disruptors is explicitly targeting local).

### 2.2 "answer engine optimization consulting" — YES, winnable. Query rescued.

Pass 1: "AEO consulting" returned LinkedIn, Instagram, UK Companies House, an IT firm, a
Florida structural engineer and the Wikipedia entry for Adaptive Execution Office —
1/9 relevant, rated CRITICAL/unwinnable. Spelling out the acronym removed every wrong
entity. Current top 9:

| Result | Type |
|---|---|
| elsner.com "Answer Engine Optimization Services Company" | Service Page |
| returnonnow.com "AEO Consulting: Win in AI Answer Engines" | Service Page |
| marceldigital.com "AEO Services" | Service Page |
| firstfigconsulting.com "AEO Services" | Service Page |
| pedowitzgroup.com "AEO Consulting" | Hybrid (blog-hosted service page) |
| linkedin.com/company/answer-engine-consulting | Navigational |
| neilpatel.com "AEO: Strategies for AI Search" | Blog Post |
| firstpagesage.com "Top AEO Companies of 2026" | Comparison |
| nogood.io "Best AEO Agencies in 2026" | Comparison |

**Consensus: Service Page 4–5/9 (plus 1 Hybrid), Comparison 2/9. Dominant type = Service
Page. Target page type = Service Page. Severity: ALIGNED (depth gap).**

This is the largest single win in the pass. The query went from 1/9 relevant to 5/9
direct-competitor service pages. It is now a normal competitive commercial SERP rather
than an unavailable term. The remaining obstacle is no longer targeting, it is substance:
every ranking competitor is an established agency with named clients, and two of the nine
slots are third-party rankings AEOrank does not appear in. 335 words with a 45-minute call
CTA and no case study is the thinnest entrant in that set.

### 2.3 "Reddit marketing for AI search visibility" — gap closed, type ALIGNED.

SERP unchanged: Search Engine Land, AirOps, Amsive, iQuanti, Semrush ×3, Local Ranking
Coach, one G2 listing. **8/9 Blog Post / practitioner guide, zero vendor pages.**
AEOrank now has /blog/reddit-ai-visibility-guide at 1,854 rendered words, 11 H2s, 8 lists,
a table and 6 external links. Type ALIGNED, structure competitive, depth at the lower
bound of the set. The pass-1 finding "the single most differentiated claim in the business
has an open SERP and AEOrank is not competing in it" is resolved. It is a strong post, not
yet a pillar — /blog/why-chatgpt-cites-reddit-threads,
/blog/reply-to-reddit-without-getting-removed and /blog/how-we-verify-reddit-threads are
linked from it but the cluster has no hub page and no shared canonical entry point.

### 2.4 "best AI visibility tools 2026" — page shipped, format MISMATCHED. NEW HIGH.

This is the one fix that half-landed. Current top 9:

Frase "10 Best AI Visibility Tools in 2026 (Compared + Free Checker)" · Zapier "The 9 best
AI visibility tools in 2026" · Evertune "The 10 Best AI Visibility Tools for 2026" ·
Traffic Think Tank "5 Best GEO Tools" · GrowthOS "9 Best AI Visibility Tools and
Platforms, Tested and Ranked" · aiclicks "19 Best AI Search Visibility Optimization Tools"
· Contently "best llm visibility tools 2026" · Seal Global "Best AI Search Visibility
Tools 2026" · Ahrefs.

**Consensus: Comparison Page 9/9 = 100%. Every result is a numbered, ranked listicle.
Target page type: Blog Post (evaluation framework). Severity: HIGH.**

/blog/best-ai-visibility-tools is titled "AI Visibility Tools: How to Actually Evaluate
Them" and states in the body: "No ranking, no affiliate links, and the ordering is
alphabetical." It lists 5 vendors (AthenaHQ, CrowdReply, Peec AI, Profound, Scrunch) in
their own words. The SERP wants 9–19 tools, ranked, with a verdict. The page deliberately
declines to provide the one artefact the SERP is 100% consensus on, and omits most of the
tools the SERP's own synthesis names as market leaders — Frase, Semrush, Evertune,
Otterly.ai, ZipTie, SE Ranking, Writesonic, Positive Surfer, Athena. There is no ItemList
or Table schema. The taxonomy classifies this exactly: "Blog Post without structured
comparison = HIGH".

The editorial instinct is defensible and it is the best trust asset on the site (see 5).
The fix does not require abandoning it: keep the seven evaluation questions as the
differentiator, but expand the table to 12+ tools, add a scored column per question, add
"best for" segmentation, and add ItemList schema. A ranked table with disclosed criteria
is not an affiliate listicle.

### 2.5 "answer engine optimization for B2B SaaS" — UNCHANGED CRITICAL.

Byte-for-byte the same 9 results as pass 1: Elsner, Bluetext, madx.digital/learn,
Sproutworth "The B2B CEO's Guide", PartnerStack "The Ultimate 2026 Guide", Siteimprove,
Unreal Digital, semai.ai, Storylane. **9/9 Blog Post / long-form guide. Zero vendor
landing pages.** /industries/saas is still a 288-word Landing Page: hero, three unsourced
stats, "Challenges we solve", "How we help", CTA. Severity CRITICAL, unmoved. See 4.

### 2.6 "AI visibility audit" — HIGH downgraded to MEDIUM (SERP moved, page did not).

The SERP has commercialised since pass 1. Now: 2X.marketing (Service), White Label IQ
(Service), WebFX audit launch (Service/PR), BHMarketer (PR) against Yotpo "Step-by-Step",
PartnerStack "in 30 Minutes", Cision "You Can Do Right Now", SEJ "15 Questions Every CMO
Should Ask". **Roughly 4/9 Service Page, 4/9 DIY guide.** Target type Service Page is now
within consensus, so severity falls to MEDIUM — but by SERP drift, not by improvement.
The page is 364 words with **zero input fields**; no ungated checker was built. The
Tool/Interactive secondary intent that pass 1 identified is still unclaimed, and it is now
claimed by Frase, which ranks #1 for 2.4 with "Compared + Free Checker" in its title.

### SERP consensus summary

| Keyword | Target | Dominant SERP type | Consensus | Pass 1 | Pass 2 |
|---|---|---|---|---|---|
| AI citation building services | /services/citation-building | Service Page | 5/9 | CRITICAL | **ALIGNED** |
| answer engine optimization consulting | /services/aeo-consulting | Service Page | 5/9 | CRITICAL | **ALIGNED** |
| Reddit marketing for AI search visibility | /blog/reddit-ai-visibility-guide | Blog Post | 8/9 | HIGH (no page) | **ALIGNED** |
| best AI visibility tools 2026 | /blog/best-ai-visibility-tools | Comparison | 9/9 | HIGH (no page) | **HIGH (format)** |
| AI visibility audit | /services/ai-visibility-audit | Split Service/guide | 4/9 | HIGH | MEDIUM |
| answer engine optimization for B2B SaaS | /industries/saas | Blog Post guide | 9/9 | CRITICAL | **CRITICAL** |
| entity optimization for AI search | /services/entity-optimization | Blog Post guide | 8/9 (p1) | CRITICAL | CRITICAL |
| best AEO agency for SaaS 2026 | (none) | Comparison | 9/9 (p1) | HIGH | HIGH |

---

## 3. Page-type classification, current state

| Page | Words (rendered) | H1 | H2 | Type | Schema |
|---|---|---|---|---|---|
| / | 1,943 | 1 | 9 | Landing Page | Organization, WebSite, FAQPage |
| /pricing | 431 | 1 | 2 | Landing Page (pricing) | Organization, WebSite, BreadcrumbList — **no Offer** |
| /services | 437 | 1 | 1 | Service Page (hub) | Organization, WebSite only |
| /services/citation-building | 311 | 1 | 5 | Service Page | +BreadcrumbList, Service, FAQPage |
| /services/aeo-consulting | 335 | 1 | 5 | Service Page | +BreadcrumbList, Service, FAQPage |
| /services/ai-visibility-audit | 364 | 1 | 5 | Service Page | +BreadcrumbList, Service, FAQPage |
| /industries | 192 | 1 | 4 | Landing Page (index) | +BreadcrumbList, ItemList |
| /industries/saas | 288 | 1 | 4 | Landing Page | +BreadcrumbList, **Service (new)** |
| /about | 256 | 1 | **0** | Landing Page (thin) | Organization, WebSite only |
| /blog/reddit-ai-visibility-guide | 1,854 | 1 | 11 | Blog Post | BlogPosting, BreadcrumbList |
| /blog/best-ai-visibility-tools | 1,212 | 1 | 8 | Blog Post (should be Comparison) | BlogPosting, BreadcrumbList — **no ItemList** |

The pass-1 live-vs-repo H1 discrepancy is resolved. /about is the only page with an H1 and
no H2 at all.

---

## 4. Sharpest remaining mismatch

### 4.1 /industries/* — four 288-word landing pages in a 100%-guide SERP (CRITICAL)

This was the #1 finding in pass 1 and it is the #1 finding now, but the risk has gone up,
not down. The orphan fix made it worse before it makes it better: /industries is live, all
four children are linked from the index and the footer, each now carries Service schema
and 3 outbound blog links, and all five are in the sitemap. Google will now reliably crawl
and evaluate five pages that are the wrong page type for their SERP, where before it
largely ignored four of them. Crawl budget and internal PageRank are being routed into a
category error.

The gap is not marginal. "Answer engine optimization for B2B SaaS" returns nine long-form
guides and zero vendor landing pages — 100% consensus, identical to pass 1. /industries/saas
answers with 288 words, a hero, four benefit cards, an unsourced +312%/+180%/4–6mo stat
row, and a "Let's build your AEO advantage" CTA. Multiplied across /saas, /startups,
/software, /tech-it, this one template is now the largest single drag on both Page Type and
Content Depth, and it accounts for most of the 7 points still missing from Page Type and
most of the 7 still missing from Depth.

The proof that the fix is achievable is on the same domain: the site just shipped an
1,854-word, 11-H2 guide into an 8/9-guide SERP and got the type right. The same treatment
applied to /industries/saas — "Answer Engine Optimization for B2B SaaS: The 2026 Playbook",
2,000 words, service CTA as mid-scroll and end-scroll modules, Hybrid type — converts the
highest-consensus mismatch on the site. Do one, measure, then template it.

### 4.2 The new mismatch, and a self-contradiction worth fixing for free

**New:** /blog/best-ai-visibility-tools is a framework post in a 9/9 ranked-listicle SERP
(2.4). Fixable in an afternoon: expand to 12+ tools, add a scored column and "best for"
verdicts, add ItemList schema.

**Self-contradiction:** /blog/best-ai-visibility-tools now states, as a buyer-protection
warning, "does the contract promise a specific outcome? Nobody controls what a model says.
A guaranteed percentage increase in citations is not a service level, it is a claim about
someone else's system." Meanwhile /services/citation-building ships this in live FAQPage
schema: `"Most clients see 200–400% increase in AI citation frequency within 6 months."`
The homepage FAQ schema gets this right ("No, nobody can guarantee what an LLM will say").
So the site holds the correct position in two places and the incorrect one in a third — and
the incorrect one is machine-readable, rich-result eligible, and now sits on the page whose
SERP just became winnable. "Most clients" is also unsupportable against zero named clients.
Deleting one FAQ answer costs nothing, removes the strongest disqualifier a procurement
reviewer could find, and makes the site internally consistent. Noting the owner's decision
to leave the number in place, this is the single instance where the cost of not fixing has
changed since pass 1, because the page it sits on changed status from unwinnable to winnable.

---

## 5. User stories (re-derived from pass-2 SERP signals)

**S1 — Awareness. As a B2B SaaS founder who has heard of AEO,** I want to know whether this
produces pipeline or is repackaged SEO, **because** I have been burned by an agency,
**but I'm blocked by** a trust gap: no vendor shows a number.
*Signals: 2/9 slots on "answer engine optimization consulting" are third-party agency
rankings (First Page Sage, NoGood) that rank vendors by published outcomes; the B2B SaaS
guide SERP leads with "51% of B2B software buyers now begin research with an AI chatbot",
i.e. the market is quantified but the vendors are not.*
Status: partially served. /pricing answers cost; nothing answers proof.

**S2 — Consideration. As a marketer comparing AI-visibility tools,** I want a ranked
shortlist with a verdict, **because** I have to bring three names to a meeting, **but I'm
blocked by** comparison fatigue — every list is written by a vendor.
*Signals: 9/9 ranked listicles for "best AI visibility tools 2026", titles carrying
explicit counts and "Tested and Ranked"; Frase's #1 result bundles "Compared + Free
Checker" in the title.*
Status: mismatched. AEOrank's page refuses to rank, which is honest and, for this specific
story, unhelpful.

**S3 — Consideration. As a brand manager whose CEO banned astroturfing,** I want proof the
Reddit mechanism will not get us flamed or banned, **because** a mod takedown is worse than
invisibility, **but I'm blocked by** a risk/compliance gap.
*Signals: the Reddit SERP repeats the warning "communities are quick to spot marketing
language and will reject brands that show up the wrong way" (AirOps, Amsive) alongside "82%
of users trust Reddit recommendations more than any other platform".*
Status: **now well served.** /blog/reddit-ai-visibility-guide has dedicated H2s "What
actually earns a citation", "What gets you removed instead", "What should you not
outsource?". Biggest persona movement in the pass.

**S4 — Awareness. As a marketer told to "check our AI visibility" by Friday,** I want to
run the check myself today, **because** I have no budget line, **but I'm blocked by** not
knowing the method and having no tool.
*Signals: "AI Visibility Audit: Step-by-Step" (Yotpo), "...in 30 Minutes" (PartnerStack),
"...You Can Do Right Now" (Cision), "15 Questions Every CMO Should Ask" (SEJ); Frase now
ranks #1 on the tools query with a free checker in the title.*
Status: half served. The method now exists (tools post, step 2: "Run them yourself,
manually, once"). The tool still does not — /services/ai-visibility-audit has zero input
fields.

**S5 — Decision. As a VP Marketing choosing between doing it and buying it,** I want to
know what each option costs before I book a call, **because** I cannot get approval for an
unpriced vendor, **but I'm blocked by** price opacity.
*Signals: agency-SERP price anchoring of "$4,000 to $25,000+ per month"; "AEO consulting"
now returning four agency service pages that all gate price behind a form.*
Status: **resolved, and now a differentiator.** /pricing publishes $199/$299/$449 with a
per-action rate table and $500–$3,000/mo for managed, against a SERP where nobody else
publishes anything. This was pass 1's "unresolved identity" finding.

---

## 6. Persona scores — pass 2 with delta

| Persona | Stage | Relevance | Clarity | Trust | Action | Total | Δ | Rating |
|---|---|---|---|---|---|---|---|---|
| DIY Self-Auditor | Awareness | 14 (+2) | 16 (+3) | 12 (+4) | 12 (+2) | **54** | +11 | Needs Work |
| In-house SEO / Technical Evaluator | Consideration | 16 (+2) | 16 (+4) | 12 (+3) | 15 (+2) | **59** | +11 | Needs Work |
| Agency Shortlister (VP Marketing) | Decision | 17 (+1) | 18 (+4) | 8 (+3) | 17 (+1) | **60** | +9 | Good |
| Budget-Conscious SMB / Startup | Consideration | 12 (+1) | 22 (+5) | 11 (+3) | 16 (+4) | **61** | +13 | Good |
| Reddit-Risk-Averse Brand Manager | Consideration | 20 (+5) | 18 (+7) | 15 (+5) | 14 (+2) | **67** | +19 | Good |
| **Skeptical SaaS Founder** | Awareness→Consideration | 20 (+1) | 21 (+6) | 11 (+5) | 17 (+3) | **69** | **+15** | Good |
| Average | | 16.5 | 18.5 | 11.5 | 15.2 | **61.7** | +13.0 | |

Five of six personas crossed from Needs Work into Good. Nobody is in Critical Mismatch.

### Requested focus: Skeptical SaaS Founder, 54 → 69 (+15)

**Relevance 19 → 20.** The two new posts speak to him: one explains the mechanism and its
failure modes, the other tells him how to audit any vendor in the category including
AEOrank. Still capped because there is no page that answers his literal question — no
"does this work, here is our number" URL exists on 36 URLs.

**Clarity 15 → 21 (+6, the largest dimension gain in the audit).** Pass 1's single biggest
deduction was "two business models, one site, no chooser, no pricing page in the sitemap,
credit pricing appears nowhere as a number." All four clauses are now false. /pricing names
three plans with prices, quantifies the credits ($10/$7/$5 per comment placed, $20/$15/$10
per post, $0.10 per upvote, top-ups $1/credit), and the H2 "Would you rather we ran it?"
draws the line explicitly: plans are self-serve, managed is $500 one-time to $3,000/mo.
He can now answer "what am I buying" in about fifteen seconds.
Not 23+ because **/pricing is not in the primary navigation.** The header still renders
only `Log in`, `Book a Call`, `Get Started →` — the same two undifferentiated CTAs pass 1
flagged, now with a pricing page that resolves them sitting only in the footer. Adding one
`Pricing` link to the header is the cheapest remaining point on the board. Service pages
also render a reduced nav (`Home | Services`) that drops the global nav entirely, so a
visitor landing on a service page from search has no path to pricing except the footer.

**Trust 6 → 11 (+5). Still the failure dimension, but it moved for a real reason.**
The credit comes almost entirely from /blog/best-ai-visibility-tools, which does four
things this persona is specifically scanning for: it names five direct competitors and
links them, quotes them in their own words rather than strawmanning, discloses its own
position ("AEOrank sits in the same category... Read them knowing who wrote them"), and
tells him to distrust the vendor's own dashboard ("Run your own queries manually before you
believe any dashboard, including ours"). It also warns him off guaranteed-percentage
contracts. That is the behaviour of someone not selling, and it is the first thing on the
site that reads as evidence rather than assertion. Blog posts now carry 6–7 external links
where pass 1 found zero.
Still holding it at 11: zero named clients, zero logos, zero testimonials; /about is 256
words with an H1, no H2, no founder bio and no credentials; the hero dashboard is still a
labelled mockup and the Reddit cards still invented threads; +312% and +180% still appear
unsourced on four industry pages; +312% still carries two different meanings on two pages;
5.5B and 1.2B sit in the same homepage paragraph; and the site contradicts its own
no-guarantee stance in live schema (4.2). Noting the owner's position that there is
genuinely nothing to publish yet — the frozen baseline (76 checks, 68 days, 0 mentions)
is honest and is the right thing to have done, but it scores 0 today because it is not
published. Publishing it as-is, zeros included, with the 2026-11-26 re-measurement date
stated, would be worth more to this persona than any client logo, because his question is
"is this real?" and a vendor showing its own flat result is the answer.

**Action 14 → 17.** He now has a priced, self-serve, 7-day-trial entry point with a stated
cancel window, instead of only "Get Started →" into a signup wall of unknown cost. Still
short of 21+: card required for the trial, no ungated scan, no sample report download, and
the /industries/saas promise of "an instant AI-visibility scan tailored to your site" still
sits behind email+password — the promised proof is still behind the wall it should be
proving.

### Weakest persona now: DIY Self-Auditor, 54/100

Highest-volume awareness SERP, and the only persona still clearly in Needs Work. He gained
the method (the tools post's four-step, two-week evaluation, with "run them yourself,
manually" as step two) but not the instrument. /services/ai-visibility-audit is 364 words
with zero input fields, and the #1 result on the adjacent tools SERP now advertises a free
checker in its title. This is the same recommendation as pass 1, unactioned, and it has got
more urgent because a competitor took the position.

### Systemic issues

- **Trust remains the lowest dimension for all six personas** (avg 11.5/25, up from 7.7).
  It is still a missing-asset problem, not a copy problem. The nature of the gap has
  changed though: pass 1 had no trust assets at all; pass 2 has one genuinely good one
  (the competitor-naming tools post) and one active liability (the 200–400% schema).
- **Clarity is no longer the cap** (avg 18.5/25, up from 13.7). /pricing fixed the
  structural problem. What remains is navigational: pricing is not in the header.
- **Awareness/decision imbalance is partly corrected.** Pass 1: the whole site was built
  for decision stage while 7 of 9 SERPs were awareness. Two 1,200–1,850-word awareness
  assets now exist, and 27 commercial→blog links route between the stages. But 9 of the
  10 commercial pages are still 192–437 words, so the awareness layer is 2 pages deep
  against 8 guide-dominated SERPs.
- **Media is still the weakest absolute score after Authority** (6/15). Three HTML tables
  now exist across 36 URLs; video, real product screenshots with descriptive alt text,
  annotated dashboard walkthroughs and a downloadable sample report remain at zero.

---

## 7. Priority actions (weakest persona first, then systemic)

1. **Build the ungated checker at /services/ai-visibility-audit** (DIY Self-Auditor 54 —
   weakest persona, highest-volume awareness SERP, competitor just claimed the position).
   Domain input above the fold, instant partial result (3 engines × 5 queries), full
   100-query report gated. Publish the method as H2s. Converts Service Page → Tool and
   simultaneously gives the Founder persona the evidence he came for. Third pass in a row
   this is #1.
2. **Delete or rewrite the 200–400% FAQ answer on /services/citation-building** (4.2).
   Zero cost, removes a procurement disqualifier from a page whose SERP just became
   winnable, and ends the contradiction with the site's own new blog post.
3. **Add `Pricing` to the primary header nav**, and restore the global nav on service
   pages. One link. Recovers Clarity across all six personas.
4. **Rebuild /industries/saas as a 2,000-word Hybrid guide** (4.1 — sharpest remaining
   mismatch, 9/9 consensus). Do one, measure, then template to /startups, /software,
   /tech-it.
5. **Turn /blog/best-ai-visibility-tools into a ranked comparison** — 12+ tools including
   Frase, Semrush, Evertune, Otterly, ZipTie; a scored column per evaluation question;
   "best for" verdicts; ItemList schema. Keep the seven questions as the differentiator.
6. **Add Offer / SoftwareApplication schema to /pricing.** Three named prices, a rate table
   and trial terms are on the page in HTML and none of it is machine-readable. Highest-value
   schema gap on the site now that prices exist. → `/seo schema`
7. **Publish the frozen baseline study as-is, zeros included**, with the 2026-11-26
   re-measurement date stated. Converts the honest absence of results into the Trust asset
   the Founder and Shortlister personas are both blocked on.
8. **Build the Reddit cluster hub.** The 1,854-word guide is the pillar; give it a hub
   structure with the three existing Reddit posts as named children.
9. **Add a comparison table and verdict to /blog/profound-vs-peec-vs-aeorank and
   /blog/crowdreply-vs-aeorank** (still no table, still no verdict — unchanged from pass 1),
   and pitch for inclusion in the third-party AEO-agency rankings that hold 2/9 slots on
   the newly winnable consulting SERP.
10. **Add Service schema to the remaining three industry pages** (only /saas has it) and
    Service/ItemList to /services.

---

## 8. Limitations

- SERP data comes from WebSearch result sets: titles, URLs and a synthesised summary. No
  rendered SERP, so ad blocks, PAA boxes, featured-snippet formats, AI Overview text and
  related-search modules were not directly observed. Persona and story signals above are
  drawn from result titles and synthesis text. Page-type confidence high; SERP-feature
  confidence moderate. Same limitation as pass 1, so the pass-over-pass comparison is
  consistent.
- Competitor word counts are still estimated from titles and type, not fetched.
- No Search Console data: it is not possible to say whether the retitled pages have begun
  to rank, only whether the queries are now winnable in principle. The retitles are recent
  enough that a re-crawl may not have happened; treat 2.1 and 2.2 as "the SERP is now
  enterable", not "the page is now ranking".
- /industries/startups, /software, /tech-it and /services/entity-optimization were not
  re-rendered this pass; they are assumed to match the /industries/saas and
  /services/citation-building templates, which were verified structurally identical in
  pass 1.
- 12 of 21 blog posts were not fetched; the "lists, tables, bold and question-shaped
  headings added across the blog" claim was verified on the 2 new posts only.
- `parse_html.py` timed out on /services/ai-visibility-audit, /services/entity-optimization
  and /about; those were measured from the Playwright render instead, so their word counts
  are main-content DOM counts and may differ by a few percent from the parser's method.
- htmldate still reports the homepage publication date as 2026-01-01.
- Core Web Vitals, mobile rendering and accessibility out of scope — see
  `findings/technical.md` and `findings/performance-pass2.md`.

## 9. Cross-skill referrals

- Offer/SoftwareApplication on /pricing, ItemList on the tools post and both comparison
  posts, Service on 3 industry pages, ContactPoint on /contact → `/seo schema`
- The 200–400% schema claim, unsourced +312%/+180%, the 5.5B/1.2B contradiction, /about
  with no bio or credentials → `/seo content` (E-E-A-T)
- 192–437-word commercial pages across 10 URLs → `/seo page`
- No local intent in any of the 6 SERPs re-sampled; `/seo local` not applicable

Generate a PDF report? Use `/seo google report`.
