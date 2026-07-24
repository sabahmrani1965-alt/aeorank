// Illustrative product preview for the homepage hero — explicitly labeled
// as sample data, never presented as a real customer's real score.
const SAMPLE = {
  score: 62,
  delta: "+14%",
  rank: "#3",
  engines: [
    { label: "ChatGPT", value: 78 },
    { label: "Claude", value: 61 },
    { label: "Gemini", value: 54 },
    { label: "Perplexity", value: 69 },
  ],
};

export default function HeroVisual() {
  const max = Math.max(...SAMPLE.engines.map((e) => e.value));

  return (
    <div className="card" style={{ padding: 28, maxWidth: 440, width: "100%" }}>
      <div
        style={{
          fontSize: 12,
          color: "var(--text-muted)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        AI Visibility Score
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 4, flexWrap: "wrap" }}>
        <div
          style={{
            fontSize: 46,
            fontWeight: 800,
            letterSpacing: "-.02em",
            background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-3) 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {SAMPLE.score}%
        </div>
        <span
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            color: "#6EE7B7",
            background: "rgba(110,231,183,.12)",
            padding: "3px 9px",
            borderRadius: 999,
          }}
        >
          {SAMPLE.delta} this month
        </span>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>{SAMPLE.rank}</div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>vs. tracked competitors</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "22px 0 6px" }}>
        {SAMPLE.engines.map((e) => (
          <div key={e.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 74, fontSize: 12.5, color: "var(--text-dim)", flexShrink: 0 }}>
              {e.label}
            </span>
            <div
              style={{
                flex: 1,
                height: 7,
                borderRadius: 999,
                background: "rgba(255,255,255,.06)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${(e.value / max) * 100}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
                }}
              />
            </div>
            <span
              style={{
                width: 30,
                textAlign: "right",
                fontSize: 12.5,
                color: "var(--text)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {e.value}
            </span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 16, textAlign: "center" }}>
        Sample dashboard, illustrative data, not a live customer's real score.
      </div>
    </div>
  );
}
