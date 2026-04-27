import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Loading() {
  return (
    <>
      <Header />

      {/* Hero skeleton */}
      <section className="report-hero">
        <div className="container" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div className="hero-pill">
            <span className="dot" /> Scanning Reddit for relevant communities…
          </div>
          <div className="skeleton" style={{ height: 52, width: "60%", maxWidth: 600 }} />
          <div className="skeleton" style={{ height: 52, width: "45%", maxWidth: 480 }} />
          <div className="skeleton" style={{ height: 18, width: "70%", maxWidth: 700, marginTop: 12 }} />
        </div>
      </section>

      {/* Keywords skeleton */}
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="section-icon">
            <span className="icon-box">⚿</span>
            <h3>Top Keyword Opportunities</h3>
          </div>
          <div className="chart-card">
            <div className="skeleton" style={{ height: 280 }} />
          </div>
          <div className="kpi-row">
            <div className="kpi"><div className="skeleton" style={{ height: 50 }} /></div>
            <div className="kpi"><div className="skeleton" style={{ height: 50 }} /></div>
            <div className="kpi"><div className="skeleton" style={{ height: 50 }} /></div>
          </div>
        </div>
      </section>

      {/* Subreddit skeletons */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-icon">
            <span className="icon-box">★</span>
            <h3>Top Subreddit Opportunities</h3>
          </div>
          <div className="sub-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="sub-card" key={i}>
                <div className="sub-head">
                  <div className="skeleton" style={{ width: 40, height: 40, borderRadius: "50%" }} />
                  <div className="skeleton" style={{ height: 18, flex: 1 }} />
                </div>
                <div className="skeleton" style={{ height: 14, width: "100%" }} />
                <div className="skeleton" style={{ height: 14, width: "60%" }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
