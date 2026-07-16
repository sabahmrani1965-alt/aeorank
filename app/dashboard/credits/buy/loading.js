export default function BuyCreditsLoading() {
  return (
    <section className="section">
      <div className="container">
        <span className="section-tag">( credits )</span>
        <h2>Buy credits</h2>

        <div className="sub-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card" style={{ padding: 24 }}>
              <div className="skeleton" style={{ height: 140 }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
