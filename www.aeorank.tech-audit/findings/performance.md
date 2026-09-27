# Performance / Core Web Vitals — www.aeorank.tech

**Status: PARTIAL — stopped early on coordinator instruction (turn-limit). All numbers below are real measurements, not estimates. Field-data attempts are documented explicitly as failed/unavailable; nothing here should be read as CrUX/field data.**

## Data sources and their limits (read this first)

- **PageSpeed Insights API**: failed on every call with `PSI rate limit exceeded (240 QPM / 25,000 QPD). Wait and retry.` — i.e. a quota/rate-limit error, consistent with what another agent in this same audit run reported. No PSI lab or field data was obtained this way.
- **CrUX API direct**: failed with `API key required. Use --api-key or configure GOOGLE_API_KEY.` — no Google API key is configured in this environment, so direct CrUX field lookups were not possible either.
- **Net result: no field data (real Chrome User Experience / 75th-percentile data) was obtained for this site at all.** Everything below is **lab data** from single-run local tests. Given aeorank.tech is a low-traffic new site, it may not even have a CrUX bucket yet — that could not be confirmed without a key.
- **Lighthouse 13.5.0** was run locally via `npx lighthouse@13.5.0` (confirmed working in this environment — network access allowed the package to install), one run per URL per form factor (mobile: Moto G power emulation, 4x CPU slowdown, simulated throttling; desktop: Lighthouse's desktop preset, no throttling). This is the primary source below.
- A **custom Playwright/CDP script** (PerformanceObserver for LCP/FCP/CLS/long-tasks + Network domain resource capture) was used to cross-check page weight and to break down third-party byte cost, because Lighthouse's own `third-party-summary` audit came back empty on this site (see "Not measured" below).
- Single-run lab numbers have real run-to-run variance (observed first-hand: an early throwaway measurement of the homepage swung from ~0.6s to ~2.6s mobile LCP between runs due to network/CPU jitter on this machine). Treat the figures as indicative of order of magnitude, not as a precise 75th-percentile verdict.

## Core Web Vitals — Lighthouse lab data (one run each)

All times in ms unless noted. CWV thresholds: LCP good ≤2500ms, needs-improvement ≤4000ms, poor >4000ms. CLS good ≤0.1. TBT (INP lab proxy) good ≤200ms is a reasonable rule of thumb even though TBT and INP are not the same metric.

| Page | Form factor | Perf score | LCP | CLS | TBT | FCP | TTI (Interactive) | Speed Index |
|---|---|---|---|---|---|---|---|---|
| `/` | mobile | 94 | **2579ms** (borderline Needs Improvement, just over the 2500ms line) | 0 | 190ms | 1240ms | 4200ms | 1692ms |
| `/` | desktop | 100 | 581ms (Good) | 0 | 0ms | 357ms | 581ms | 659ms |
| `/blog/aeo-vs-seo` | mobile | 71 | **5165ms (Poor)** | 0 | 206ms | 2714ms | 5165ms | 4343ms |
| `/blog/aeo-vs-seo` | desktop | 100 | 593ms (Good) | 0 | 0ms | 313ms | 593ms | 470ms |
| `/services/aeo-consulting` | mobile | 72 | **5210ms (Poor)** | 0 | 215ms | 2821ms | 5210ms | 3091ms |
| `/services/aeo-consulting` | desktop | 98 | 1039ms (Good) | 0 | 36ms | 571ms | 1102ms | 620ms |
| `/industries/saas` | mobile | 85 | **2526ms** (borderline Needs Improvement) | 0 | **475ms (Needs Improvement — highest TBT of the four)** | 972ms | 4529ms | 1100ms |
| `/industries/saas` | desktop | 100 | 708ms (Good) | 0 | 0ms | 389ms | 708ms | 544ms |

**Read on CWV pass/fail:** On mobile, LCP is at or above the "Good" line on all 4 pages tested, and clearly Poor (>4s) on both `/blog/aeo-vs-seo` and `/services/aeo-consulting`. CLS is 0 everywhere in this lab run (no layout-shift-causing elements were triggered in a single cold load — this does not rule out CLS issues under real user conditions with slower connections/ads, it simply means none appeared in this test). TBT (a rough proxy for INP risk, not INP itself) is under the 200ms "good" rule of thumb on 3 of 4 mobile pages, but `/industries/saas` is notably worse at 475ms. Desktop is comfortably "Good" across the board on every metric for every page — the problem is squarely mobile.

## Page weight (Lighthouse `total-byte-weight`, simulated)

| Page | Total byte weight | Requests (network-requests audit) |
|---|---|---|
| `/` | ~532 KB (mobile run) / ~538 KB (desktop run) | 23 (mobile) / 25 (desktop) |
| `/blog/aeo-vs-seo` | ~545 KB / ~550 KB | 27 / 29 |
| `/services/aeo-consulting` | ~537 KB / ~542 KB | 26 / 28 |
| `/industries/saas` | ~532 KB / ~538 KB | 26 / 28 |

Page weight is modest (all four pages land in a tight 530–550 KB band) and is not, by itself, the main problem — mobile LCP/TBT degradation is more about main-thread work and script execution timing than raw bytes.

## Third-party script cost (Google Tag Manager / gtag, analytics) — Playwright/CDP measurement

Lighthouse's `third-party-summary` audit returned **no items** on any of the 8 runs (empty `details.items`), so it could not be used to quantify third-party cost on this site/run — noted explicitly as a gap. To still answer the question, a custom Playwright/CDP script captured actual network requests and Resource-Timing entries and cross-referenced `Content-Length` response headers (needed because the Resource Timing API zeroes out `transferSize` for cross-origin resources lacking `Timing-Allow-Origin`, which would otherwise make every third-party request look free).

Findings, consistent across all 4 pages (mobile, 4x CPU throttle, single warm-ish run each):

- **`googletagmanager.com/gtag/js?id=G-D8ZMJKS5NF`** (GTM/gtag loader): **~172–173 KB transferred** on every page (176,326–176,586 bytes measured). This is **~33–35% of total page weight** on every page tested — the single largest resource on the site by a wide margin.
- **`google-analytics.com/g/collect`** (GA4 measurement beacon): negligible bytes (a GET beacon, not a document), but showed up with 140–540ms of "duration" in the Resource Timing entries across runs — likely mostly network RTT/queueing rather than main-thread blocking, but it does add a request in the critical early-load window.
- **A first-party-proxied script at `/b873a99fa1e380fa/script.js`** (served from `www.aeorank.tech` itself, brotli-compressed, `cache-control: public, max-age=2678400`, `x-vercel-cache: HIT`): small, on the order of a few KB compressed. This is consistent with an analytics tool (plausibly Vercel Web Analytics, or another tool) proxied through a first-party random-hash path to survive ad-blockers — **I could not conclusively identify which product this is** by content, since the response is brotli-compressed binary and I did not decode it before the turn limit hit. No request to the standard `vitals.vercel-insights.com` or `/_vercel/insights/script.js` endpoints was observed in the captured network log for the homepage, so if this is Vercel Analytics it is being served through a rewrite rather than the default domain.
- Net effect: **third-party payload (GTM alone) is roughly a third of every page's total weight**, and GTM/gtag script parsing lines up with several of the long tasks observed in the raw Playwright run (300–600ms of task duration clustered around the GTM/GA requests in separate diagnostic runs), which is a plausible contributor to the mobile TBT figures above, though Lighthouse's own attribution audit did not break this out by entity on this run.

## Render-blocking resources

Lighthouse's `render-blocking-resources` audit returned **no items** on any of the 8 runs (i.e., nothing crossed Lighthouse's savings threshold to flag). A separate Resource-Timing-based check (via the custom Playwright script) on the homepage found:
- `_next/static/css/<hash>.css` marked with `renderBlockingStatus: "blocking"` (the single Next.js CSS bundle — normal and typically cheap for a bundle this size).
- `_next/static/chunks/polyfills-<hash>.js` loaded without `async`/`defer` (a Next.js-generated legacy-browser polyfill; typically tiny and effectively free on modern browsers, but technically render-blocking by attribute).

Neither is expected to be a significant contributor given the small page weight; they're noted for completeness rather than flagged as urgent.

## Not measured / could not finish (explicitly listed, not estimated)

- **Field data (CrUX / PSI 75th percentile) for any of the 4 URLs** — blocked by PSI quota exhaustion and missing `GOOGLE_API_KEY` for direct CrUX access. This means the CWV pass/fail table above is a **lab snapshot only** and cannot be presented as the metric Google actually uses to grade the site (75th percentile of real Chrome users). Whether aeorank.tech even has a CrUX data bucket (traffic threshold) was not confirmed.
- **INP itself** — not measurable without field data or real user interaction; only lab proxies (TBT, max-potential-fid) were captured.
- **Repeated/statistically-robust lab runs** — each URL/form-factor pair was tested once via Lighthouse. Given observed variance in throwaway trial runs, treat single-run LCP/TBT numbers as order-of-magnitude, not final.
- **Conclusive identification of the `/b873a99fa1e380fa/script.js` first-party analytics script** — flagged above as likely Vercel Analytics or similar, not confirmed by decoded content.
- **Full attribution of main-thread/blocking time to specific third-party scripts via Lighthouse** — the `third-party-summary` audit was empty; only the Playwright/CDP cross-check (byte-level, not blocking-time-level) was completed.
- No pages beyond the 4 requested (`/`, `/blog/aeo-vs-seo`, `/services/aeo-consulting`, `/industries/saas`) were tested.
- No prioritized remediation plan was drafted before the stop instruction arrived — the raw diagnostic data above is the deliverable for this pass; recommendations (e.g., loading GTM via a facade/consent-gated defer, lazy-loading the gtag beacon, investigating mobile LCP render-delay specifically on the blog/services templates) were not written up in detail and should be treated as a follow-up.

## Raw data locations (for follow-up)

- Lighthouse JSON (8 files: 4 URLs × mobile/desktop): `/private/tmp/claude-501/-Users-ilyas-Downloads-site-aeorank-aeorank/bf9d9458-cb70-4112-b96d-19e547a4703d/scratchpad/lh_out/`
- Custom Playwright measurement script: `/private/tmp/claude-501/-Users-ilyas-Downloads-site-aeorank-aeorank/bf9d9458-cb70-4112-b96d-19e547a4703d/scratchpad/perf_measure.py`
- Per-URL raw Playwright measurement output: `run1_www_aeorank_tech.json`, `run1_www_aeorank_tech_blog_aeo-vs-seo.json`, `run1_www_aeorank_tech_services_aeo-consulting.json`, `run1_www_aeorank_tech_industries_saas.json` (same scratchpad directory)
- Lighthouse extraction helper: `extract_lh.py` / `lh_summary.json` (same scratchpad directory)

Note: these scratchpad files are session-temporary; if this data needs to persist, copy the JSON out of `/private/tmp/.../scratchpad/` before the session ends.
