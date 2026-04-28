import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { CALENDLY_URL } from "@/lib/links";

export const metadata = {
  title: "Contact — AEOrank",
  description: "Get in touch with the AEOrank team about Reddit + AI visibility services.",
};

const PLANS = {
  trial: { label: "1-month trial", price: "$1,000" },
  growth: { label: "Growth", price: "$2,000/mo" },
  boost: { label: "Full Boost", price: "$3,500/mo" },
  enterprise: { label: "Enterprise", price: "Custom" },
  general: { label: "General inquiry" },
};

export default function ContactPage({ searchParams }) {
  const planKey = (searchParams?.plan || "general").toLowerCase();
  const plan = PLANS[planKey] || PLANS.general;

  return (
    <>
      <Header />
      <section className="section">
        <div className="container-narrow">
          <span className="section-tag">( contact )</span>
          <h2 style={{ textAlign: "center" }}>
            Talk to the <span className="accent">AEOrank</span> team
          </h2>
          <p className="section-sub" style={{ marginBottom: 28 }}>
            {planKey === "general"
              ? "Tell us about your brand and what you'd like AI assistants to say about it."
              : <>You're requesting: <strong>{plan.label}{plan.price ? ` — ${plan.price}` : ""}</strong>. Fill in the form and we'll be in touch within one business day.</>
            }
          </p>

          <div
            className="card"
            style={{
              padding: 22,
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                Prefer a quick call?
              </div>
              <div style={{ fontSize: 14, color: "var(--text-dim)" }}>
                Skip the form — book 30 minutes directly on my calendar.
              </div>
            </div>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Book a Call →
            </a>
          </div>

          <div className="card" style={{ padding: 30 }}>
            <ContactForm defaultPlan={planKey} planLabel={plan.label} />
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
