import MarketingLayout from "@/components/MarketingLayout";
import Link from "next/link";
import { industries } from "./[slug]/page";

// The index that /industries/* breadcrumbs pointed at before it existed —
// their middle crumb was aimed at the homepage. Nothing on the site linked
// to the four industry pages either, so they were reachable only through
// the XML sitemap.

export const metadata = {
  title: "Industries: AEOrank",
  description:
    "Answer Engine Optimization built for B2B SaaS, startups, software companies and tech/IT services. The AI queries that matter differ by industry, and so does the work.",
  alternates: { canonical: "https://www.aeorank.tech/industries" },
  openGraph: {
    title: "Industries: AEOrank",
    description:
      "Answer Engine Optimization built for B2B SaaS, startups, software companies and tech/IT services.",
    type: "website",
    url: "https://www.aeorank.tech/industries",
    images: ["/opengraph-image"],
  },
};

const ORDER = ["saas", "startups", "software", "tech-it"];

export default function Industries() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.aeorank.tech" },
      { "@type": "ListItem", position: 2, name: "Industries", item: "https://www.aeorank.tech/industries" },
    ],
  };

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: ORDER.map((slug, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: industries[slug].title,
      url: `https://www.aeorank.tech/industries/${slug}`,
    })),
  };

  return (
    <MarketingLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />

      <section className="section">
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <span className="section-tag">( industries )</span>
          <h1>
            The queries that matter <span className="accent">differ by industry.</span>
          </h1>
          <p className="section-sub">
            A SaaS buyer comparing tools and a CIO vetting a vendor ask AI very
            different questions. These pages set out how the work changes for
            each, and which queries we go after first.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div
            className="services-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}
          >
            {ORDER.map((slug) => {
              const industry = industries[slug];
              return (
                <Link
                  key={slug}
                  href={`/industries/${slug}`}
                  className="card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    textDecoration: "none",
                  }}
                >
                  <span className="section-tag" style={{ alignSelf: "flex-start" }}>
                    ( {industry.tag} )
                  </span>
                  <h2 style={{ fontSize: 21, fontWeight: 700, color: "var(--text)", textAlign: "left" }}>
                    {industry.title}
                  </h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
                    {industry.intro}
                  </p>
                  <span style={{ color: "var(--accent)", fontWeight: 600, marginTop: "auto" }}>
                    Read more →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
