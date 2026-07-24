// Large, detailed "see it working" section — two big panels, each a real
// feature with an illustrative dashboard mockup, not a small icon list.
// All numbers/examples below are explicitly sample data, never presented
// as a real customer's real results.

function VisibilityMock() {
  return (
    <div className="showcase-mock">
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 4, flexWrap: "wrap" }}>
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            letterSpacing: "-.02em",
            background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-3) 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          58%
        </div>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#6EE7B7",
            background: "rgba(110,231,183,.12)",
            padding: "4px 10px",
            borderRadius: 999,
          }}
        >
          ↑ 12% vs last month
        </span>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>#4</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>vs. tracked competitors</div>
        </div>
      </div>

      <svg viewBox="0 0 320 100" width="100%" height="100" preserveAspectRatio="none" style={{ display: "block", margin: "14px 0 18px" }}>
        <path
          d="M0,78 C40,85 55,55 90,58 C130,61 150,30 190,34 C230,38 250,18 290,14 L316,10"
          fill="none"
          stroke="url(#showcaseTrend)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="showcaseTrend" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#f2a83b" />
          </linearGradient>
        </defs>
        <circle cx="316" cy="10" r="6" fill="#fff" />
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { label: "ChatGPT", value: 71 },
          { label: "Claude", value: 58 },
          { label: "Gemini", value: 46 },
          { label: "Perplexity", value: 63 },
        ].map((e) => (
          <div key={e.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 78, fontSize: 13, color: "var(--text-dim)", flexShrink: 0 }}>{e.label}</span>
            <div style={{ flex: 1, height: 7, borderRadius: 999, background: "rgba(255,255,255,.06)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${e.value}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
                }}
              />
            </div>
            <span style={{ width: 30, textAlign: "right", fontSize: 13, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
              {e.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const SAMPLE_OPPORTUNITIES = [
  {
    sub: "r/SaaS",
    title: "What's the best tool for tracking AI visibility? Tried a few, all clunky",
    score: 92,
    intent: "High",
  },
  {
    sub: "r/startups",
    title: "Anyone actually measuring how often ChatGPT recommends their product?",
    score: 78,
    intent: "Medium",
  },
  {
    sub: "r/Entrepreneur",
    title: "How do you even find out if AI search engines know your brand exists?",
    score: 64,
    intent: "Medium",
  },
];

const INTENT_COLOR = {
  High: { fg: "#6EE7B7", bg: "rgba(110,231,183,.12)" },
  Medium: { fg: "var(--accent)", bg: "var(--accent-dim)" },
  Low: { fg: "var(--text-muted)", bg: "rgba(255,255,255,.06)" },
};

function OpportunityMock() {
  return (
    <div className="showcase-mock" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {SAMPLE_OPPORTUNITIES.map((o) => {
        const intentColor = INTENT_COLOR[o.intent];
        return (
          <div
            key={o.title}
            style={{
              background: "var(--bg-2)",
              border: "1px solid var(--card-border-soft)",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>{o.sub}</span>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: intentColor.bg,
                  color: intentColor.fg,
                }}
              >
                {o.intent} intent
              </span>
              <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 800, color: "var(--text)" }}>
                {o.score}
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>/100</span>
              </span>
            </div>
            <div style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.4 }}>{o.title}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function ProductShowcase() {
  return (
    <section className="section section-alt">
      <div className="container">
        <span className="section-tag">( see it working )</span>
        <h2>
          The Intelligence Layer Behind Your <span className="accent">AI Presence</span>
        </h2>
        <p className="section-sub">
          Monitor every AI model, track real Reddit opportunities, and spot where you stand before your competitors do.
        </p>

        <div className="showcase-grid">
          <div className="card showcase-panel">
            <h3>AI Visibility Score &amp; Ranking</h3>
            <p>
              Track your visibility score across ChatGPT, Claude, Gemini, and Perplexity. Benchmark
              against competitors and watch ranking shifts over time.
            </p>
            <VisibilityMock />
          </div>

          <div className="card showcase-panel">
            <h3>Reddit Opportunity Discovery</h3>
            <p>
              Real threads where your buyers are already asking, each scored for relevance and
              buying intent, so you know exactly which ones to answer first.
            </p>
            <OpportunityMock />
          </div>
        </div>

        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 12.5, marginTop: 24 }}>
          Illustrative sample data shown above — not a real customer's live dashboard.
        </p>
      </div>
    </section>
  );
}
