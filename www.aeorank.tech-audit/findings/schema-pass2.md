# Schema.org audit — pass 2 (verification + gap-fill)

Site: https://www.aeorank.tech
Method: source read (MarketingLayout.js, app/page.js, app/pricing/page.js, app/industries/page.js,
app/industries/[slug]/page.js, app/services/[slug]/page.js, app/blog/[slug]/page.js) cross-checked
against live rendered output (render_page.py, `--mode never`, raw fetch — no SPA shell, so raw HTML
already carries the JSON-LD; no client-injection gap to worry about here) for `/`, `/pricing`,
`/industries`, `/industries/saas`, `/services/aeo-management`, `/blog/what-is-aeo`.

## 1. What verified correct from pass 1

All five "DONE" items check out on the live site, not just in source:

| Claim | Verified |
|---|---|
| BlogPosting.image populated, pointing at `/opengraph-image` | Confirmed on `/blog/what-is-aeo`: `"image": ["https://www.aeorank.tech/opengraph-image"]`, a real generated 1200×630 PNG (`image/png`, per `app/opengraph-image.js`). `headline`, `datePublished`, `dateModified`, `author` (Person + worksFor), `publisher` (Organization + logo), `mainEntityOfPage` all present. This satisfies Google's Article/BlogPosting required (headline, image) and recommended (author, datePublished, publisher) properties — genuinely rich-result eligible now. |
| Organization sitewide via MarketingLayout, `@id = https://www.aeorank.tech/#organization` | Confirmed identical block, byte-for-byte, on every page checked (`/`, `/pricing`, `/industries`, `/industries/saas`, `/services/aeo-management`, `/blog/what-is-aeo`). Removed from `app/page.js` — no duplicate Organization node on the homepage; homepage now carries only FAQPage of its own. |
| WebSite node, bound to Organization by `@id`, no SearchAction | Confirmed identical on every page: `"publisher": {"@id": "https://www.aeorank.tech/#organization"}`. Correctly resolves — no dangling reference. No `potentialAction` added, matches the stated reasoning (no site search exists). |
| `/industries/[slug]` BreadcrumbList middle crumb → `/industries` | Confirmed on `/industries/saas`: position 2 is `{"name": "Industries", "item": "https://www.aeorank.tech/industries"}`, and that URL 200s and is in `sitemap.xml`. The index page itself carries its own correct 2-level BreadcrumbList plus a new `ItemList` of the four industries. |
| `/industries/*` Service schema with `audience` | Confirmed: `audience: {"@type": "Audience", "audienceType": "SaaS Companies"}` etc., mirroring the `Service` block already used on `/services/[slug]`. |

**@id graph integrity**: checked across all 6 fetched pages — one `#organization` node, one `#website` node, no orphans, no second Organization node competing for the `@id` anywhere in the crawlable set. The homepage FAQPage and the five service-page FAQPages remain un-migrated to a shared `@id`, but that's intentional (each is page-scoped content, not a shared entity) and not a defect.

## 2. New pages audited (didn't exist last pass)

**`/industries` (index)** — BreadcrumbList (Home → Industries) + `ItemList` of the 4 industry pages. Both valid, both resolve. No issues.

**`/pricing`** — confirmed BreadcrumbList only (Home → Pricing), matching what you flagged. No Organization/WebSite duplication (inherited from layout, not re-declared). No FAQPage (correct — the page's copy doesn't have Q&A form). See §4 for whether to add anything else here.

## 3. Still broken / not yet addressed

### 3a. New finding: Organization/publisher logo is SVG-only, and Google's logo image guidelines don't list SVG as supported

`components/MarketingLayout.js` sets `logo: "https://www.aeorank.tech/icon.svg"`, and the same file is reused for every `BlogPosting.publisher.logo`. Checked `public/`: there is no PNG/JPG/WebP anywhere in the repo — `icon.svg`, `logo.svg`, `logo-light.svg` are the only image marks, and `icon.svg` serves as `image/svg+xml` live.

Google's structured-data image guidelines for the `Logo` property (Knowledge Panel / Organization logo, and by extension `publisher.logo` on Article-family types) list JPEG, PNG, and WebP as supported formats — SVG is not on that list, and Rich Results Test has a documented history of failing to extract vector logos. Practically: the Organization node you just shipped sitewide is the "single highest-leverage schema for AEO" per your own blog post's advice (`app/blog/[slug]/page.js` content for `aeo-schema-markup-guide`, line ~441/453), and that same post calls out "missing logo URL" as a common mistake — worth closing this loop on your own site. This is a format-compliance risk, not a syntax error (the JSON-LD itself validates), so it may not throw an error in Rich Results Test, but it should not be assumed to satisfy Google's logo requirements until confirmed there.

**Recommended fix**: export a raster (PNG, min 112×112, square) version of the existing mark to `public/logo.png`, point `Organization.logo` and every `BlogPosting.publisher.logo` at it. No copy/schema-shape change needed — one asset swap in `MarketingLayout.js` and `app/blog/[slug]/page.js`.

### 3b. Confirmed still not done (correctly, per your standing rule)

- Organization: no `foundingDate`, no `contactPoint`, one `sameAs` (LinkedIn). Still correctly withheld — no verified values supplied, and inventing them would violate the schema's own no-guessing rule. Not re-flagging as an action item; only re-flagging if/when real values exist.
- No Service `Offer`/pricing on `/services/[slug]`. Still open — see below, same question applies to `/pricing` too.
- FAQPage still on homepage + 5 service pages. Still Info priority only — Google retired FAQ rich results for all sites (May 7, 2026); no SERP benefit, AI/GEO benefit unconfirmed. No change to that call.

## 4. `/pricing` — should Offer/Product markup be added?

Checked the real numbers against the page (`components/PricingTiers.js`, source of truth for `lib/stripe.js` PLANS, per the file's own comment): Lite $199/mo, Pro $299/mo, Max $449/mo, each with a 7-day free trial (card required, cancels before trial ends), monthly credits included, and $1/credit top-ups mentioned in prose ("top-ups are available at $1 per credit, with bonus credits from 500 upward"). All three tiers are genuinely billed monthly with a fixed price — this is not a "starting at" or hidden-pricing situation, so Offer markup would not be inventing anything.

**Recommendation: yes, add it, but scoped narrowly and labeled honestly.**

- These are SaaS subscription tiers, not a physical product — Google's Merchant/Product rich results (star ratings, price in search snippet) target physical or app-store goods and don't reliably apply here. There is no confirmed Google SERP feature this unlocks.
- The value is GEO/AI-answer-engine-facing: an LLM asked "how much does AEOrank cost" can lift a structured price directly instead of parsing prose, which is squarely in-thesis for a company selling AEO. That's the honest case for adding it — not a Google rich result promise.
- Don't use bare `Product` (implies a tangible good with `aggregateRating`/reviews you don't have). Use `Service` with a `hasOfferCatalog` of three `Offer`s, consistent with the `Service` type already used on `/services/[slug]` and `/industries/[slug]`. Leave the $1/credit top-up and the $500–$3,000/mo managed-services range out of the same list — they're differently-shaped (metered vs. one-time/retainer) and adding them would mean inventing a `UnitPriceSpecification` shape not clearly implied by the page copy. If you want those covered too, they'd need their own explicit Offer blocks with unitCode, which is a separate, smaller follow-up once you're happy with the tier-level version below.

Generated JSON-LD (drop-in for `app/pricing/page.js`, alongside the existing `breadcrumbLd` script tag):

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "AEOrank Self-Serve AEO Platform",
  "description": "Self-serve Reddit-based AI visibility monitoring and engagement, billed monthly with included credits.",
  "provider": { "@id": "https://www.aeorank.tech/#organization" },
  "areaServed": "Worldwide",
  "serviceType": "Answer Engine Optimization",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "AEOrank subscription plans",
    "itemListElement": [
      {
        "@type": "Offer",
        "name": "Lite",
        "description": "7-day free trial, then $199/month. $100 in monthly credits included.",
        "price": "199.00",
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "199.00",
          "priceCurrency": "USD",
          "unitText": "MONTH"
        },
        "url": "https://www.aeorank.tech/pricing"
      },
      {
        "@type": "Offer",
        "name": "Pro",
        "description": "7-day free trial, then $299/month. $200 in monthly credits included.",
        "price": "299.00",
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "299.00",
          "priceCurrency": "USD",
          "unitText": "MONTH"
        },
        "url": "https://www.aeorank.tech/pricing"
      },
      {
        "@type": "Offer",
        "name": "Max",
        "description": "7-day free trial, then $449/month. $300 in monthly credits included.",
        "price": "449.00",
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "449.00",
          "priceCurrency": "USD",
          "unitText": "MONTH"
        },
        "url": "https://www.aeorank.tech/pricing"
      }
    ]
  }
}
```

Note this uses `provider: { "@id": "https://www.aeorank.tech/#organization" }` rather than re-declaring a bare Organization object — every other Service block on the site (`/services/[slug]`, `/industries/[slug]`) currently re-declares `{"@type": "Organization", "name": "AEOrank", "url": "..."}` inline instead of referencing the sitewide `@id`. That's a minor, low-priority consistency gap worth fixing at the same time you touch this file (points every Service.provider at the one canonical node instead of five duplicate anonymous Organization objects with no `@id`) — not urgent, but free to fix while editing `/pricing`, and worth carrying into `/services/[slug]` and `/industries/[slug]` in a later pass rather than opening now.

## 5. Highest-value remaining addition

**Fix the logo format (§3a), not the pricing schema.** It's a one-asset, two-file change against a defect in the entity node you just shipped sitewide — every page on the site inherits whatever the Organization/publisher logo does or doesn't do, so it has more reach than any single new page's markup, it's cheap to fix, and it's the exact mistake your own `aeo-schema-markup-guide` post tells readers to avoid. The `/pricing` Offer markup (§4) is a legitimate next addition but is GEO-only with no confirmed Google benefit — worth doing, but after the logo fix, not instead of it.

## 6. Structured summary (for audit-data.json)

```json
{
  "category": "Schema / Structured Data",
  "pass": 2,
  "verified_fixed": [
    "BlogPosting.image + publisher.logo present on all posts, live-confirmed on /blog/what-is-aeo",
    "Organization sitewide via MarketingLayout.js, single @id, no homepage duplicate",
    "WebSite bound to Organization @id, no SearchAction (correct, no search feature)",
    "/industries/[slug] BreadcrumbList now points at real /industries index",
    "/industries/* Service schema carries audience/audienceType",
    "/industries index page ships BreadcrumbList + ItemList",
    "No orphaned or duplicate @id nodes across / , /pricing, /industries, /industries/saas, /services/aeo-management, /blog/what-is-aeo"
  ],
  "new_issues": [
    {
      "severity": "medium",
      "issue": "Organization.logo and every BlogPosting.publisher.logo point at icon.svg; no raster (PNG/JPG/WebP) logo exists anywhere in public/. Google's logo structured-data guidelines do not list SVG as a supported format.",
      "fix": "Export a PNG (min 112x112, square) of the existing mark, point logo properties at it instead of icon.svg."
    }
  ],
  "open_by_design": [
    "Organization.foundingDate, contactPoint, and additional sameAs entries withheld pending verified values",
    "No Offer/pricing schema on /services/[slug] or /pricing yet (see recommendation)",
    "FAQPage retained on homepage + 5 service pages, Info priority only (no Google SERP benefit post May-2026 retirement)"
  ],
  "recommended_addition": {
    "page": "/pricing",
    "type": "Service + hasOfferCatalog (3 Offers: Lite $199/mo, Pro $299/mo, Max $449/mo)",
    "rationale": "GEO/AI-answer benefit only; no confirmed Google rich result for SaaS subscription pricing",
    "priority": "after the logo fix"
  }
}
```
