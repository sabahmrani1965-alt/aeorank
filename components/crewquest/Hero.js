import Link from "next/link";
import ScrollReveal from "./ScrollReveal";

const TYPE_LABEL = { comment: "Comment", reply: "Reply", post: "Post" };

export default function Hero({ liveMissionCount, previewMission }) {
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
            Complete authentic posting and commenting missions for brands on Reddit — from your
            own real account. LinkedIn, X, and Discord missions are coming soon.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={240}>
          <div className="cq-hero-ctas">
            <Link href="/apply-poster" className="btn btn-primary btn-large">
              Start Earning →
            </Link>
            <a href="#for-brands" className="btn btn-ghost btn-large">
              For Brands
            </a>
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
            <span>{previewMission ? "Live mission" : "Example mission"}</span>
            <span className="kc-badge kc-badge-available">Available</span>
          </div>

          {previewMission ? (
            <>
              <div className="kc-task-card-head">
                <span className="kc-task-subreddit">r/{previewMission.subreddit}</span>
                <span className="kc-task-reward">${previewMission.reward.toFixed(2)}</span>
              </div>
              <div className="kc-task-meta">
                <span className="kc-badge kc-badge-neutral">{TYPE_LABEL[previewMission.type] || "Comment"}</span>
                <span className="kc-badge kc-badge-neutral">{previewMission.difficulty}</span>
                <span>⏱ {previewMission.estimatedMinutes} min</span>
                <span>
                  🎟 {previewMission.slotsRemaining}/{previewMission.slotsTotal} slots
                </span>
              </div>
              <p className="cq-hero-preview-desc">{previewMission.title}</p>
            </>
          ) : (
            <>
              <div className="kc-task-card-head">
                <span className="kc-task-subreddit">r/technology</span>
                <span className="kc-task-reward">$0.50</span>
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
            </>
          )}

          <Link href="/apply-poster" className="btn btn-primary" style={{ width: "100%" }}>
            Accept Mission →
          </Link>
        </div>
      </ScrollReveal>
      </div>
    </section>
  );
}
