# Schema / Structured Data

Strongest area of the site. 0 invalid JSON-LD blocks across 32 pages.

    /                  Organization, FAQPage
    /blog/*  (16)      BlogPosting, BreadcrumbList
    /services/* (5)    Service, FAQPage, BreadcrumbList
    /industries/* (4)  BreadcrumbList

## Medium: gaps
- /services, /blog, /about, /contact carry no schema at all
- /industries/* have only BreadcrumbList — no Service or FAQPage, unlike
  /services/*, which are otherwise near-identical page types
- Organization appears only on the homepage
