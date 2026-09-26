# Sitemap Architecture

Source: `app/sitemap.js` (Next.js 14 App Router `sitemap.js` convention, served
at `/sitemap.xml`, declared correctly in `app/robots.js`).

## Validation summary

| Check | Result |
|---|---|
| XML valid | Pass — well-formed `urlset`, correct namespace |
| URL count | 32 (limit 50,000) — Pass |
| File size | Trivial — Pass |
| HTTP status | All 32 return 200 — Pass |
| `lastmod` format | Valid W3C date (`YYYY-MM-DD`) — Pass on format, Fail on accuracy (see below) |
| `priority` / `changefreq` | Present, both ignored by Google — Info |
| robots.txt reference | Correct, points at `/sitemap.xml` — Pass |

## Critical: the sitemap has already drifted — a live, indexable page is missing

`app/sitemap.js` hardcodes three slug arrays (`blogSlugs`, `industrySlugs`,
`serviceSlugs`) by hand instead of importing them from the actual content
source. The blog's real data lives in `app/blog/page.js`, which has **17**
posts. `sitemap.js`'s `blogSlugs` array has **16**. The missing one:

- `https://www.aeorank.tech/blog/what-is-aeo` — confirmed **200 OK**, real
  title (`What Is AEO? Answer Engine Optimization Explained | AEOrank`),
  listed and linked on `/blog`, dated July 26, 2026 in the source data.
  It is a fully public, indexable page that simply never made it into
  `sitemap.js`'s array — almost certainly because whoever added the post to
  `app/blog/page.js` forgot the second, disconnected edit in `app/sitemap.js`.

This is the direct answer to "will it stay correct as pages are added": **no**.
`industrySlugs` (4) and `serviceSlugs` (5) currently match their content
objects 1:1, but that's incidental — there is no build-time check, no
generateStaticParams-driven source of truth, and no filesystem/CMS scan tying
`sitemap.js` to the actual routes. It is hand-maintained and it has already
drifted once in exactly the way hand-maintained sitemaps drift: a new content
item was added to the page that renders it but not to the separate file that
lists it for search engines. Note: another auditor's crawl-based Content
Quality finding in this same audit counted "16 posts" — that's the sitemap's
count, not the site's; it silently missed `what-is-aeo` for the same reason.

**Fix:** derive `sitemap.js`'s blog/service/industry entries from the same
arrays that `app/blog/page.js`, `app/services/page.js`, and
`app/industries/[slug]/page.js` already define (import a shared
`lib/content.js` module, or generate the list from `generateStaticParams`),
so a new post/service/industry is automatically in the sitemap the moment
it's added to its listing page.

## Low: `lastmod` is fabricated, not real

All 32 entries carry `lastmod = 2026-09-16`, identical across every URL,
because `sitemap.js` does:

```js
const lastModified = new Date().toISOString().slice(0, 10);
...
].map((p) => ({ ...p, lastModified }));
```

This stamps *today's build/request date* onto every URL on every deploy —
it has never reflected an actual content change and never will under the
current code. This is worse than mere boilerplate because the site already
has real per-page dates it isn't using: `app/blog/page.js` stores an actual
`date` field per post (e.g. "July 26, 2026", "April 24, 2026") that
`sitemap.js` ignores entirely in favor of `new Date()`. `/services` and
`/industries` pages have no stored date at all, so for those a real
last-significant-change date would need to be tracked (e.g. a `updatedAt`
per entry, or driven from git history at build time) rather than invented.

**Fix:** for blog pages, parse the existing `date` field and use it as
`lastModified`. For services/industries, either add a real `updatedAt` per
entry or drop `lastmod` for those rather than fabricate one — an absent
`lastmod` is safer than a wrong one.

## Info: `priority` / `changefreq` are dead weight

Google has ignored both since at least 2020/2021 and documents this
explicitly; Bing's use is minimal/undocumented. They cost nothing here (no
functional harm) but they're also actively misleading as a design signal:
`/services` is hand-assigned `priority: 0.9` (second only to the homepage's
`1.0`) while, per the internal-linking check below, `/services` has **zero**
inbound internal links from anywhere a normal visitor or crawler would land.
The priority field asserts an importance the actual site architecture
doesn't back up. Recommend deleting both fields to stop the sitemap
implying a signal-priority order that isn't real and isn't read by Google
anyway.

## Medium: internal linking doesn't match the sitemap — /industries/* are true orphans, /services/* are buried

`Header.js` (global, every page) contains only the logo and an auth link —
no nav. `Footer.js` (global, every page) links only to `/blog`, `/#faq`,
`/contact`, `/about`, `/privacy`, `/terms`. Neither links to `/services` or
any `/industries/*` page. The homepage (`app/page.js`) contains zero
occurrences of "Services" or "Industries" text or hrefs.

Traced internal paths from the crawl of `app/*.js` source:

- **`/industries/saas`, `/industries/startups`, `/industries/tech-it`,
  `/industries/software`** — no page anywhere in the app links to any of
  these four (not each other, not from a hub — there is no
  `app/industries/page.js` index at all). They exist in the sitemap with
  `priority: 0.6` but are otherwise **orphan pages**: reachable by a crawler
  only via the XML sitemap itself or an external link, never by following a
  link from the homepage. This is functionally the same architecture defect
  as the pattern the location-page quality gate exists to catch — thin
  programmatic pages with no on-site path to them — except here it's
  industry pages, and (per the Content Quality findings) they're already
  independently flagged as near-duplicate/thin (297-308 words). Combining
  "orphaned" + "thin/near-duplicate" is the profile Google's doorway-page
  detection targets, even at just 4 pages (well under the 30-page warning
  threshold, but the qualitative risk is the same).
- **`/services`** — zero inbound internal links from any page outside the
  `/services` cluster itself. The *only* route in from the rest of the site
  is one blog-post template CTA button (`app/blog/[slug]/page.js` line 929)
  linking to one specific child, `/services/ai-visibility-audit`. From
  there: `/services/ai-visibility-audit` → breadcrumb → `/services` hub →
  hub's own grid links to the other four service pages. That's a real path,
  but it's 4-5 clicks deep from the homepage (home → footer `/blog` →
  `/blog` listing → a specific post → `/services/ai-visibility-audit` →
  `/services` → sibling services), for a page the sitemap itself flags as
  the second-highest-priority page on the site.

**Fix:** add `/services` and `/industries` (needs an index page — currently
doesn't exist) to the global header or footer nav so both clusters are
reachable within 1-2 clicks of the homepage, matching the priority the
sitemap already claims for them.

## Extra public pages correctly excluded from the sitemap, but not locked down

`/crewquest`, `/easyrep`, `/easyrep/privacy`, `/easyrep/terms`,
`/avora/privacy`, `/avora/terms`, `/avora/support`, `/bitewise/privacy`,
`/bitewise/terms` are live, public, 200-OK pages with real `<title>`
metadata — legal/support pages for other products (EasyRep, AVORA,
BiteWise, CrewQuest) that share this Vercel deployment/domain. They are
absent from the sitemap and unlinked from any AEOrank marketing page or nav
(confirmed: only `components/crewquest/Nav.js` links within the CrewQuest
subtree itself).

Excluding them from the sitemap is the right call — they are topically
unrelated to AEOrank's AEO/AI-citation subject matter, and mixing an
answer-engine-optimization service's sitemap with a calorie-tracking app's
privacy policy would dilute topical relevance for no benefit.

**But the exclusion isn't actually enforced.** `app/robots.js` only
disallows `/dashboard`, `/api`, `/onboarding`; these nine pages fall under
the default `allow: "/"` and carry no `robots: { index: false }` metadata.
Contrast with `app/checkout/success/page.js` and
`app/checkout/cancel/page.js`, which *do* set
`robots: { index: false, follow: false }` explicitly. Right now these nine
pages are excluded from the sitemap only by omission (no internal links, not
listed) — if any of them ever pick up an external backlink (plausible: an
App Store listing referencing `/easyrep/privacy` or `/avora/support` as its
required privacy/support URL is exactly the kind of link that exists for
these pages), Google can crawl and index them under the aeorank.tech domain
regardless of sitemap absence.

**Fix:** add explicit `robots: { index: false, follow: false }` metadata to
all nine pages (same pattern already used on `/checkout/success` and
`/checkout/cancel`), so the exclusion is a deliberate policy rather than an
accident of missing nav links.

`/admin/*`, `/poster/*`, `/login`, `/signup`, `/forgot-password`,
`/reset-password`, `/apply-poster/*`, `/report/[brand]`, `/go` are similarly
un-noindexed and un-disallowed (robots.txt only blocks `/dashboard`, `/api`,
`/onboarding`). These are out of this check's core scope (sitemap
coverage) but worth flagging alongside the above since it's the same root
cause — no page-level `robots` metadata outside the two checkout pages.

## What's correctly present

The 7 static pages (home, services hub, blog hub, about, contact, privacy,
terms), the 5 service detail pages, and 4 industry pages are all present,
valid, and 200. 16 of the 17 real blog posts are present. No deprecated-tag
harm, no oversized file, no broken/redirected/noindexed URL made it into the
sitemap.
