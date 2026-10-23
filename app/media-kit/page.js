import MarketingLayout from "@/components/MarketingLayout";

// Enterprise media kit (2026-10-23): for the large companies a PartnerStack
// network manager introduces us to. Same content as the PDF in
// public/aeorank-media-kit.pdf (source: scripts/media-kit/media-kit.html).
// Sales material, so kept out of search; the link is shared directly.
export const metadata = {
  title: "Enterprise media kit | AEOrank",
  description: "How AEOrank measures and improves how AI assistants recommend enterprise software brands.",
  robots: { index: false, follow: true },
};

const STEPS = [
  ["Measure", "Your buyers’ real questions, asked daily on ChatGPT (with web search), Gemini and Claude. Named or not, position, and who is named instead."],
  ["Explain", "The pages each answer is built from: review sites, articles and Reddit threads, and which of them mention your competitors but not you."],
  ["Improve", "A prioritised plan for those sources, Reddit first, executed with your team, and tracked until the answers move."],
];

const CAPABILITIES = [
  ["Every product, brand and market", "Separate tracking for each product line and brand, with questions set per country."],
  ["Competitor benchmarking", "Your share of AI answers against each named competitor, per engine, over time."],
  ["Cited sources", "The exact pages ChatGPT cites for your category, and whether your site is among them."],
  ["Reddit intelligence", "The threads where buyers compare vendors in your category, and every mention of you and your competitors."],
  ["Your team in control", "Unlimited team members, and nothing published without your approval."],
  ["Reporting for leadership", "Weekly email updates and a monthly report your marketing team can share upward."],
];

const OFFERS = [
  {
    step: "Step 1 · 90 days",
    name: "AI Visibility Pilot",
    items: [
      "Your key buyer questions tracked daily on ChatGPT, Gemini and Claude",
      "Benchmark against the competitors you choose",
      "Map of the pages and Reddit threads the answers rely on",
      "Prioritised action plan, source by source",
      "Monthly readout with your team, final report at day 90",
    ],
  },
  {
    step: "Step 2 · Ongoing",
    name: "Enterprise program",
    items: [
      "Everything in the pilot, for every product, brand and market",
      "Reddit programme run with your team",
      "A dedicated strategist and a monthly working session",
      "Unlimited team access to the AEOrank platform",
      "Leadership reporting on AI visibility and share of voice",
    ],
  },
];

const TRUST = [
  ["Public data only", "We work from AI engines’ answers to your buyer questions and public web and Reddit pages. No access to your systems or customer data is needed."],
  ["Nothing without your approval", "Every piece of content is reviewed and approved by your team before it is published."],
  ["Readable evidence", "Every figure links back to the full AI answer and the pages it cited, so your team can check it."],
  ["Experience in regulated categories", "Recent work for Sovos and TINCheck, in tax compliance, where accuracy matters."],
];

const h2 = { fontSize: 26, textAlign: "left", marginBottom: 14 };
const grid = (min) => ({ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`, gap: 12 });

function Cards({ items, min = 260 }) {
  return (
    <div style={grid(min)}>
      {items.map(([t, d]) => (
        <div key={t} className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 800, color: "var(--text)" }}>{t}</div>
          <p style={{ margin: "6px 0 0", color: "var(--text-dim)", lineHeight: 1.6, fontSize: 15 }}>{d}</p>
        </div>
      ))}
    </div>
  );
}

export default function MediaKit() {
  return (
    <MarketingLayout>
      <section className="section">
        <div className="container-narrow">
          <span className="section-tag">( enterprise media kit )</span>
          <h1 style={{ textAlign: "left" }}>
            Know how AI recommends you. <span className="accent">Then change it.</span>
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.65, color: "var(--text)", marginTop: 18 }}>
            Your buyers now ask ChatGPT, Gemini and Claude which software to choose, and each answer names a handful of
            vendors. AEOrank measures, every day, whether your brand is one of them, against which competitors, and from
            which sources the answer is built. Then we help you earn a place in those sources.
          </p>
          <p style={{ marginTop: 14, color: "var(--text-muted)", fontSize: 14, letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 600 }}>
            Recent clients:{" "}
            <span style={{ color: "var(--text)", textTransform: "none", letterSpacing: 0, fontWeight: 800 }}>Sovos · TINCheck</span>
          </p>
          <p style={{ marginTop: 18 }}>
            <a href="/aeorank-media-kit.pdf" className="btn btn-primary" download>
              Download the PDF (6 pages)
            </a>
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <h2 style={h2}>What we do</h2>
          <Cards items={STEPS} min={220} />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <h2 style={h2}>Built for enterprise teams</h2>
          <Cards items={CAPABILITIES} />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <h2 style={{ ...h2, marginBottom: 6 }}>How we work with enterprise teams</h2>
          <p style={{ color: "var(--text-dim)", lineHeight: 1.75, margin: "0 0 14px" }}>
            Start with a pilot that answers one question: where does AI stand on your brand today, and what would move it.
            Continue only if it earns its place.
          </p>
          <div style={grid(280)}>
            {OFFERS.map((o) => (
              <div key={o.name} className="card" style={{ padding: 22 }}>
                <div style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>{o.step}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", margin: "4px 0 10px" }}>{o.name}</div>
                <ul style={{ margin: 0, paddingLeft: 20, color: "var(--text-dim)", lineHeight: 1.8 }}>
                  {o.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
                <p style={{ margin: "12px 0 0", fontWeight: 800, color: "var(--text)" }}>Pricing on request</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <h2 style={h2}>What we measure, and how</h2>
          <p style={{ color: "var(--text-dim)", lineHeight: 1.75, margin: 0 }}>
            Engines covered: <strong style={{ color: "var(--text)" }}>ChatGPT</strong> (with web search on, as most users see
            it), <strong style={{ color: "var(--text)" }}>Gemini</strong> and <strong style={{ color: "var(--text)" }}>Claude</strong>.
            Fixed buyer questions are asked every day and answers are stored in full. Brands are extracted from each answer and
            kept only when they literally appear in it. Cited pages come from the engine&rsquo;s own source links, so every
            number traces back to an answer you can read.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <h2 style={h2}>Working with us</h2>
          <Cards items={TRUST} />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <div className="card" style={{ padding: 26 }}>
            <h2 style={{ fontSize: 22, textAlign: "left", margin: "0 0 8px" }}>Book an intro call</h2>
            <p style={{ color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>
              30 minutes on your category, competitors and buyer questions; we bring a first look at where AI stands on your
              brand today. Ilyas, founder ·{" "}
              <a href="mailto:ilyas@aeorank.tech?subject=AEOrank%20enterprise%20pilot">ilyas@aeorank.tech</a>
            </p>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
