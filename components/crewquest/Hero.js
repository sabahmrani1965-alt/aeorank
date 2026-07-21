import Link from "next/link";
import ScrollReveal from "./ScrollReveal";

export default function Hero({ liveMissionCount }) {
  return (
    <section className="cq-hero-section">
      <div className="container cq-hero">
      <div className="cq-hero-copy">
        <ScrollReveal>
          <span className="cq-eyebrow">
            <span className="cq-eyebrow-dot" />
            {liveMissionCount > 0
              ? `${liveMissionCount} Reddit mission${liveMissionCount === 1 ? "" : "s"} live today`
              : "New missions posted regularly"}
          </span>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <h1 className="cq-hero-title">
            Complete Missions.
            <br />
            <span className="accent">Get Paid.</span>
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={160}>
          <p className="cq-hero-sub">
            Complete authentic posting and commenting missions on Reddit — from your
            own real account. LinkedIn, X, and Discord missions are coming soon.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={240}>
          <div className="cq-hero-ctas">
            <Link href="/apply-poster" className="btn btn-primary btn-large">
              Start Earning →
            </Link>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={320}>
          <div className="cq-hero-platforms">
            <span>Available on</span>
            <span className="kc-badge kc-badge-available">Reddit</span>
            <span className="kc-badge kc-badge-neutral">LinkedIn — soon</span>
            <span className="kc-badge kc-badge-neutral">X — soon</span>
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={200} className="cq-hero-preview-wrap">
        <div className="cq-hero-preview kc-task-card">
          <div className="cq-hero-preview-eyebrow">
            <span>Example mission</span>
            <span className="kc-badge kc-badge-available">Available</span>
          </div>

          <div className="kc-task-card-head">
            <span className="kc-task-subreddit">r/technology</span>
            <span className="kc-task-reward">$2.50</span>
          </div>
          <div className="kc-task-meta">
            <span className="kc-badge kc-badge-neutral">Comment</span>
            <span className="kc-badge kc-badge-neutral">Easy</span>
            <span>⏱ 10 min</span>
          </div>
          <p className="cq-hero-preview-desc">
            Share a genuine take on a trending discussion — this is what a real mission looks
            like once you're in.
          </p>

          <Link href="/apply-poster" className="btn btn-primary" style={{ width: "100%" }}>
            Accept Mission →
          </Link>
        </div>
      </ScrollReveal>
      </div>
    </section>
  );
}
