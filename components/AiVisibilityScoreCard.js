// Score card + competitor chips + per-answer breakdown for a live AI
// visibility check. Shared between the live /report/[brand] page and the
// dashboard's saved report detail view, so both render identically instead
// of duplicating this markup.
export default function AiVisibilityScoreCard({ brand, aiVisibility }) {
  if (!aiVisibility || !aiVisibility.rows || aiVisibility.rows.length === 0) return null;

  return (
    <section className="section section-alt">
      <div className="container">
        <span className="section-tag">( live AI visibility check )</span>
        <h2>
          How AI Answers About Your Category:{" "}
          <span className="accent">Right Now</span>
        </h2>
        <p className="section-sub">
          We just asked Gemini (with live Google Search grounding) and
          Claude the questions your buyers actually ask. These are their{" "}
          <strong>real, unedited answers</strong>. Run them yourself and
          you'll get the same. Here's whether <strong>{brand}</strong>{" "}
          showed up.
        </p>

        {/* Score card */}
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: 32,
            marginBottom: 24,
            borderColor:
              aiVisibility.score >= 50
                ? "rgba(110, 231, 183, 0.4)"
                : "rgba(242, 168, 59, 0.4)",
          }}
        >
          <div style={{ fontSize: 13, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
            AI Visibility Score
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1,
              color: aiVisibility.score >= 50 ? "#6EE7B7" : "var(--accent)",
            }}
          >
            {aiVisibility.score}%
          </div>
          <div style={{ marginTop: 10, color: "var(--text-dim)", fontSize: 15 }}>
            <strong>{brand}</strong> appeared in{" "}
            <strong>{aiVisibility.hits}</strong> of{" "}
            <strong>{aiVisibility.total}</strong> real AI answers about your
            category.
          </div>
          <p style={{ marginTop: 14, color: "var(--text-muted)", fontSize: 14, maxWidth: 560, margin: "14px auto 0" }}>
            {aiVisibility.score === 0
              ? `AI is recommending other brands to your buyers, and not naming ${brand} at all. That's the gap we close.`
              : aiVisibility.score < 50
              ? `AI mentions ${brand} occasionally, but your competitors are getting named more often. There's clear room to dominate.`
              : `${brand} already shows up in AI answers. The work now is defending that position and widening the lead before competitors catch up.`}
          </p>
        </div>

        {/* Competitor mentions — same real answers above, just naming who
            AI reached for instead of {brand}. Read-only extraction, no
            Reddit posting or automation involved. */}
        {aiVisibility.competitors && aiVisibility.competitors.length > 0 && (
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
              Brands AI named instead
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {aiVisibility.competitors.map((name) => (
                <span
                  key={name}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 999,
                    background: "rgba(255, 120, 120, 0.12)",
                    color: "#ff8a8a",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
            <p style={{ marginTop: 12, color: "var(--text-muted)", fontSize: 13 }}>
              These are the specific competitors AI named across the real answers below: the names your buyers hear instead of <strong>{brand}</strong>.
            </p>
          </div>
        )}

        {/* Per-answer breakdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {aiVisibility.rows.map((r, i) => (
            <div key={i} className="card" style={{ padding: 20 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                  marginBottom: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--accent)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {r.model}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    · {r.live ? "live web" : "model knowledge"}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: r.mentioned
                      ? "rgba(110, 231, 183, 0.15)"
                      : "rgba(255, 120, 120, 0.12)",
                    color: r.mentioned ? "#6EE7B7" : "#ff8a8a",
                  }}
                >
                  {r.mentioned ? `✓ ${brand} mentioned` : `✗ ${brand} not mentioned`}
                </span>
              </div>
              <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 600, marginBottom: 6 }}>
                “{r.query}”
              </div>
              <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.65, margin: 0 }}>
                {r.answer.length > 360 ? r.answer.slice(0, 360).trim() + "…" : r.answer}
              </p>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 20, color: "var(--text-muted)", fontSize: 13, textAlign: "center" }}>
          Live answers from Gemini (Google Search–grounded) and Claude,
          generated when this report loaded. AEOrank tracks these across
          every major AI engine for paying customers.
        </p>
      </div>
    </section>
  );
}
