import Link from "next/link";
import ScrollReveal from "./ScrollReveal";

const TYPE_LABEL = { comment: "Comment", reply: "Reply", post: "Post" };

// Real available missions only (see app/crewquest/page.js's query) — no
// fabricated listings when the pool is empty; an honest "check back soon"
// state instead.
export default function MissionGrid({ missions }) {
  return (
    <section id="creators" className="section">
      <div className="container">
        <ScrollReveal>
          <span className="section-tag">( mission marketplace )</span>
          <h2>Real missions, live right now</h2>
          <p className="section-sub">
            Every mission below is currently open and unclaimed — sign up to grab one.
          </p>
        </ScrollReveal>

        {missions.length === 0 ? (
          <ScrollReveal>
            <div className="card" style={{ textAlign: "center", color: "var(--text-dim)", padding: 48 }}>
              No missions open right now — check back soon, new ones post regularly.
            </div>
          </ScrollReveal>
        ) : (
          <div className="kc-task-grid">
            {missions.map((m, i) => (
              <ScrollReveal key={m.id} delay={i * 80}>
                <div className="kc-task-card">
                  <div className="kc-task-card-head">
                    <span className="kc-task-subreddit">r/{m.subreddit}</span>
                    <span className="kc-task-reward">${m.reward.toFixed(2)}</span>
                  </div>
                  <div className="kc-task-meta">
                    <span className="kc-badge kc-badge-neutral">{TYPE_LABEL[m.type] || "Comment"}</span>
                    <span className="kc-badge kc-badge-neutral">{m.difficulty}</span>
                    <span>⏱ {m.estimatedMinutes} min</span>
                    <span>
                      🎟 {m.slotsRemaining}/{m.slotsTotal} slots
                    </span>
                  </div>
                  <p className="kc-task-desc">{m.title}</p>
                  <Link href="/apply-poster" className="btn btn-primary btn-large" style={{ width: "100%" }}>
                    Accept Mission →
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
