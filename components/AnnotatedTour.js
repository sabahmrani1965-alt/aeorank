// Single annotated "product tour" mockup: one dashboard screenshot with
// floating callouts pointing at real, shipped features (names match
// FeatureGrid.js: AI Visibility Score, Reddit Opportunities, Mention
// Tracking, Prompt Tracking, AI Writing Assistant). Colors inside
// .tour-mock are fixed hex (not theme variables) for the same reason as
// ProductShowcase/HeroVisual: it must look like an embedded dark
// screenshot regardless of the surrounding page theme.

const SAMPLE = [
  { sub: "r/SaaS", title: "What's the best tool for tracking AI visibility?", score: 92, intent: "High" },
  { sub: "r/startups", title: "Anyone measuring how often ChatGPT recommends their product?", score: 78, intent: "Medium" },
];

const INTENT_COLOR = {
  High: { fg: "#6EE7B7", bg: "rgba(110,231,183,.12)" },
  Medium: { fg: "#f2a83b", bg: "rgba(242,168,59,.12)" },
};

function Callout({ className, icon, title, children }) {
  return (
    <div className={`tour-callout ${className}`}>
      <div className="tour-callout-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{children}</p>
    </div>
  );
}

export default function AnnotatedTour() {
  return (
    <section className="section section-alt">
      <div className="container">
        <span className="section-tag">( inside the dashboard )</span>
        <h2>
          Everything happens in <span className="accent">one place</span>
        </h2>
        <p className="section-sub">
          Track your score, find the conversation, see who's already talking about you, and get an
          AI-written reply ready for your review, all from the same screen.
        </p>

        <div className="tour-wrap tour-wrap-5">
          <Callout className="tour-callout-visibility" icon="🎯" title="AI Visibility Score">
            Track how ChatGPT, Claude, Gemini, and Perplexity talk about your brand over time.
          </Callout>
          <Callout className="tour-callout-opportunities" icon="🔎" title="Reddit Opportunities">
            High-intent threads where your buyers are already asking, ranked by relevance.
          </Callout>
          <Callout className="tour-callout-prompts" icon="🧠" title="Prompt Tracking">
            Track the exact buyer questions that should mention your brand, and see if AI answers with it.
          </Callout>
          <Callout className="tour-callout-mentions" icon="💬" title="Mention Tracking">
            Get notified the moment someone mentions your brand on Reddit.
          </Callout>
          <Callout className="tour-callout-writing" icon="✍️" title="AI Writing Assistant">
            AI writes the reply. Nothing posts until you review and approve it.
          </Callout>

          <div className="tour-mock">
            <div className="tour-app-sidebar">
              <div className="tour-app-logo"><span className="accent">AEO</span>rank</div>
              <div className="tour-app-navgroup-label">Discover</div>
              <div className="tour-app-navitem is-active">🔎 Opportunities</div>
              <div className="tour-app-navitem">💬 Mentions</div>
              <div className="tour-app-navgroup-label">Create</div>
              <div className="tour-app-navitem">📋 Track Task</div>
              <div className="tour-app-navgroup-label">Analyze</div>
              <div className="tour-app-navitem">📊 Reports</div>
              <div className="tour-app-navitem">🧠 Prompts</div>
            </div>

            <div className="tour-app-main">
              <div className="tour-mock-header">
                <span className="tour-mock-brand">SaaSOffers</span>
                <span className="tour-mock-pill">AI Visibility: 71</span>
              </div>

              <div className="tour-mock-label">Reddit Opportunities</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {SAMPLE.map((o) => (
                  <div key={o.title} className="tour-mock-card">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: "#f2a83b" }}>{o.sub}</span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: INTENT_COLOR[o.intent].bg,
                          color: INTENT_COLOR[o.intent].fg,
                        }}
                      >
                        {o.intent} intent
                      </span>
                      <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 800, color: "#ffffff" }}>
                        {o.score}<span style={{ fontSize: 10, color: "#8a96b0", fontWeight: 500 }}>/100</span>
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: "#e8ecf5", lineHeight: 1.4 }}>{o.title}</div>
                  </div>
                ))}
              </div>

              <div className="tour-mock-label">Prompt Tracking</div>
              <div className="tour-mock-card" style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: "#e8ecf5", marginBottom: 8 }}>
                  "best AI visibility tool for SaaS"
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "rgba(110,231,183,.12)",
                    color: "#6EE7B7",
                  }}
                >
                  ✓ Mentioned in ChatGPT
                </span>
              </div>

              <div className="tour-mock-notif">
                <span style={{ fontSize: 15 }}>💬</span>
                <span style={{ flex: 1 }}>Someone mentioned <strong style={{ color: "#fff" }}>SaaSOffers</strong> on r/SaaS</span>
                <span style={{ color: "#8a96b0", fontSize: 12 }}>2m ago</span>
              </div>

              <div className="tour-mock-draft">
                <div style={{ fontSize: 11.5, color: "#8a96b0", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".04em" }}>
                  AI-written reply · needs your approval
                </div>
                <div style={{ fontSize: 13, color: "#c7cede", lineHeight: 1.5, marginBottom: 12 }}>
                  "We ran into this too, ended up comparing a few options before settling on one that
                  tracks visibility across ChatGPT and Claude directly..."
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span className="tour-mock-btn">Edit</span>
                  <span className="tour-mock-btn tour-mock-btn-primary">Approve &amp; Post</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
