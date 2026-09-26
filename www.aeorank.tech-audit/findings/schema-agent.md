# Schema / Structured Data — Deep Validation & Additions

Scope: validated the existing JSON-LD against Google's actual rich-result
requirements (not just presence/validity), and specced ready-to-paste
additions for the gaps. Site is Next.js 14 App Router, plain JS, static
generation (`generateStaticParams`). Confirmed live production HTML matches
the repo source exactly (fetched `https://www.aeorank.tech/` raw, no SPA
shell, 2 valid JSON-LD blocks — `Organization` + `FAQPage` — byte-identical
to `app/page.js`), so validation against the source files below is validation
against what's actually served.

## 1. Detection (confirmed)

| Route | Blocks present |
|---|---|
| `/` | `Organization`, `FAQPage` |
| `/blog/[slug]` (16) | `BlogPosting`, `BreadcrumbList` |
| `/services/[slug]` (5) | `Service`, `FAQPage`, `BreadcrumbList` |
| `/industries/[slug]` (4) | `BreadcrumbList` only |
| `/services`, `/blog`, `/about`, `/contact` | none |

All JSON-LD is emitted the same way everywhere: a `const xJsonLd = {...}`
object per block, rendered as `<script type="application/ld+json"
dangerouslySetInnerHTML={{ __html: JSON.stringify(xJsonLd) }} />` inside each
page's own `export default function`. No shared schema component exists yet
— `MarketingLayout` (`components/MarketingLayout.js`, wraps every marketing
page including about/services/blog/contact/checkout) currently only renders
`<Header />{children}<Footer />`, nothing schema-related. That's the natural
place for sitewide identity schema (see §3).

## 2. Validation of existing blocks

### Organization (homepage only) — structurally valid, one real defect
`app/page.js:38-47`. Has `@id`, `name`, `url`, `logo`, `description`,
`sameAs`. No required properties are missing (Organization has none of its
own for Google; it's the anchor other rich results borrow from).

- **Defect:** `logo` is `${SITE_URL}/icon.svg` — an SVG. Google's own
  Organization/Logo guidance recommends a raster fallback (JPEG/PNG/WebP);
  SVG rendering in the Knowledge Panel / Logo feature is unreliable in
  practice. No PNG logo currently exists in `public/` (only `logo.svg`,
  `logo-light.svg`, `icon.svg`). **Action:** export a square PNG (512×512 is
  safe) and point `logo` at it once it exists — flagging as an asset
  dependency, not something to fake a path for today.
- **Gap, not a failure:** only 1 `sameAs` entry (LinkedIn). The code comment
  explicitly says only confirmed-live profiles get added — correct
  discipline, don't add unverified profile URLs. No `foundingDate` for the
  same stated reason. Leave both as-is until real.
- **Scope defect:** only emitted on `/`. Every other page — including ones
  that already emit their own `Service`/`BlogPosting`/`BreadcrumbList` —
  has zero Organization context. See §3.

### FAQPage (homepage + all 5 `/services/[slug]`) — technically well-built, but inert
Both implementations build the JSON-LD straight from the visible
`<details>`/`<summary>` content (the homepage even has a code comment
about this), so there's no visible/structured mismatch, and each FAQ set is
genuinely unique per page — no duplicated Q&A copy-pasted across services.
Structurally: `Question`/`acceptedAnswer`/`Answer` nesting is correct on
every instance.

**But:** Google retired FAQ rich results for all sites on May 7, 2026. That
date has already passed as of today (Sept 26, 2026). These 6 blocks (1
homepage + 5 services) currently produce **no SERP feature at all**. Per
policy: flag as **Info priority, not Critical** — they're not broken, they
just don't do anything in Google Search anymore. Any AI/GEO citation benefit
from FAQPage is unconfirmed, so:
- Don't remove them (harmless, and possibly still parsed by some AI
  crawlers as page content signal).
- Don't add FAQPage to `/industries/[slug]` even though the task asks those
  to mirror `/services/[slug]` — industries pages have no FAQ content
  block at all in the data (`challenges`/`approach`/`results` only, no
  `faqs` array), so there's nothing to mark up, and it wouldn't be worth
  adding net-new FAQ copy just to wrap it in a dead schema type.

### Service (`/services/[slug]`) — valid but thin, and not a rich-result type
`app/services/[slug]/page.js:171-179`. Important calibration: **`Service` is
not one of Google's supported rich-result types.** It won't produce a SERP
snippet on its own regardless of completeness. Its value here is entity
clarity for AI/GEO parsing (relevant, since AI visibility is literally
this company's product) and knowledge-graph disambiguation, not Search
Console rich-result eligibility. With that framed correctly:
- `provider` is inlined as a bare `Organization` object with no `logo`/`sameAs`
  — fine for `Service`, but duplicates data that should live in one place
  (§3).
- No `offers`/pricing, even though every one of these 5 services has a real,
  public price on `/services` (`$3,000/mo`, `$1,500/mo`, `$1,000/mo`, `$800
  one-time`, `$500 one-time`). That's a real, already-public fact not yet
  reflected in the per-service page's own data object — worth adding (§5).
- No `@id`, so nothing else on the page (or elsewhere) can reference this
  specific service node.

### BlogPosting (`/blog/[slug]`, all 16) — missing a **required** property
`app/blog/[slug]/page.js:803-813`. Checked against Google's actual Article
structured-data requirements (Article/NewsArticle/BlogPosting share the same
guidelines):

- **`image` — required — currently absent on every single post.** This is
  the one hard failure across the 16 blog posts. Without it, none of these
  posts are eligible for Google's Article-family rich results at all,
  regardless of how good `headline`/`author`/`datePublished` are.
- `headline`, `datePublished`, `author` — present and correct. `author` is
  correctly typed as `Person` with `worksFor` pointing at the Organization.
- `dateModified` — present, but it's always hard-set equal to
  `datePublished` (`post.updated` reused for both,
  `app/blog/[slug]/page.js:808-809`). Not a validation failure — just means
  the moment a post is actually revised later, whoever edits it needs to
  remember to bump `updated` to reflect the true edit date, or
  `dateModified` silently stays wrong. Low-priority process note, not a
  schema fix.
- `publisher` — present as a bare `Organization` (`name`+`url`), **missing
  `logo`**, which Google's Article guidance calls out as a `publisher.logo`
  sub-property (must be an `ImageObject`, not a bare string, unlike the
  top-level `Organization.logo` which accepts either). Fix included below.
- Every post has `metaDescription` distinct from the display `description`
  used in the JSON-LD `description` field — that's intentional (metaTitle
  differs from title too, for search snippets vs. on-page display) and not
  a schema issue.

### BreadcrumbList — valid on `/blog/[slug]` and `/services/[slug]`, **broken on `/industries/[slug]`**
This is the clearest concrete defect found in the audit.

`app/industries/[slug]/page.js:139-147`:
```js
const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.aeorank.tech' },
    { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://www.aeorank.tech' },
    { '@type': 'ListItem', position: 3, name: industry.title, item: `https://www.aeorank.tech/industries/${params.slug}` },
  ],
}
```
Two real problems:
1. **Item 2 ("Industries") points at the homepage URL** — there is no
   `/industries` index route in the codebase (only `app/industries/[slug]/`
   exists, no `app/industries/page.js`), so this crumb is factually wrong:
   it claims a page called "Industries" lives at the homepage.
2. **It doesn't match the page's own visible breadcrumb.** The visible nav
   rendered lower on the same page (`app/industries/[slug]/page.js:234-242`)
   only shows two levels — `Home / {industry.title}` — with no "Industries"
   crumb at all. Google's guidance is explicit that structured breadcrumb
   data should reflect the page's actual navigation path. Right now the
   JSON-LD and the visible UI disagree.

Compare `/services/[slug]` (`app/services/[slug]/page.js:161-169` and its
visible nav at `235-245`): both are 3 levels, both point `Services` at the
real `/services` page, and they match each other. That one's correct.

Fix options are in §4 — either build the visible/real `/industries` hub
(mirrors what `/services` already has) or collapse the JSON-LD to 2 levels
to match the current UI. Given the task explicitly wants industries to
mirror services, I'd build the hub (also closes the "no schema at all" gap
on a would-be `/industries` route and gives `/services`-style `ItemList`
schema, see §5).

## 3. Should Organization be sitewide? Yes — and WebSite too (without SearchAction)

Move Organization out of `app/page.js` and into `components/MarketingLayout.js`
so every marketing page (home, about, services + detail, industries detail,
blog + detail, contact, checkout, terms, privacy) resolves to the same
`@id`, instead of only the homepage having any entity context at all.
`MarketingLayout` is already a plain server component (no `"use client"`),
so emitting `<script type="application/ld+json">` there works exactly like
it does in the page files today.

**WebSite schema:** yes, add a minimal one alongside it for entity
completeness — but **do not add `SearchAction`**. There's no site search
feature anywhere in the codebase (`find app -iname "*search*"` returns
nothing), and `SearchAction`/Sitelinks Search Box requires a real, working
query URL template. Shipping a non-functional one is inaccurate schema for
zero benefit — Google will simply ignore it, so it's not "extra credit,"
just noise.

**`app/components/MarketingLayout.js` — replace with:**
```js
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SITE_URL = "https://www.aeorank.tech";

// Sitewide identity schema. Every marketing page should resolve to the same
// Organization/WebSite node — previously this only existed on the homepage,
// so every other page (services, industries, blog, about, contact) had zero
// entity context of its own. Keep this in sync with the description in
// app/layout.js's <metadata>.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "AEOrank",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  description:
    "Help your brand show up in ChatGPT, Claude, and Gemini answers through measurable Reddit engagement.",
  sameAs: ["https://www.linkedin.com/company/aeoranktech"],
};

// No SearchAction: there is no working site search to point it at yet.
// Add one only once a real search route exists.
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "AEOrank",
  url: SITE_URL,
};

export default function MarketingLayout({ children }) {
  return (
    <div className="light-theme">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <Header />
      {children}
      <Footer />
    </div>
  );
}
```

**Then in `app/page.js`:** delete the `organizationJsonLd` const and its
`<script>` tag (lines 38-47 and 104-107) — it would otherwise double up on
the homepage now that `MarketingLayout` emits it. Leave `faqJsonLd` exactly
where it is.

## 4. `/industries/[slug]` — fix the breadcrumb, add the mirroring `Service` schema

**Recommended path (mirrors `/services/[slug]` for real):** build
`app/industries/page.js` as a hub, same shape as `app/services/page.js`
(icon/blurb/link cards for `saas`, `startups`, `tech-it`, `software`), then
fix the breadcrumb to point at it and add visible middle-crumb in the nav to
match:

`app/industries/[slug]/page.js` — replace the `breadcrumbLd` block:
```js
const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.aeorank.tech' },
    { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://www.aeorank.tech/industries' },
    { '@type': 'ListItem', position: 3, name: industry.title, item: `https://www.aeorank.tech/industries/${params.slug}` },
  ],
}
```
and update the visible nav (currently `Home / {industry.title}` only) to add
the middle `Industries` link, matching how `/services/[slug]` does it.

**If you don't want to build the hub right now:** collapse the JSON-LD to
match the current 2-level visible nav instead — this is strictly better than
what's there today (no more phantom "Industries" page at the homepage URL):
```js
const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.aeorank.tech' },
    { '@type': 'ListItem', position: 2, name: industry.title, item: `https://www.aeorank.tech/industries/${params.slug}` },
  ],
}
```

**New: `Service`-equivalent schema for industries**, added right next to
`breadcrumbLd`. Industries pages aren't literally a distinct service SKU —
they're the same AEO service targeted at a specific buyer segment — so this
uses `Service` with an `audience` property instead of copy-pasting the
`/services/[slug]` shape verbatim:
```js
const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: industry.title,
  description: industry.description,
  provider: { '@type': 'Organization', name: 'AEOrank', url: 'https://www.aeorank.tech' },
  areaServed: 'Worldwide',
  serviceType: 'Answer Engine Optimization',
  audience: { '@type': 'Audience', audienceType: industry.tag },
}
```
Render it the same way the existing `breadcrumbLd` script is rendered
(`app/industries/[slug]/page.js:155-158`):
```jsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />
```
No `FAQPage` addition here — see §2, there's no FAQ content on these pages
and the type is inert on Google anyway.

## 5. Schema for `/services`, `/blog`, `/about`, `/contact`

None of these currently have a single JSON-LD block. All four are safe,
low-risk, entity-graph-only additions (no Google rich-result feature exists
for `ItemList`/`AboutPage`/`ContactPage`/`Blog` on their own — value here is
AI/GEO context and internal consistency, which is worth being upfront about
so expectations are calibrated).

**`app/services/page.js`** — breadcrumb + a plain `ItemList` of the 5
service pages (place near the top of the returned JSX, same pattern as
every other page):
```js
const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.aeorank.tech' },
    { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.aeorank.tech/services' },
  ],
}

const itemListLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: services.map((s, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: s.title,
    url: `https://www.aeorank.tech/services/${s.slug}`,
  })),
}
```
(`services` is already the array defined at the top of that file — no new
data needed.)

**`app/blog/page.js`** — breadcrumb + a `Blog` node listing every post URL
(genuinely useful for AI crawlers trying to enumerate the full post
inventory in one place, which is exactly the kind of machine-readable
completeness this company's own product is built around):
```js
const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.aeorank.tech' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.aeorank.tech/blog' },
  ],
}

const blogLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': 'https://www.aeorank.tech/blog#blog',
  name: 'AEOrank Blog',
  url: 'https://www.aeorank.tech/blog',
  publisher: { '@type': 'Organization', name: 'AEOrank', url: 'https://www.aeorank.tech' },
  blogPost: posts.map((p) => ({
    '@type': 'BlogPosting',
    headline: p.title,
    url: `https://www.aeorank.tech/blog/${p.slug}`,
  })),
}
```
(`posts` is the existing array at the top of that file.)

**`app/about/page.js`**:
```js
const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.aeorank.tech' },
    { '@type': 'ListItem', position: 2, name: 'About', item: 'https://www.aeorank.tech/about' },
  ],
}

const aboutPageLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  url: 'https://www.aeorank.tech/about',
  name: 'About - AEOrank',
  about: { '@type': 'Organization', name: 'AEOrank', url: 'https://www.aeorank.tech' },
}
```

**`app/contact/page.js`**:
```js
const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.aeorank.tech' },
    { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://www.aeorank.tech/contact' },
  ],
}

const contactPageLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  url: 'https://www.aeorank.tech/contact',
  name: 'Contact - AEOrank',
  about: { '@type': 'Organization', name: 'AEOrank', url: 'https://www.aeorank.tech' },
}
```
I deliberately did **not** add a `ContactPoint`/email here. The only public
support address found (`support@aeorank.tech`) is used on the AVORA app's
support page (`app/avora/support/page.js`), a different product hosted on
the same domain — attaching it to AEOrank's own `Organization` node would
misrepresent whose contact channel it is. Add a real `ContactPoint` once
there's a general AEOrank contact address confirmed live.

## 6. `BlogPosting` fix — add the missing required `image`, fix `publisher.logo`

`app/blog/[slug]/page.js:803-813`, replace `jsonLd`:
```js
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.title,
  description: post.description,
  image: 'https://www.aeorank.tech/opengraph-image',
  datePublished: post.updated,
  dateModified: post.updated,
  author: { '@type': 'Person', name: post.author, worksFor: { '@type': 'Organization', name: 'AEOrank', url: 'https://www.aeorank.tech' } },
  publisher: {
    '@type': 'Organization',
    name: 'AEOrank',
    url: 'https://www.aeorank.tech',
    logo: { '@type': 'ImageObject', url: 'https://www.aeorank.tech/icon.svg' },
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': `https://www.aeorank.tech/blog/${params.slug}` },
}
```
`/opengraph-image` is the existing generated card (`app/opengraph-image.js`,
1200×630 PNG, already used for every page's Open Graph tag) — it's a real,
resolvable image today, so this closes the required-`image` gap immediately
without waiting on new assets. Note it's generic (same card on every post,
per that file's own comment), not headline-specific per post; that's a
legitimate follow-up if you want a stronger per-post visual, but it's not
required for the schema to validate.

## 7. `/services/[slug]` — add real pricing to `Service` via `offers`

The five service pages don't carry pricing in their data object at all,
even though the exact same prices are already public on `/services`
(`$3,000/mo`, `$1,500/mo`, `$1,000/mo`, `$800 one-time`, `$500 one-time`).
Add it once to the `services` object in
`app/services/[slug]/page.js` and reflect it in `serviceLd`:

```js
// add to each entry in the `services` object, e.g. 'aeo-management':
price: '3000',
priceCurrency: 'USD',
billingIncrement: 'monthly', // or 'one-time' for entity-optimization / ai-visibility-audit
```
```js
const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: service.title,
  description: service.description,
  provider: { '@type': 'Organization', name: 'AEOrank', url: 'https://www.aeorank.tech' },
  areaServed: 'Worldwide',
  serviceType: 'Answer Engine Optimization',
  offers: {
    '@type': 'Offer',
    price: service.price,
    priceCurrency: service.priceCurrency,
  },
}
```
(`Service`/`Offer` doesn't produce a Google price rich snippet the way
`Product`/`Offer` does — this is purely for entity/AI-GEO completeness, but
it's real, already-public data that costs nothing to add, and it's a
slightly awkward gap for an AEO company's own site not to have.)

## Priority summary

| Priority | Item |
|---|---|
| Critical | `/industries/[slug]` breadcrumb points "Industries" at the homepage URL and contradicts the page's own visible nav — fix in §4 |
| Critical | All 16 `BlogPosting` blocks are missing the **required** `image` property — fix in §6 |
| High | Organization only exists on the homepage — every other page has zero entity context; make sitewide via `MarketingLayout` — §3 |
| High | `/industries/[slug]` has no `Service`-equivalent schema at all (only `BreadcrumbList`) — §4 |
| Medium | `/services`, `/blog`, `/about`, `/contact` have zero schema — §5 |
| Medium | `/services/[slug]` `Service` has no `offers`, despite the pricing already being public — §7 |
| Info | 6 existing `FAQPage` blocks (home + 5 services) are structurally fine but produce no Google rich result as of May 7, 2026; leave in place, don't add more, no SERP-driven urgency |
| Info | Organization `logo` is SVG; consider a raster (PNG) fallback when a suitable asset exists |
