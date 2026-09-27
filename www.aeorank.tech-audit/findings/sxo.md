# Search Experience (SXO) Findings — www.aeorank.tech

Analysed 2026-09-26. Method: SERP-backwards. 9 commercial/informational SERPs sampled
via WebSearch, every target page fetched with the SPA-aware renderer
(`render_page.py --mode always`), page types classified against
`references/page-type-taxonomy.md`.

**SXO Gap Score: 40/100** (separate from the SEO Health Score.)

---

## 1. Primary finding: the money pages are the wrong page TYPE for their SERPs

The service and industry pages are not simply thin. They are a *category error*.
Seven of the nine SERPs sampled are dominated by long-form practitioner guides, not by
vendor pages. AEOrank has shipped 300–370-word sales pages into SERPs where Google is
ranking 1,500–4,000-word teaching content.

### SERP consensus table

| Target keyword | Target page | Dominant SERP type | Consensus | Target page type | Severity |
|---|---|---|---|---|---|
| answer engine optimization for B2B SaaS | /industries/saas (265 w) | Blog Post / long-form guide | **9/9 = 100%** | Landing Page | **CRITICAL** |
| entity optimization for AI search | /services/entity-optimization (331 w) | Blog Post / practitioner guide | **8/9 = 89%** | Service Page | **CRITICAL** |
| citation building services | /services/citation-building (302 w) | Service Page — but *local SEO / NAP* | **9/9 = 100% local** | Service Page (AI citations) | **CRITICAL (entity collision)** |
| AEO consulting | /services/aeo-consulting (318 w) | Navigational — owned by unrelated firms named "AEO Consulting" | 1/9 relevant | Service Page | **CRITICAL (unwinnable query)** |
| AI visibility audit | /services/ai-visibility-audit (309 w) | Blog Post / DIY how-to ("in 30 minutes", "you can do right now") | 5/9 = 56% | Service Page | **HIGH** |
| best AEO agency for SaaS 2026 | *(no page)* | Third-party Comparison listicle | **9/9 = 100%** | — | **HIGH (gap)** |
| how to get your brand cited by ChatGPT | /blog/how-to-get-cited-by-chatgpt (1,255 w) | Blog Post playbook | 9/9 = 100% | Blog Post | ALIGNED (depth gap) |
| Reddit marketing for AI search visibility | *(no page)* | Blog Post / guide | 8/9 = 89% | — | **HIGH (gap on own mechanism)** |
| AEO services / AEO agency | /services (460 w) | Service Page | 6/9 = 67% | Service Page | ALIGNED (depth gap) |

### The four sharpest mismatches

**1.1 — /services/citation-building: total semantic collision (CRITICAL).**
Every one of the 9 results for "citation building services" is local-SEO NAP directory
submission (BrightLocal Citation Builder, citationbuildingservice.com, "13 Local Citation
Building Services You Can Trust", "9 Best Local Citation Building Service Options").
Google's entire entity model for this phrase is *Name-Address-Phone consistency for local
businesses*. AEOrank means "earned mentions AI engines pull from". The page type is right;
the term is somebody else's. This page cannot rank as titled, and if it ever did it would
attract plumbers, not Series-B SaaS. Fix: retitle and re-target to
"AI citation building" / "LLM citation sources" / "get cited by AI engines", and add a
one-line disambiguator in the H1 area ("Not local directory citations — the publications
AI engines actually pull from").

**1.2 — /industries/* : 265-word landing pages in a 100% guide SERP (CRITICAL).**
"answer engine optimization for B2B SaaS" returns nine guides and zero vendor pages
(Elsner guide, Bluetext, GrackerAI, madx.digital/learn, Sproutworth "The B2B CEO's Guide",
PartnerStack "The Ultimate 2026 Guide", Unreal Digital, semai.ai, Storylane). The
/industries/saas page opens with a hero, three unsourced stats, four benefit cards and a
CTA — the exact structure Google is *not* ranking. All four industry pages share this
template, so the error is multiplied by four. This is the taxonomy's textbook
"Landing Page targeting how-to keyword = CRITICAL".

**1.3 — /services/aeo-consulting: the query is navigational for other companies (CRITICAL,
and a targeting error rather than a page error).**
"AEO consulting" returns a LinkedIn company page, an Instagram account, a UK Companies
House record, aeoconsulting.co.uk (IT consulting), aeoconsulting.us (structural engineering
in South Florida), and the Wikipedia entry for *Adaptive Execution Office*. "AEO" also
resolves to Authorised Economic Operator in customs contexts — Wikipedia's "AEO"
disambiguation page ranks for "AEO services" too. One result in nine is answer-engine
consulting. No amount of on-page work wins this. Re-target to
"answer engine optimization consulting" / "AEO consultant for SaaS" and treat the bare
"AEO consulting" as unavailable.

**1.4 — /services/ai-visibility-audit: sells what the SERP wants to give away (HIGH).**
The SERP intent is DIY: Yotpo "AI Visibility Audit: Step-by-Step", PartnerStack "How to
Audit Your Brand's AI Visibility in 30 Minutes", Cision "The 5-Step AI Visibility Audit
You Can Do Right Now", SEJ "15 Questions Every CMO Should Ask". Searchers want a method
and a tool. AEOrank answers with a 309-word page, a $500 price on /services, and a
"Book a Free Strategy Call" button. The taxonomy's Tool/Interactive type is the real
secondary intent here, and AEOrank *already owns the asset* — the "instant AI-visibility
scan" promised on /industries/saas — but it sits behind email+password signup. An ungated
scan-your-domain input above the fold plus the published 100-query methodology would flip
this page from mismatch to category winner.

### 1.5 — The biggest gap is AEOrank's own mechanism
"Reddit marketing for AI search visibility" returns Search Engine Land, AirOps, Amsive,
iQuanti, Semrush (three entries) and Local Ranking Coach — 8 of 9 informational, zero
vendor pages, and **no AEOrank page at all**. The single most differentiated claim in the
business (Reddit as the AI-citation lever) has an entirely open, entirely informational
SERP and AEOrank is not competing in it. `/blog/why-chatgpt-cites-reddit-threads`
(1,101 words) is the seed, but it is not built or linked as the pillar.

Likewise "best AEO agency for B2B SaaS" is 9/9 third-party listicles (Omniscient Digital,
Optimist, Discovered Labs, First Page Sage, Passionfruit, Derivatex...). Two plays exist
and AEOrank runs neither: publish the multi-vendor listicle, and get placed in the
existing ones. The comparison posts on-site are self-named ("crowdreply-vs-aeorank",
"profound-vs-peec-vs-aeorank"), which only captures branded-comparison demand AEOrank does
not yet have.

---

## 2. Page-type classification of the target site

| Page | Live word count (excl. nav/footer) | Classified type | Notes |
|---|---|---|---|
| / | 1,974 | Landing Page (SaaS product) | Organization + FAQPage schema; only page on the site with an H1 |
| /services | 460 | Service Page (hub) | Best pricing transparency on the site; no schema |
| /services/aeo-management | 339 | Service Page | Service + FAQPage + BreadcrumbList |
| /services/aeo-consulting | 318 | Service Page | same template |
| /services/ai-visibility-audit | 309 | Service Page | same template |
| /services/citation-building | 302 | Service Page | same template |
| /services/entity-optimization | 331 | Service Page | same template |
| /industries/saas | 265 | Landing Page | BreadcrumbList only — no Service schema |
| /industries/startups | 277 | Landing Page | BreadcrumbList only |
| /about | 229 | Landing Page (thin) | no schema, no team, no credentials |
| /contact | 89 | Landing Page (thin) | no LocalBusiness/ContactPoint schema |
| /blog/profound-vs-peec-vs-aeorank | 816 | Blog Post | classified Comparison by title, **has no comparison table and no verdict** → taxonomy "Blog Post without structured comparison = HIGH" |

**Live-vs-repo discrepancy:** commit `59eb69f` ("Give every page an h1 and a social preview
card") adds `<h1>` to /services, /about, /contact, /industries/[slug], /services/[slug] and
/blog/*. The rendered production HTML still has **zero `<h1>` on every page except the
homepage** — the section titles render as `<h2>`. The fix is committed but not deployed.
Deploy before re-measuring; all heading findings below assume the live state.

Second structural issue visible in the render: blog posts carry only **2 `<h2>` elements
across 1,000–1,255 words**. For a vendor selling answer-engine extraction, the flat
heading structure is both an SXO problem (no scannable answer blocks) and a credibility
problem.

---

## 3. User stories derived from SERP signals

**S1 — Awareness. As a B2B SaaS founder who has heard of AEO,** I want to find out whether
AI-visibility work produces real pipeline or is repackaged SEO, **because** I have been
burned by an agency before, **but I'm blocked by** a trust gap: every vendor makes the same
claim and none show numbers.
*Signals: Omniscient Digital's ranking page states outright that "most SEO agencies added
answer engine optimization to their services, and most of them can't show you what AEO
results actually look like"; all nine "best AEO agency" results rank vendors by whether
they publish case studies with pipeline metrics.*

**S2 — Awareness. As a marketer told by my CMO to "check our AI visibility",** I want to
run the check myself today, **because** I need a slide by Friday and have no budget line,
**but I'm blocked by** not knowing the method.
*Signals: "AI Visibility Audit: Step-by-Step" (Yotpo), "…in 30 Minutes" (PartnerStack),
"…You Can Do Right Now" (Cision), "15 Questions Every CMO Should Ask" (SEJ).*

**S3 — Consideration. As an in-house SEO lead,** I want to understand what entity
optimization concretely involves before I ask for budget, **because** I have to defend the
spend technically, **but I'm blocked by** technical confusion — vendors give benefits, not
mechanics.
*Signals: "Entity Optimization for GEO: The 2026 Practitioner Guide" (Frase), "7 Moves That
Stick", SEJ "Ask An SEO: How Can You Implement Entity Optimization Without Relying On
Schema Markup?" — the SERP is 8/9 method content.*

**S4 — Consideration. As a brand manager whose CEO said "no astroturfing on Reddit",** I
want proof the Reddit mechanism will not get us banned or flamed, **because** a mod
takedown would be worse than invisibility, **but I'm blocked by** a risk/compliance gap on
the conversion path.
*Signals: the Reddit SERP repeatedly warns "communities are quick to spot marketing
language and will reject brands that show up the wrong way" (AirOps/Amsive) while also
noting "82% of users trust Reddit recommendations more than any other platform".*

**S5 — Decision. As a VP Marketing building a three-vendor shortlist,** I want a side-by-side
of AEO providers with pricing and proof, **because** procurement requires it, **but I'm
blocked by** comparison fatigue and the fact that every comparison is written by one of the
vendors.
*Signals: 9/9 results for "best AEO agency for SaaS companies 2026" are third-party
listicles; "AEO services" surfaces "9 Best AEO Services for Small Businesses" and price
anchoring of "$4,000 to $25,000+ per month" appears in the agency SERP synthesis.*

---

## 4. Gap analysis — SXO Gap Score 40/100

| Dimension | Score | Evidence |
|---|---|---|
| Page Type | 7/15 | /services and /services/aeo-management align with a 67%-Service-Page SERP. /industries/* (4 pages), /services/entity-optimization and /services/ai-visibility-audit sit in guide-dominated SERPs. /services/citation-building and /services/aeo-consulting target terms owned by other meanings/entities. |
| Content Depth | 3/15 | 265–460 words against 1,500–4,000-word ranking pages. Blog posts 816–1,255 words with only 2 H2s each. /about 229 w, /contact 89 w. No page on the site is long enough to rank for any informational term in these SERPs. |
| UX Signals | 8/15 | Fast, clean, consistent global nav and CTA placement; /services "how to choose" section is genuinely good buyer guidance. Against that: no pricing page for the SaaS product (usage-based credits with no numbers anywhere), no H1 live, no visible breadcrumb trail, and two unexplained primary CTAs on every page. |
| Schema | 9/15 | Good: Organization + FAQPage (home), Service + FAQPage + BreadcrumbList (5 service pages), BlogPosting with named Person author + worksFor + datePublished/dateModified (blog). Missing: SoftwareApplication/Product + Offer for the self-serve product, AggregateRating/Review anywhere, Service on the 4 industry pages (BreadcrumbList only), ItemList/Table on comparison posts, ContactPoint on /contact, no schema at all on /services, /about, /contact, /blog index. |
| Media | 4/15 | 4 images per page, mostly icons/emoji; 6 inline SVGs on home; zero video, zero tables sitewide, zero product screenshots with descriptive alt text, no sample audit report, no annotated dashboard walkthrough. Above-fold dashboard is a CSS mockup labelled "illustrative data, not a live customer's real score". |
| Authority | 3/15 | Zero named clients, zero logos, zero testimonials, zero case studies. Sole example is AEOrank's own property (SaaSOffers). "+312% Average AI Citation Increase" and "+180% AI-Sourced Pipeline Growth" on /industries/saas carry no source, sample size or date. /about (229 w) has no team, no bios, no credentials. Blog posts cite no external sources. Not present in any third-party "best AEO agency" listicle. |
| Freshness | 6/10 | Blog posts carry visible bylines and dates (latest 2026-08-27) and correct datePublished/dateModified. htmldate reads the homepage as 2026-01-01. Service and industry pages carry no date, no "last updated", and no dateModified — in a field that changes monthly, undated vendor pages read as stale. |

---

## 5. Persona scores

| Persona | Journey stage | Relevance | Clarity | Trust | Action | Total | Rating |
|---|---|---|---|---|---|---|---|
| Skeptical SaaS Founder ("is AEO real?") | Awareness→Consideration | 19/25 | 15/25 | 6/25 | 14/25 | **54/100** | Needs Work |
| DIY Self-Auditor | Awareness | 12/25 | 13/25 | 8/25 | 10/25 | **43/100** | Needs Work |
| In-house SEO / Technical Evaluator | Consideration | 14/25 | 12/25 | 9/25 | 13/25 | **48/100** | Needs Work |
| Reddit-Risk-Averse Brand Manager | Consideration | 15/25 | 11/25 | 10/25 | 12/25 | **48/100** | Needs Work |
| Budget-Conscious SMB / Startup | Consideration | 11/25 | 17/25 | 8/25 | 12/25 | **48/100** | Needs Work |
| Agency Shortlister (VP Marketing) | Decision | 16/25 | 14/25 | 5/25 | 16/25 | **51/100** | Needs Work |

### Requested focus: the B2B SaaS founder who has heard of AEO but doesn't know if it's real (54/100)

**Relevance 19/25.** The homepage speaks his language: "Search is moving from Google to
AI", "Buyers ask AI first", "AI leans on Reddit", "The window is open". The mechanism is
stated plainly in the H1. What is missing is a page that answers his literal question —
there is no "does AEO actually work" / evidence page anywhere on 32 URLs.

**Clarity 15/25.** He cannot tell within ten seconds *what he would be buying*. The
homepage sells software (AI Visibility Score, Reddit Opportunities, AI Writing Assistant,
"Usage-Based Credits. Pay only for what you generate."). /services sells an agency retainer
("From $3,000/mo", "Dedicated AEO Strategist", "we run the whole program"). The global nav
offers both "Get Started →" and "Book a Call" with no stated difference in price, scope or
commitment. There is **no pricing page in the sitemap**, and the product's credit pricing
appears nowhere as a number. Two business models, one site, no chooser.

**Trust 6/25 — this is the failure point, and it is exactly the dimension this persona
scores on.** He arrives asking "is this real?" and every proof element on the page is
synthetic: the hero dashboard is a mockup (correctly and honourably labelled "Sample
dashboard, illustrative data, not a live customer's real score" — the +3 points above
floor are for that honesty), the Reddit opportunity cards are invented thread titles, the
r/SaaS mention notification is a mock, and the only case study is "how we grow brands on
Reddit, using SaaSOffers as the live example" — AEOrank's own property. The /industries/saas
stats (+312%, +180%) appear without a client, a period, or an n. /about is 229 words with no
founder bio. Meanwhile the SERP he came from explicitly ranks AEO vendors by whether they
publish case studies with pipeline metrics.

**Action 14/25.** "Get Started →" leads to email + password + confirm password before he
sees anything, even though /industries/saas promises "an instant AI-visibility scan tailored
to your site". The promised proof is behind the wall it should be proving. "Book a Call"
(45 min with a senior strategist) is the right offer for the wrong stage — he is not ready
to talk to sales, he is ready to look at evidence. There is no third, zero-friction path:
no ungated scan, no sample report download, no published methodology, no pricing.

### Systemic issues
- **Trust is the weakest dimension for all six personas** (avg 7.7/25). Not a copy problem —
  a missing-asset problem. One real, named, numbered client story would move every score.
- **The whole site is built for decision stage; 7 of 9 SERPs are awareness stage.** The
  conversion path assumes the visitor already believes in AEO. Google's results say they
  are still deciding whether to believe.
- **Clarity is capped by the dual business model.** Every persona loses 8–14 clarity points
  to the same unresolved question: software or agency?
- **Media is functionally absent** (0 tables, 0 video, 0 real screenshots) in SERPs where
  competitors ship comparison tables and step-by-step visuals.

### Priority actions (weakest persona first)

1. **Build the free ungated AI-visibility checker at /services/ai-visibility-audit**
   (serves DIY Self-Auditor, 43/100, highest-volume awareness SERP). Domain input above the
   fold, instant partial result (3 engines × 5 queries), full 100-query report gated. Publish
   the method as an H2 list: "The 5 checks we run", "The 100 queries we test", "How we score
   share of voice". Converts a Service-Page mismatch into Tool/Interactive alignment and
   simultaneously fixes the Trust score for the Founder persona, because the tool *is* proof.
2. **Fix the two broken keyword targets before writing another word.**
   Retitle /services/citation-building → "AI Citation Building for B2B SaaS" with an explicit
   "this is not local-SEO NAP citations" disambiguator; retitle /services/aeo-consulting →
   "Answer Engine Optimization Consulting" and drop "AEO consulting" as a target.
3. **Publish one real case study with a name, a date, an n and a pipeline number**
   (serves Agency Shortlister at 51/100 and Founder at 54/100). Link it from the homepage
   hero, all five service pages and all four industry pages. Until it exists, source the
   +312%/+180% stats inline or delete them — unsourced percentages next to a mock dashboard
   actively subtract trust from the persona you most need to convince.
4. **Convert the four /industries/* pages from 265-word landings into 2,000-word guides**
   ("Answer Engine Optimization for B2B SaaS: The 2026 Playbook"), keeping the service CTA as
   a mid-scroll and end-scroll module — Hybrid type, which is what a 100%-guide SERP will
   tolerate from a vendor. Add Service schema.
5. **Build the Reddit pillar AEOrank has no right to be missing:**
   "Reddit for AI Search Visibility: The Complete Playbook" targeting an 8/9-informational,
   zero-vendor SERP on the company's own differentiator. Fold in
   /blog/why-chatgpt-cites-reddit-threads, /blog/reply-to-reddit-without-getting-removed and
   /blog/how-we-verify-reddit-threads as cluster children — that same cluster is the answer
   to the Reddit-Risk-Averse persona (48/100), whose objection is currently handled by one
   line in one feature card ("Nothing posts until you review and approve it").
6. **Resolve software-vs-agency on the homepage and ship a /pricing page.** A two-column
   chooser above the FAQ — "Run it yourself (software, from $X/mo in credits)" vs "We run it
   (managed, from $3,000/mo)" — recovers clarity points for all six personas at once.
7. **Add a comparison table + "best for" verdict to /blog/profound-vs-peec-vs-aeorank and
   /blog/crowdreply-vs-aeorank**, and pitch for inclusion in the nine third-party
   "best AEO agency for SaaS" listicles that own that SERP.
8. **Deploy commit `59eb69f`** so the H1s actually exist in production, and split blog posts
   from 2 H2s to one H2 per buyer question.

---

## 6. Limitations

- SERP data comes from WebSearch result sets, which surface titles and URLs but not
  ad blocks, People-Also-Ask boxes, featured-snippet formats, AI Overview text or
  related-search modules. PAA/ad-derived personas above are inferred from result titles and
  the synthesised result summaries, not from a rendered SERP screenshot. Confidence on page
  types is high; confidence on SERP-feature claims is moderate.
- Competitor word counts are estimated from titles, result summaries and page type
  ("Practitioner Guide", "Ultimate 2026 Guide") rather than fetched and counted.
- No ranking, impression or click data: without Search Console, it is not possible to say
  whether these pages are currently ranking at position 30 or not indexed at all.
- Results are not localised or personalised; a US desktop SERP is assumed.
- /industries/tech-it and /industries/software were not individually rendered; they are
  assumed to match the /industries/saas and /industries/startups template, which are
  byte-for-byte structurally identical.
- 12 of 16 blog posts were not fetched; depth figures generalise from 4 sampled posts.
- Core Web Vitals, mobile rendering and accessibility were out of scope — see
  `findings/technical.md`.
- Live HTML predates commit `59eb69f`; re-verify heading findings after deployment.

## 7. Cross-skill referrals

- Missing SoftwareApplication/Offer, AggregateRating, ItemList and ContactPoint schema → `/seo schema`
- Zero first-party evidence, unsourced statistics, no author credentials on /about → `/seo content` (E-E-A-T)
- 300–460-word commercial pages → `/seo page` for page-level audit of each
- No local intent found in any sampled SERP; `/seo local` not applicable

Generate a PDF report? Use `/seo google report`.
