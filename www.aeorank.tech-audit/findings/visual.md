# Visual audit — www.aeorank.tech
Date: 2026-09-26
Viewports: Desktop 1440x900, Mobile 390x844 (device-scale 2x for mobile)
Pages: `/`, `/blog/aeo-vs-seo`, `/services/aeo-consulting`, `/industries/saas`

## Headline finding: the h2→h1 heading change is NOT live yet — no regression, because nothing shipped

The user's stated risk ("page-title heading moved from h2 to h1, `.section h2` widened to `.section h1, .section h2`, styling should be unchanged") was checked against **production** (`www.aeorank.tech`) and against the **actual working tree** by running `next dev` locally, since `git log origin/main..HEAD` showed the repo is 2 commits ahead of `origin/main` (unpushed):

- Commit `59eb69f "Give every page an h1 and a social preview card"` (current HEAD, committed today) contains exactly the change described.
- `git fetch origin` confirms `origin/main` is still at `d0cab1d`; the h1 commit has **not been pushed**, so Vercel/production has not rebuilt it.
- Verified via `curl`: production HTML for `/blog/aeo-vs-seo`, `/services/aeo-consulting`, `/industries/saas` still opens each page's document outline with `<h2 style="margin-bottom:18px">...` — no `<h1>` anywhere on those three templates. Only `/` (home) has an `<h1>` in production, matching the commit message's own claim that "31 of 32 pages had no h1 at all."

**So there is nothing to regress on production today** — visually production is unchanged because the change simply isn't there yet.

To actually de-risk the change before you push, I ran `npm run dev` (local Next.js server) and rendered the new markup+CSS live:

| Page | Element | Local (new, h1) | Production (old, h2) |
|---|---|---|---|
| services/aeo-consulting | font-size desktop | 48px | 48px |
| services/aeo-consulting | font-size mobile | 30px | 30px |
| services/aeo-consulting | text-align | center | center |
| services/aeo-consulting | font-weight | 800 | 800 |
| services/aeo-consulting | `.accent` span | `linear-gradient(135deg, #f2a83b 0%, #d97706 100%)`, `background-clip:text`, `-webkit-text-fill-color:transparent` | same |
| industries/saas | same checks | identical match | identical match |
| blog/aeo-vs-seo | same checks (no `.accent` span on this template, expected — title is plain) | identical match | identical match |

Screenshot comparison (byte-for-byte visual match, `services/aeo-consulting` desktop fold, local-with-h1 vs production-with-h2):
- `LOCAL-services-aeo-consulting-desktop-fold.png` vs `services-aeo-consulting-desktop-fold.png` — pixel-identical hero: "Strategic **AEO Consulting** for In-House Teams" at 48px/800 weight, centered, with "AEO Consulting" rendered in the amber gradient accent.

**Conclusion: the CSS widening works correctly. When you push, the h1 will render at the same size, centering, weight, and amber gradient accent as the h2 did. No visual regression detected in the new markup.** This was verified on both desktop (1440x900) and mobile (390x844) for all three templates that carry the changed heading.

One pre-existing gap the commit message itself calls out and now fixes: production currently ships **zero `<h1>` elements** on `/blog/aeo-vs-seo`, `/services/aeo-consulting`, and `/industries/saas` — worth pushing promptly since it's a real (if minor) on-page SEO/AEO gap in the interim.

Action needed from you: `git push` the 2 pending commits (`59eb69f`, `d0cab1d`) to deploy the fix — nothing further to fix in the code itself based on this visual check.

## Above-the-fold assessment

**Home (`/`)**
- Desktop: H1 ("Rank in AI Answers via Reddit signals"), subhead, both CTAs ("Get Started", "Book a Call"), and the AI Visibility Score dashboard graphic are all visible without scrolling. Clean, no overlap.
- Mobile: H1, subhead, and both CTAs are visible in the first viewport; the dashboard card starts to peek in at the very bottom edge. Good primary-CTA visibility.

**Blog / Services / Industries (all three)**
- Desktop: breadcrumb, eyebrow label, H1/H2 title, subhead, and primary + secondary CTA all sit above the fold at 1440x900.
- Mobile: same content stacks above the fold at 390x844 with a "Get Started" CTA visible near the top and (on services/industries) a second CTA visible right at/just past the fold edge.
- No layout shift observed: measured Cumulative Layout Shift via `PerformanceObserver` on load for all four URLs — CLS was 0 on home/blog/industries and 0.00015 on services (effectively zero; well under the 0.1 "good" threshold everywhere).

## Mobile responsiveness

- No horizontal scroll on any of the 4 pages at 390px width (`scrollWidth === clientWidth === 390` measured via DOM on all four).
- Full-page mobile renders (`industries-saas-mobile.png`, others) show clean single-column stacking, no overlapping elements, no cut-off text.
- Header is intentionally minimal (`components/Header.js`): logo + auth/CTA only, no page-nav links. At ≤768px, `.header-link` (the "Log in" / "Book a Call" text links) is set to `display: none` via CSS, leaving only the "Get Started" button in the mobile header. There is no hamburger menu because there is no nav-links menu to collapse — this is by design, not a broken hamburger. Page-to-page navigation on mobile is only available via footer links and in-page breadcrumbs.

## Tap-target sizing (mobile, 390px)

Several existing (pre-dating today's change) touch targets are smaller than the 44–48px recommended minimum:
- Footer links (Blog, FAQ, Contact, About, Privacy, Terms): full-width anchors but only ~22px tall (`.footer-col a` has no vertical padding, just `font-size: 14px` line height + a 10px column gap). Present on every page's footer, both desktop and mobile.
- Breadcrumb-style header links on blog/services/industries mobile pages ("Home", "Blog", "Services" etc.): ~16–20px tall.
- Primary/secondary CTAs (Get Started, Book a Call, Book a Free Audit, etc.) are all comfortably sized (48–60px tall) and not an issue.

These are pre-existing, unrelated to the h1/CSS change — flagging as a minor accessibility follow-up, not a regression from today's edit.

## Screenshots captured

All saved to `/Users/ilyas/Downloads/site aeorank/aeorank/www.aeorank.tech-audit/screenshots/`:
- `{page}-desktop.png` / `{page}-mobile.png` — full-page captures, 1440x900 / 390x844
- `{page}-desktop-fold.png` / `{page}-mobile-fold.png` — viewport-only (above-the-fold) captures
- `LOCAL-{page}-desktop-fold.png` / `LOCAL-{page}-mobile-fold.png` for the three heading-affected templates (blog/aeo-vs-seo, services/aeo-consulting, industries/saas) — rendered from the **local, unpushed** working tree to verify the new h1 markup before deploy

where `{page}` is one of: `home`, `blog-aeo-vs-seo`, `services-aeo-consulting`, `industries-saas`.
