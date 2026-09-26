# AEOrank — Action Plan
Domain: www.aeorank.tech · 32 pages crawled · 2026-09-26

## Phase 1 — Critical (this week)

1. **Add an `<h1>` to 31 pages.** Every page except the homepage begins its
   outline at `<h2>`. On blog posts the article title itself is an `<h2>`.
   Almost certainly one shared heading component / MDX template, so this is
   likely a one-line change that fixes 31 pages at once.
   Verify after: `curl -s <url> | grep -c "<h1"` should return 1.

2. **Add `og:image`.** No page has one, so every shared link renders bare.
   In the App Router, a root `opengraph-image.tsx` covers the whole site;
   add per-post images for the 16 blog entries after that.

## Phase 2 — High (weeks 2-3)

3. **Make the apex to www hop permanent.** `https://aeorank.tech` currently
   answers 307 (temporary); it should be 308.

4. **Thicken the 4 /industries/ pages.** They are 297-308 words and share a
   template — close to near-duplicates. These are commercial-intent pages and
   the thinnest on the site.

5. **Give /industries/ the same schema as /services/.** They carry only
   BreadcrumbList; /services/ pages carry Service + FAQPage and are otherwise
   the same page type.

## Phase 3 — Medium (month 2)

6. Schema for /services, /blog, /about, /contact (currently none).
7. `twitter:card` on the 6 pages missing it.
8. Publish /llms.txt — positioning for an AEO vendor, not a ranking factor.
9. Security headers: x-frame-options, x-content-type-options, referrer-policy.

## Phase 4 — Ongoing
10. Measure Core Web Vitals. Not captured in this audit: the public PageSpeed
    quota was exhausted, and the local Lighthouse path needs the Python
    runtime, which is not installed.
