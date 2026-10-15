import Link from "next/link";
import MarketingLayout from "@/components/MarketingLayout";

const SITE_URL = "https://www.aeorank.tech";

export const TOOLS = [
  {
    slug: "reddit-markdown-formatter",
    name: "Reddit Markdown Formatter",
    blurb: "Write Reddit markdown and see exactly how it will render, then copy it.",
  },
  {
    slug: "reddit-title-checker",
    name: "Reddit Title Checker",
    blurb: "Check a post title against Reddit's limits and the patterns that get ignored or removed.",
  },
  {
    slug: "reddit-self-promotion-checker",
    name: "Reddit Self-Promotion Checker",
    blurb: "See whether a comment mentioning your product reads as help or as an ad, and whether it discloses.",
  },
];

export function toolMetadata(slug, title, description) {
  const url = `${SITE_URL}/tools/${slug}`;
  return {
    title: `${title} (Free) | AEOrank`,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${title} (Free)`, description, type: "website", url, images: ["/opengraph-image"] },
  };
}

/**
 * Shared shell for the free tools: the tool itself first, then the guide
 * text and FAQ that make the page worth landing on. Every tool runs in the
 * browser; nothing typed is sent anywhere.
 */
export default function ToolPage({ slug, title, intro, children, guide = [], faq = [] }) {
  const url = `${SITE_URL}/tools/${slug}`;
  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: title,
    url,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Free tools", item: `${SITE_URL}/tools` },
      { "@type": "ListItem", position: 3, name: title, item: url },
    ],
  };
  const faqLd = faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }
    : null;

  return (
    <MarketingLayout>
      {[appLd, crumbsLd, faqLd].filter(Boolean).map((ld, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      ))}
      <section className="section" style={{ paddingBottom: 30 }}>
        <div className="container-narrow">
          <nav aria-label="Breadcrumb" className="tool-crumbs">
            <Link href="/">Home</Link> / <Link href="/tools">Free tools</Link> / <span>{title}</span>
          </nav>
          <span className="section-tag">( free tool )</span>
          <h1 style={{ textAlign: "center" }}>{title}</h1>
          <p className="section-sub">{intro}</p>
          {children}
          <p className="tool-privacy">Runs in your browser. Nothing you type is sent to AEOrank or anyone else.</p>
        </div>
      </section>

      {guide.length > 0 && (
        <section className="section" style={{ paddingTop: 20 }}>
          <div className="container-narrow tool-guide">
            {guide.map((g) => (
              <div key={g.heading} style={{ marginBottom: 30 }}>
                <h2>{g.heading}</h2>
                {g.body}
              </div>
            ))}
          </div>
        </section>
      )}

      {faq.length > 0 && (
        <section className="section section-alt">
          <div className="container-narrow">
            <h2 style={{ textAlign: "center" }}>Questions</h2>
            {faq.map((f) => (
              <details key={f.q} className="card" style={{ marginBottom: 10 }}>
                <summary style={{ fontWeight: 600, cursor: "pointer" }}>{f.q}</summary>
                <p style={{ color: "var(--text-dim)", marginTop: 10 }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="container-narrow">
          <h2 style={{ textAlign: "center" }}>More free Reddit tools</h2>
          <div className="tool-grid">
            {TOOLS.filter((t) => t.slug !== slug).map((t) => (
              <Link key={t.slug} href={`/tools/${t.slug}`} className="card tool-card">
                <strong>{t.name}</strong>
                <span>{t.blurb}</span>
              </Link>
            ))}
          </div>
          <div className="card" style={{ marginTop: 28, textAlign: "center" }}>
            <p style={{ color: "var(--text-dim)", marginBottom: 14 }}>
              Does ChatGPT name your brand when buyers ask about your category? Check it free.
            </p>
            <Link href="/free-ai-visibility-checker" className="btn btn-primary">
              Free AI visibility check →
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
