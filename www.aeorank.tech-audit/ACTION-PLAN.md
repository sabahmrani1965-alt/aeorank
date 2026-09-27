# AEOrank — What's left
Updated 2026-09-27, after the technical fixes shipped.

## Done and live
h1 on all 34 pages · og:image sitewide · sitemap derived from source (34 URLs,
what-is-aeo restored, 12 real lastmod dates) · auth pages noindex ·
BlogPosting.image so posts are rich-result eligible · /industries index built,
breadcrumb fixed, Service+Audience schema, footer-linked · blog outline h1->h2 ·
gtag off the critical path · apex 307 -> 308.

Nothing above changes rankings by itself. It removes the reasons a crawler
would skip, misread or refuse to feature the pages.

---

## The actual constraint: nobody has a reason to believe you

Across six buyer personas the specialist scored Trust 6/25 — the lowest
dimension, and the one a skeptical B2B SaaS founder decides on. Everything
below is ordered by that.

### 1. Publish one real case study  (highest leverage, only you can do it)
Zero exist. The site asserts experience ~30 times and evidences it 0 times:
"audited dozens of B2B SaaS brands", "+312%", "200-400%" — no client, no date
range, no query set, no screenshot. The SERP you want to win ranks vendors
specifically on published pipeline outcomes.

One study with a named client, a date range, the queries tracked and
before/after citation counts outranks every other item on this list. If no
client will be named, run it on your own property and publish the method and
the raw numbers.

### 2. Fix the numbers that contradict each other  (30 minutes, your call)
A prospect checking your claims finds, today:
  - /services/citation-building, inside FAQ structured data: "Most clients see
    200-400% increase in AI citation frequency within 6 months" — while /about
    says "We don't promise specific LLM citations. Nobody can." and the
    homepage FAQ says "nobody can guarantee what an LLM will say."
  - +312% labelled "Average AI Citation Increase" on /industries/saas and
    "Technical Query Citations" on /industries/tech-it. One number, two meanings.
  - One homepage card: heading "over 5.5B monthly visitors", body beneath it
    "With 1.2B monthly visitors".
  - /about: "We don't run vote rings or operate fake accounts" vs the homepage:
    "Create the appearance of real users recommending your brand on Reddit."

Source them, or cut them. A specific performance guarantee your own site calls
impossible is a commercial exposure question, not an SEO one.

### 3. Build the entity record  (1-2 days, mostly you)
Answer engines resolve entities before they cite them. Yours barely exists:
Wikidata returns 0 results for "AEOrank", Wikipedia 0 hits, Organization schema
has exactly one sameAs (a LinkedIn profile not linked from any page), no
founder, no foundingDate, no contactPoint. The author byline "Ilyas Lemzouri"
appears on all 17 posts and nowhere else on the site — no bio, no author page.
/about names no human, no legal entity, no email.

Your own /blog/aeo-schema-markup-guide tells readers to do exactly this, and
demands "at least 6 sameAs entries". You have one.

### 4. Content structure  (I can do this — say the word)
Across all 17 posts: 0 <ul>, 0 <ol>, 0 <table>, 0 <strong>, 0 <img>,
0 outbound citations. Bullets are literal • glyphs with \n inside a single <p>,
so extractors collapse a four-step checklist into one run-on paragraph. The
three comparison posts have no comparison table.

This is the gap that most directly contradicts what you sell.

### 5. Depth and hubs  (writing; I can draft)
15 of 17 posts are under the 1,200-word spoke minimum (mean 854). Three of four
topic clusters have no hub at all. Highest-value missing article:
"best AI visibility tools" — 9 of 9 results for that query are vendor listicles
and you are absent from your own category's buying shortlist.
Also: read-time labels are inflated on 15 of 17 posts (median implied 99 wpm).

### 6. Retarget two service pages  (your call)
  - /services/citation-building: every SERP result for "citation building" is
    local-SEO NAP directory work. Google's entity for that phrase belongs to
    someone else. Retitle to "AI Citation Building" with an explicit
    disambiguator, or accept it will not rank.
  - /services/aeo-consulting: "AEO" resolves to Authorised Economic Operator,
    Adaptive Execution Office, a UK IT consultancy and a Florida structural
    engineer. No on-page work wins this.

### 7. Links  (ongoing)
Domain does not appear in the Common Crawl graph at all. For a young site that
is expected, not a defect. The realistic play, given what you sell: turn your
own product data into a linkable study (#1 above does double duty), get listed
in AI-tool directories, and claim founder/company profiles — which also feeds #3.

---

## Housekeeping
- Submit the sitemap in Search Console; request indexing for /industries and
  /blog/what-is-aeo, both previously invisible.
- Add a Google API key if you want field Core Web Vitals; the public PageSpeed
  quota was exhausted during this audit, so all performance numbers here are lab.
- Re-run /seo audit after deploy to capture a drift baseline for next time.
