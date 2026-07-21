import ScrollReveal from "./ScrollReveal";
import AnimatedCounter from "./AnimatedCounter";

// Deliberately not a fake "18,000+ creators" trust-stats section — this
// platform is brand new. Early-access/founding-creator framing works FOR
// a young platform instead of requiring inflated numbers to feel
// credible. The one number shown (posterCount) is real, from the database.
export default function FoundingBanner({ posterCount }) {
  return (
    <section className="section section-alt">
      <div className="container">
        <ScrollReveal>
          <span className="section-tag">( join early )</span>
          <h2>
            Be one of the first to earn with <span className="accent">CrewQuest</span>
          </h2>
          <p className="section-sub">
            You'd be founding creator <AnimatedCounter value={posterCount + 1} prefix="#" /> — early
            creators get first pick of new missions as the platform grows.
          </p>
        </ScrollReveal>

        <div className="cq-founding-grid">
          <ScrollReveal delay={0}>
            <div className="card cq-founding-card">
              <div className="cq-founding-card-icon">🎯</div>
              <div className="cq-founding-card-title">Real missions</div>
              <div className="cq-founding-card-desc">
                Every mission is a real posting or commenting task — no filler.
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <div className="card cq-founding-card">
              <div className="cq-founding-card-icon">💸</div>
              <div className="cq-founding-card-title">Fast, low-minimum payouts</div>
              <div className="cq-founding-card-desc">
                Withdraw once you've earned $10 — no waiting for a huge balance to cash out.
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <div className="card cq-founding-card">
              <div className="cq-founding-card-icon">🌱</div>
              <div className="cq-founding-card-title">Grow with us from day one</div>
              <div className="cq-founding-card-desc">
                More platforms are launching soon — early creators get first access.
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
