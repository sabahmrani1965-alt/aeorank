import MarketingLayout from "@/components/MarketingLayout";
import PricingTiers from "@/components/PricingTiers";
import Link from "next/link";
import { CALENDLY_URL } from "@/lib/links";

// /pricing did not exist. The subscription tiers lived only behind the
// product — dashboard billing, onboarding, and the report page — so a buyer
// searching "aeorank pricing" had nowhere to land, and the self-serve price
// was visible only after signing up.
//
// PricingTiers is reused rather than copied, so the numbers stay in one
// place: lib/stripe.js PLANS is the source, the component renders it.

const SITE_URL = "https://www.aeorank.tech";

export const metadata = {
  title: "Pricing: AEOrank",
  description:
    "AEOrank pricing: Lite $199/mo, Pro $299/mo, Max $449/mo, each with a 7-day free trial and monthly credits included. Managed AEO services from $500.",
  alternates: { canonical: `${SITE_URL}/pricing` },
  openGraph: {
    title: "Pricing: AEOrank",
    description:
      "Lite $199/mo, Pro $299/mo, Max $449/mo, each with a 7-day free trial and monthly credits included.",
    type: "website",
    url: `${SITE_URL}/pricing`,
    images: ["/opengraph-image"],
  },
};

// Per-action rates, taken from lib/stripe.js PLANS so this table cannot
// drift from what Stripe actually charges.
const USAGE = [
  { label: "Comment placed in a thread", lite: "$10", pro: "$7", max: "$5" },
  { label: "Post published", lite: "$20", pro: "$15", max: "$10" },
  { label: "Upvote", lite: "$0.10", pro: "$0.10", max: "$0.10" },
  { label: "Thread scans", lite: "Every 2 weeks", pro: "Weekly", max: "Daily" },
  { label: "Brand & competitor mentions", lite: "Weekly", pro: "Daily", max: "Daily" },
  { label: "Keywords monitored", lite: "50", pro: "75", max: "100" },
  { label: "Brands connected", lite: "3", pro: "6", max: "10" },
  { label: "Team members", lite: "2", pro: "Unlimited", max: "Unlimited" },
];

export default function Pricing() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Pricing", item: `${SITE_URL}/pricing` },
    ],
  };

  return (
    <MarketingLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <section className="section">
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <span className="section-tag">( pricing )</span>
          <h1>
            Pay for the work, <span className="accent">not the dashboard.</span>
          </h1>
          <p className="section-sub">
            Every plan includes monthly credits and a 7-day free trial. Credits pay
            for the things that actually move citations — comments, posts, scans —
            so the cost tracks the work rather than a seat count.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <PricingTiers />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <h2 style={{ fontSize: 24, marginBottom: 6, textAlign: "left" }}>
            What credits pay for
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 18, lineHeight: 1.7 }}>
            Rates fall as the plan goes up. Monthly credits are included in the plan
            price, and top-ups are available at $1 per credit, with bonus credits
            from 500 upward.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15.5 }}>
              <thead>
                <tr>
                  {["", "Lite", "Pro", "Max"].map((h, i) => (
                    <th
                      key={h || i}
                      style={{
                        textAlign: h ? "center" : "left",
                        padding: "10px 12px",
                        borderBottom: "1px solid var(--accent)",
                        color: "var(--text)",
                        fontWeight: 700,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {USAGE.map((r) => (
                  <tr key={r.label}>
                    <td
                      style={{
                        padding: "10px 12px",
                        borderBottom: "1px solid var(--border)",
                        color: "var(--text-dim)",
                      }}
                    >
                      {r.label}
                    </td>
                    {[r.lite, r.pro, r.max].map((v, i) => (
                      <td
                        key={i}
                        style={{
                          padding: "10px 12px",
                          borderBottom: "1px solid var(--border)",
                          color: "var(--text-dim)",
                          textAlign: "center",
                        }}
                      >
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <h2 style={{ fontSize: 24, marginBottom: 6, textAlign: "left" }}>
            Would you rather we ran it?
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.7 }}>
            The plans above are the self-serve product: you run the work with our
            tooling. If you would rather hand it over, the{" "}
            <Link href="/services" style={{ color: "var(--accent)" }}>
              managed services
            </Link>{" "}
            start at $500 one-time for an audit and run to $3,000/mo for full
            management.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/signup" className="btn btn-primary">
              Start free trial →
            </Link>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              Talk to us first
            </a>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
