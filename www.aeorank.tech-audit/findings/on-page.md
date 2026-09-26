# On-Page SEO

## Critical: 31 of 32 pages have no H1

Only the homepage has an `<h1>`. Every other page starts its outline at `<h2>`.
This is in the server-rendered HTML, so it is not a hydration artifact.

Example — /blog/aeo-vs-seo:
    heading tags: h1=0, h2=2, h3=5, h4=5
    the article's own title, "AEO vs SEO: Stop Pretending They're the Same Job",
    is marked up as <h2>

Affected: all 5 service pages, all 4 industry pages, all 16 blog posts,
/services, /blog, /about, /contact, /privacy, /terms.

Fix: promote each page's main title to `<h1>` and shift the rest down one level.
Most likely a single shared heading component or MDX template.

## Good
- Every page has a title and a meta description
- Every page has a canonical
- No `noindex` anywhere unintended
