# Technical SEO

## Medium: apex to www is a 307 (temporary)

    http://aeorank.tech   -> 308 -> https://aeorank.tech/
    https://aeorank.tech  -> 307 -> https://www.aeorank.tech/   <-- temporary

A 307 tells crawlers the move may be reversed. The canonical host hop should
be a permanent 308 (or 301).

## Low: common security headers absent
Present: strict-transport-security (max-age=63072000)
Missing: x-frame-options, x-content-type-options, referrer-policy,
content-security-policy. Not ranking factors; good hygiene.

## Good
- All 32 sitemap URLs return 200, no chains, no orphaned redirects
- robots.txt is correct and references the sitemap
- /dashboard, /api, /onboarding disallowed as intended
