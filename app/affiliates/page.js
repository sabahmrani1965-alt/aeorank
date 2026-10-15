import Link from "next/link";
import MarketingLayout from "@/components/MarketingLayout";
import ContactForm from "@/components/ContactForm";

const URL = "https://www.aeorank.tech/affiliates";

export const metadata = {
  title: "Affiliate Program: 30% Recurring Commission | AEOrank",
  description:
    "Refer customers to AEOrank and earn 30% of every payment they make for their first 12 months. Apply in two minutes.",
  alternates: { canonical: URL },
  openGraph: {
    title: "AEOrank Affiliate Program: 30% recurring",
    description: "Earn 30% of every payment your referrals make for 12 months.",
    type: "website",
    url: URL,
    images: ["/opengraph-image"],
  },
};

const STEPS = [
  { title: "Apply", body: "Tell us who your audience is. We reply by email, usually within a few days." },
  { title: "Share your link", body: "Once approved you get a link like aeorank.tech/?via=yourcode. Visits are tracked for 60 days." },
  { title: "Earn 30% for a year", body: "You earn 30% of every payment each customer you refer makes, for their first 12 months." },
];

const FAQ = [
  {
    q: "How much can I earn?",
    a: "30% of every payment a referred customer makes in their first 12 months. On the Lite plan ($199/mo) that is $59.70 a month per customer; on Max ($449/mo) it is $134.70.",
  },
  {
    q: "How long does the referral last?",
    a: "Your link sets a cookie for 60 days. If the visitor creates an AEOrank account in that window, the account is credited to you. The first affiliate link a visitor used is the one that counts.",
  },
  {
    q: "When and how am I paid?",
    a: "Commission is calculated on payments that have actually cleared, net of refunds. Payout method and schedule are agreed with you when you're approved.",
  },
  {
    q: "Who is a good fit?",
    a: "Newsletters, communities, agencies and creators whose audience is SaaS founders and marketers interested in Reddit and AI search.",
  },
  {
    q: "Are there any rules?",
    a: "You can't earn commission on your own account, and you can't bid on AEOrank brand terms in paid search or present yourself as AEOrank.",
  },
];

export default function Affiliates() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <MarketingLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <section className="section">
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <span className="section-tag">( affiliates )</span>
          <h1>
            Earn <span className="accent">30% recurring</span> for a year
          </h1>
          <p className="section-sub">
            Refer customers to AEOrank and earn 30% of every payment they make for their first 12
            months.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <div className="tool-grid">
            {STEPS.map((s, i) => (
              <div key={s.title} className="card tool-card">
                <strong>
                  {i + 1}. {s.title}
                </strong>
                <span>{s.body}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" id="apply">
        <div className="container-narrow">
          <h2 style={{ textAlign: "center" }}>Apply</h2>
          <p className="section-sub">
            Tell us about your audience in the message: where you publish, roughly how many people
            read it, and who they are.
          </p>
          <ContactForm defaultPlan="affiliate" />
        </div>
      </section>

      <section className="section">
        <div className="container-narrow">
          <h2 style={{ textAlign: "center" }}>Questions</h2>
          {FAQ.map((f) => (
            <details key={f.q} className="card" style={{ marginBottom: 10 }}>
              <summary style={{ fontWeight: 600, cursor: "pointer" }}>{f.q}</summary>
              <p style={{ color: "var(--text-dim)", marginTop: 10 }}>{f.a}</p>
            </details>
          ))}
          <p style={{ textAlign: "center", marginTop: 24, color: "var(--text-dim)" }}>
            See what you'd be promoting: <Link href="/pricing">plans and pricing</Link>.
          </p>
        </div>
      </section>
    </MarketingLayout>
  );
}
