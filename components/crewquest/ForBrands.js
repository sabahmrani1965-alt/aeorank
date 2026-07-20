import Link from "next/link";
import ScrollReveal from "./ScrollReveal";

const POINTS = [
  { icon: "🚀", title: "Launch missions", desc: "Generate AI-drafted Reddit replies and posts for your brand, then open them to the CrewQuest creator pool." },
  { icon: "🎯", title: "Real engagement", desc: "Creators post from their own real, verified Reddit accounts — not bots, not throwaway spam accounts." },
  { icon: "👥", title: "Vetted creators", desc: "Every creator's account is checked for account age and karma before they can accept missions." },
];

// Grounded in what actually exists today — no promising a dedicated
// brand analytics dashboard or a submission-approval workflow that isn't
// built (approval here is automatic once a creator submits, not a manual
// review step).
export default function ForBrands() {
  return (
    <section id="for-brands" className="section section-alt">
      <div className="container">
        <ScrollReveal>
          <span className="section-tag">( for brands )</span>
          <h2>Get real Reddit engagement, from real people</h2>
          <p className="section-sub">
            CrewQuest is the creator marketplace behind AEOrank's Reddit visibility engine — brands
            generate missions from their AEOrank account, and creators here complete them.
          </p>
        </ScrollReveal>

        <div className="cq-founding-grid">
          {POINTS.map((p, i) => (
            <ScrollReveal key={p.title} delay={i * 100}>
              <div className="card cq-founding-card">
                <div className="cq-founding-card-icon">{p.icon}</div>
                <div className="cq-founding-card-title">{p.title}</div>
                <div className="cq-founding-card-desc">{p.desc}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={300}>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link href="/apply-poster?as=brand" className="btn btn-primary btn-large">
              Get Started as a Brand →
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
