# Performance Re-Measure — Pass 2 (gtag lazyOnload change)

Status: COMPLETE. Lab data only (Lighthouse 13.5.0 CLI, mobile form factor,
default simulated throttling, performance category). PageSpeed Insights API
and CrUX API are not usable in this environment (no `GOOGLE_API_KEY`
configured, PSI quota errors) — every number below is **lab data**, not field
data. 3 runs per URL, median reported (n=3), plus min-max range to show
run-to-run noise.

## The change under test

`gtag.js` moved from `strategy="afterInteractive"` to `strategy="lazyOnload"`.
Verified independently in this pass, inside the Lighthouse traces themselves
(not just the requester's separate Playwright check): across **all 18 runs on
all 6 pages**, the `googletagmanager.com/gtag/js` request's start time came
**after** the page's `load` event (`observedLoad`) in every single run. So the
deferral is holding consistently, confirmed from a second, independent
measurement source.

## Before / after table (medians)

| Page | Metric | Pass 1 (n=1) | Pass 2 median (n=3) | Pass 2 range | Δ | Verdict |
|---|---|---|---|---|---|---|
| `/` | LCP | 2579ms | 2409ms | 2298–2826ms | −170ms (−7%) | **within noise** (spread 528ms > delta) |
| `/` | TBT | 190ms | 321ms | 314–1253ms | +131ms | **noisy, possibly worse** (see note) |
| `/` | FCP | 1240ms | 1427ms | — | +187ms | within noise |
| `/blog/aeo-vs-seo` | LCP | 5165ms (POOR) | 2773ms | 2205–3382ms | **−2392ms (−46%)** | **REAL improvement** |
| `/blog/aeo-vs-seo` | TBT | 206ms | 200ms | 192–267ms | −6ms | flat |
| `/blog/aeo-vs-seo` | FCP | 2714ms | 1005ms | — | **−1709ms (−63%)** | REAL improvement |
| `/services/aeo-consulting` | LCP | 5210ms (POOR) | 2901ms | 2893–2926ms | **−2309ms (−44%)** | **REAL improvement, high confidence** (33ms spread) |
| `/services/aeo-consulting` | TBT | 215ms | 226ms | 171–245ms | +11ms | flat |
| `/services/aeo-consulting` | FCP | 2821ms | 1026ms | — | **−1795ms (−64%)** | REAL improvement |
| `/industries/saas` | LCP | 2526ms | 2713ms | 2052–2922ms | +187ms | within noise |
| `/industries/saas` | TBT | 475ms | 171ms | 145–198ms | **−304ms (−64%)** | **REAL improvement, high confidence** (53ms spread) |
| `/industries/saas` | FCP | 972ms | 988ms | — | +16ms | flat |
| `/pricing` (new) | LCP / TBT / FCP | n/a | 2858ms / 220ms / 1006ms | LCP 2806–2874ms | — | no baseline |
| `/blog/reddit-ai-visibility-guide` (new) | LCP / TBT / FCP | n/a | 2718ms / 224ms / 985ms | LCP 2635–2752ms | — | no baseline |

CLS was 0.000 on every run, every page — no regression, no shift-related issue.

## Verdict: is the improvement real or noise?

**Real, on the two pages that mattered most.** `/blog/aeo-vs-seo` and
`/services/aeo-consulting` were the two POOR-LCP pages last pass (>4000ms).
Both now median around 2.7-2.9s — a 44-46% LCP drop and 63-64% FCP drop. This
is not noise:
- `aeo-consulting`'s three runs landed at 2893/2926/2901ms — a 33ms spread.
  You cannot get a 2.3s improvement from measurement jitter that tight.
- `aeo-vs-seo`'s worst run (3382ms) is still 35% faster than the previous
  single-run POOR result (5165ms).
- Both pages moved out of the "Poor" LCP band (>4000ms) into "Needs
  Improvement" (2500-4000ms). Neither is at "Good" (≤2500ms) yet, so there is
  more headroom, but the tier change (Poor → Needs Improvement) is real and
  attributable to the gtag change: these were the two heaviest/slowest pages
  and gtag was previously in the render-blocking path on first load.

**Homepage and `/industries/saas` LCP: not distinguishable from noise on this
pass.** Both showed 3-run spreads (528ms and 870ms respectively) larger than
the measured delta (170ms and 187ms). Consistent with the documented
0.6-2.6s mobile LCP volatility — need more runs or field data (CrUX) to call
these two either way. They were already in the "Good"/borderline-Good range
before the change, so there wasn't much headroom for gtag removal to matter
as much as on the two POOR pages.

**`/industries/saas` TBT: real, large improvement** (475ms → 171ms median,
tight 145-198ms range, -64%). This page previously had the worst TBT of the
set; deferring gtag's execution appears to have removed a real main-thread
cost here.

**Homepage TBT: a new signal worth watching, not yet confirmed.** Two of
three runs landed at 314-321ms (already above the previous single-run
190ms), and one run spiked to 1253ms. Likely explanation: `lazyOnload`
changes *when* gtag's ~526KB (uncompressed) script parses/executes, but not
*whether* it executes — and on this run it still fell inside the
Time-to-Interactive window Lighthouse uses for the TBT calculation (home
run1's `interactive` metric was 4799ms), so a heavy parse/eval task after
`load` can still get counted as blocking time. This doesn't affect LCP (which
fires before gtag now on every run, confirmed above), but it means deferring
load timing didn't fully remove gtag's CPU cost, only moved it later — flag
for a follow-up pass with more homepage runs before concluding it's a
regression.

## Page weight / third-party bytes

Total page weight is essentially **unchanged**: 532-548KB across all 6 pages
in pass 2, matching pass 1's reported ~530-550KB range. Request counts also
unchanged (23-27 vs previous 23-29). This is expected and not a red flag:
`lazyOnload` **defers** the script, it doesn't remove it — the same ~177KB
transfer (526KB uncompressed) for `gtag/js` plus a small GA4 collect beacon
shows up on every single page in every run. What changed is *when* it loads
relative to `load`/LCP, not the total bytes shipped. If the goal is to cut
total transferred weight (not just unblock LCP), gtag would need to be
removed, self-hosted/minified, or loaded via a lighter GA4 stub — that is a
separate, further optimization not covered by the `lazyOnload` change already
shipped.

## Recommendations (prioritized)

1. **Keep the `lazyOnload` change** — it delivered a real, sizeable LCP/FCP
   win on the two previously-POOR pages and is confirmed holding on 100% of
   lab runs across all 6 pages tested.
2. **Re-run homepage and `/industries/saas` with more samples (5-10 runs)**
   before drawing conclusions on LCP or TBT for those two — current 3-run
   spreads exceed the observed deltas.
3. **Investigate the homepage TBT outlier** (1253ms on one run) — check
   whether gtag's parse/execute is landing inside a long task window;
   consider `requestIdleCallback`-gating the GA4 initial `page_view` call, or
   splitting gtag load further behind a scroll/interaction trigger since
   analytics does not need to fire in the first few seconds.
4. **If total page weight reduction is a goal**, that requires a separate
   change (self-host/minify gtag, or swap to a lighter analytics beacon) —
   `lazyOnload` alone will not reduce the ~177KB gtag transfer, only its
   timing.
5. **aeo-vs-seo and aeo-consulting are still "Needs Improvement," not
   "Good"** on LCP (2.7-2.9s median) — next lever is likely image/hero
   optimization or TTFB on those two pages, now that the gtag render-block is
   gone.
6. Validate all of the above against **CrUX field data** once a
   `GOOGLE_API_KEY` is available — lab data (this report) uses simulated
   throttling on a single machine and can diverge from real-user 75th
   percentile numbers.

## Method notes

- Lighthouse 13.5.0 CLI, `--only-categories=performance`,
  `--chrome-flags="--headless=new"`, default mobile preset + simulated
  throttling, 3 runs per URL (18 total), run sequentially, no other load on
  the machine during the run.
- Medians computed from LCP/TBT/FCP/CLS `numericValue` in each run's
  `audits`; page weight from `total-byte-weight`; third-party bytes from
  `network-requests` filtered to non-`aeorank.tech` origins;
  gtag-attributable bytes filtered to `googletagmanager.com` /
  `google-analytics.com`.
- gtag-vs-load ordering was checked directly against each run's
  `audits.metrics` `observedLoad` value and the gtag request's
  `rendererStartTime` from `audits.network-requests` — this is the trace's
  real (unthrottled) timeline, independent of the simulated/throttled LCP
  numbers reported in the table above.
- PageSpeed Insights API and CrUX API calls were not attempted repeatedly —
  per instructions, both are known to fail in this environment
  (no API key) and were skipped to conserve turns.
