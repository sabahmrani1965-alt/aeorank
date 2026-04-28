import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { CALENDLY_URL } from "@/lib/links";

export const metadata = {
  title: "Services — AEOrank",
  description:
    "AEO services for B2B SaaS: entity authority, citation building, schema, content, and full-service management. Built around the work that actually moves AI citations.",
  alternates: { canonical: "https://aeorank.tech/services" },
};

const services = [
  {
    icon: "🧠",
    title: "AEO Management",
    slug: "aeo-management",
    price: "From $3,000/mo",
    blurb:
      "Full-service. We run the whole program — strategy, execution, monitoring — with a senior AEO strategist owning your account.",
    bullets: [
      "Monthly citation audits",
      "Entity work, citation outreach, content",
      "Weekly reporting, monthly reviews",
      "Dedicated strategist",
    ],
  },
  {
    icon: "🎯",
    title: "AEO Consulting",
    slug: "aeo-consulting",
    price: "From $1,500/mo",
    blurb:
      "For teams with strong in-house marketers. We bring the strategy and frameworks; your team executes with our guidance.",
    bullets: [
      "Audit + 12-month roadmap",
      "Team training on AEO",
      "Monthly strategy calls",
      "Quarterly reviews",
    ],
  },
  {
    icon: "🔗",
    title: "Citation Building",
    slug: "citation-building",
    price: "From $1,000/mo",
    blurb:
      "Earned mentions in the specific publications, directories, and analyst sources AI engines actually pull from. Not paid links.",
    bullets: [
      "Publication placements",
      "G2, Capterra, TrustRadius work",
      "Analyst relationships",
      "Citation monitoring",
    ],
  },
  {
    icon: "⚙️",
    title: "Entity Optimization",
    slug: "entity-optimization",
    price: "From $800 one-time",
    blurb:
      "The unsexy foundational work most brands skip. Knowledge graph, Wikidata, schema, consistency across every platform that feeds AI training data.",
    bullets: [
      "Knowledge panel optimization",
      "Wikidata setup",
      "Organization + Product schema",
      "Entity consistency audit",
    ],
  },
  {
    icon: "📊",
    title: "AI Visibility Audit",
    slug: "ai-visibility-audit",
    price: "$500 one-time",
    blurb:
      "A real diagnostic. We test 100+ of your buyer queries live across every major AI engine and tell you where you stand versus competitors.",
    bullets: [
      "100+ query live tests",
      "Share-of-voice benchmarking",
      "Gap analysis",
      "60-minute debrief call",
    ],
  },
];

export default function Services() {
  return (
    <>
      <Header />
      <section className="section">
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <span className="section-tag">( aeo services )</span>
          <h2>
            Five services. One goal: <span className="accent">get you cited.</span>
          </h2>
          <p className="section-sub">
            Every service below is built around something that actually moves AI
            citations. No fluff retainers, no "content strategy" that's just a
            blog calendar. Pick what you need or let us recommend the mix on a
            free call.
          </p>
          <div style={{ marginTop: 28 }}>
            <Link href="/" className="btn btn-primary">
              Start with a Free Report →
            </Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div
            className="services-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {services.map((s) => (
              <div
                key={s.slug}
                className="card"
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    background: "var(--accent-dim)",
                    border: "1px solid var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                  }}
                >
                  {s.icon}
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: "var(--text)" }}>
                  {s.title}
                </h3>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--accent)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {s.price}
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-dim)",
                    lineHeight: 1.65,
                    flex: 1,
                  }}
                >
                  {s.blurb}
                </p>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: 4 }}>
                  {s.bullets.map((b) => (
                    <li
                      key={b}
                      style={{
                        fontSize: 13,
                        color: "var(--text)",
                        padding: "6px 0",
                        borderBottom: "1px solid var(--card-border-soft)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span style={{ color: "var(--accent)", fontSize: 11 }}>
                        ✓
                      </span>{" "}
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/services/${s.slug}`}
                  className="btn btn-ghost"
                  style={{ marginTop: 6, justifyContent: "center", textAlign: "center" }}
                >
                  Learn more →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container-narrow">
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span className="section-tag">( how to choose )</span>
            <h2>Not sure what you need?</h2>
          </div>
          <div
            style={{
              color: "var(--text-dim)",
              fontSize: 16,
              lineHeight: 1.8,
            }}
          >
            <p style={{ marginBottom: 18 }}>
              Most new engagements start with the{" "}
              <strong style={{ color: "var(--text)" }}>AI Visibility Audit</strong>.
              It's a flat $500, takes about two weeks, and you get back a real
              diagnostic of where you stand — not a sales deck dressed as an
              audit. About half of audit clients then decide AEO management
              makes sense. The other half don't, and we're fine with that.
            </p>
            <p style={{ marginBottom: 18 }}>
              If you already know you want to move on AEO and have the budget
              for it,{" "}
              <strong style={{ color: "var(--text)" }}>AEO Management</strong>{" "}
              is the fastest path. Senior strategist, full execution, monthly
              reviews. This is where most of our best work happens.
            </p>
            <p style={{ marginBottom: 18 }}>
              If you have a capable in-house marketing team,{" "}
              <strong style={{ color: "var(--text)" }}>AEO Consulting</strong>{" "}
              often gives better ROI. We provide the strategy and frameworks;
              your team executes. You save money and build internal AEO
              capability.
            </p>
            <p style={{ marginBottom: 28 }}>
              The one-off services (
              <strong style={{ color: "var(--text)" }}>Entity Optimization</strong>,{" "}
              <strong style={{ color: "var(--text)" }}>Citation Building</strong>
              ) are usually for companies that want to tackle a specific
              weakness without committing to a full program. Legitimate, but
              rarely as high-leverage as doing the work together.
            </p>
            <div style={{ textAlign: "center" }}>
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Book a Call to Talk It Through →
              </a>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 1100px) {
          .services-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 700px) {
          .services-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <Footer />
    </>
  );
}
