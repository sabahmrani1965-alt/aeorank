export default function CreditsLoading() {
  return (
    <section className="section">
      <div className="container">
        <span className="section-tag">( credits )</span>
        <h2>AI credits</h2>

        <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr", gap: 20 }}>
          <div className="kpi-row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="kpi">
                <div className="skeleton" style={{ height: 12, width: "60%", marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 28, width: "40%" }} />
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div className="skeleton" style={{ height: 90 }} />
          </div>
        </div>

        <div style={{ marginTop: 36 }}>
          <div className="skeleton" style={{ height: 20, width: 160, marginBottom: 14 }} />
          <div className="sub-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="sub-card">
                <div className="skeleton" style={{ height: 60 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
