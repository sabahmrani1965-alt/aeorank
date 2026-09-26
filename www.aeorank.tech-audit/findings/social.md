# Social / Link Previews

## High: og:image missing on all 32 pages

No page declares `og:image`. Every link to aeorank.tech — shared in Slack,
Discord, X, LinkedIn, iMessage, or pasted into an AI chat — renders as a
bare text link with no preview card.

`twitter:card` is also missing on 6 pages.

Fix: Next.js App Router generates these from `opengraph-image.tsx` per route,
or a single default in the root layout plus per-post images for the blog.
