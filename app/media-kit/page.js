import Link from "next/link";
import MarketingLayout from "@/components/MarketingLayout";
import { DATA_CATEGORIES } from "@/lib/categoryData";

// One-page media kit for partners and introducers (first asked for by a
// PartnerStack network manager, 2026-10-21): what AEOrank is, how it works,
// who it is for, what it costs and what a referral earns. Sales material, so
// kept out of search; the link is shared directly.
export const metadata = {
  title: "Media kit | AEOrank",
  description: "What AEOrank does, how it uses Reddit, the done-for-you packs and plans.",
  robots: { index: false, follow: true },
};

const STEPS = [
  {
    title: "Measure",
    body: "We ask ChatGPT, Gemini and Claude the questions a brand's buyers ask, every day, and record whether the brand is named, in what position, who is named instead, and which pages ChatGPT cites as sources.",
  },
  {
    title: "Find the gaps",
    body: "AI assistants lean heavily on Reddit threads and review pages. AEOrank finds the threads where buyers ask for tools in the brand's category, and shows which competitors those threads name.",
  },
  {
    title: "Act",
    body: "AEOrank drafts helpful, non-promotional replies for those threads. The brand approves each one, then publishes it itself or has our posting network publish it, and the tracker shows whether the AI answers change.",
  },
];

const PLANS = [
  { name: "Lite", price: 199, credits: 100, comment: 10, post: 20, brands: 3, scans: "Every 2 weeks", mentions: "Weekly" },
  { name: "Pro", price: 299, credits: 200, comment: 7, post: 15, brands: 6, scans: "Weekly", mentions: "Daily" },
  { name: "Max", price: 449, credits: 300, comment: 5, post: 10, brands: 10, scans: "Daily", mentions: "Daily" },
];

const th = { textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--accent)", color: "var(--text)", fontWeight: 700, whiteSpace: "nowrap" };
const td = { padding: "10px 12px", borderBottom: "1px solid var(--border)", color: "var(--text-dim)", fontVariantNumeric: "tabular-nums" };

export default function MediaKit() {
  return (
    <MarketingLayout>
      <section className="section">
        <div className="container-narrow">
          <span className="section-tag">( media kit )</span>
          <h1 style={{ textAlign: "left" }}>
            AEOrank gets SaaS brands <span className="accent">named in AI answers</span>
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.65, color: "var(--text)", marginTop: 18 }}>
            When a buyer asks ChatGPT &ldquo;what is the best CRM for a small business?&rdquo;, the answer names three to six
            products. Most brands don&rsquo;t know whether they are among them. AEOrank measures it every day across ChatGPT,
            Gemini and Claude, finds the sources those answers are built from, and helps the brand get into them, starting with
            Reddit.
          </p>
          <p style={{ marginTop: 14, color: "var(--text-muted)", fontSize: 14, letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 600 }}>
            Recent clients: <span style={{ color: "var(--text)", textTransform: "none", letterSpacing: 0, fontWeight: 800 }}>Sovos · TINCheck</span>
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
          <h2 style={{ fontSize: 26, textAlign: "left", marginBottom: 14 }}>How it works</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {STEPS.map((s, i) => (
              <div key={s.title} className="card" style={{ padding: 22 }}>
                <div style={{ fontWeight: 800, color: "var(--text)", fontSize: 18 }}>
                  {i + 1}. {s.title}
                </div>
                <p style={{ margin: "6px 0 0", color: "var(--text-dim)", lineHeight: 1.7 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <h2 style={{ fontSize: 26, textAlign: "left", marginBottom: 14 }}>Platform features</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            {[
              ["AI answer tracking", "Your buyers\u2019 questions asked daily on ChatGPT (with web search), Gemini and Claude: named or not, position, and who is named instead."],
              ["Share of voice", "Your share of AI answers against each competitor, per engine, with a trend over time."],
              ["Cited sources", "The pages ChatGPT links to when it answers, and whether your site is one of them."],
              ["Reddit opportunities", "The threads where buyers ask for tools in your category, ranked by traffic and freshness, rescanned automatically."],
              ["Brand & competitor mentions", "Every Reddit mention of you and your competitors, so you see the conversations as they happen."],
              ["AI-drafted replies", "Helpful, on-topic comments and posts written for each thread. You edit and approve every one."],
              ["Publishing & tracking", "Post from your own account or have our network of Reddit users publish it, then follow each reply\u2019s reach."],
              ["Reports", "A weekly email and on-demand reports on AI visibility, Reddit activity and what changed."],
            ].map(([t, d]) => (
              <div key={t} className="card" style={{ padding: 18 }}>
                <div style={{ fontWeight: 800, color: "var(--text)" }}>{t}</div>
                <p style={{ margin: "6px 0 0", color: "var(--text-dim)", lineHeight: 1.6, fontSize: 15 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <h2 style={{ fontSize: 26, textAlign: "left", marginBottom: 6 }}>Who it&rsquo;s for</h2>
          <p style={{ color: "var(--text-dim)", lineHeight: 1.75, margin: 0 }}>
            B2B software companies, from growing SaaS to enterprise, whose buyers compare tools before buying: CRM, project
            management, help desk, email and marketing automation, SEO, HR and recruiting, accounting, website builders and
            similar categories. The buyer is usually the head of marketing, growth or the founder.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <h2 style={{ fontSize: 26, textAlign: "left", marginBottom: 6 }}>Done for you</h2>
          <p style={{ color: "var(--text-dim)", lineHeight: 1.75, margin: "0 0 14px" }}>
            We choose the threads, write the posts and comments, publish them, and report on Reddit reach and AI answers
            each month. Run with our sister site SaasOffers.tech (10,000+ monthly visitors). Recent clients include Sovos
            and TINCheck; our last client&rsquo;s Reddit content reached 859K+ views. Everything is approved by you before it is published.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            {[
              { name: "Starter", price: "$1,000", items: ["3 Reddit posts", "10 strategic comments", "1 blog post on saasoffers.tech/blog", "1 newsletter mention", "AEOrank AI-answer tracking and a monthly report"] },
              { name: "Growth", price: "$1,800", items: ["5 Reddit posts", "20 strategic comments", "3 blog posts on saasoffers.tech/blog", "1 newsletter mention", "Featured deal listing on saasoffers.tech", "AEOrank AI-answer tracking and a monthly report"] },
            ].map((p) => (
              <div key={p.name} className="card" style={{ padding: 22 }}>
                <div style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>{p.name}</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: "var(--text)", margin: "4px 0 10px" }}>
                  {p.price}
                  <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}> /month</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: 20, color: "var(--text-dim)", lineHeight: 1.8 }}>
                  {p.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 22, marginTop: 12 }}>
            <div style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>Enterprise</div>
            <p style={{ margin: "6px 0 0", color: "var(--text-dim)", lineHeight: 1.7 }}>
              Custom scope for larger companies: several products, brands and markets, a dedicated strategist, and monthly
              reporting for your marketing team. <strong style={{ color: "var(--text)" }}>Pricing on request.</strong>
            </p>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <h2 style={{ fontSize: 26, textAlign: "left", marginBottom: 6 }}>Self-serve plans</h2>
          <p style={{ color: "var(--text-dim)", margin: "0 0 14px" }}>Monthly, cancel any time, 7-day free trial on every plan.</p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15.5 }}>
              <thead>
                <tr>
                  <th style={th}>&nbsp;</th>
                  {PLANS.map((p) => (
                    <th key={p.name} style={{ ...th, textAlign: "right" }}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Price per month", (p) => `$${p.price}`],
                  ["Credits included each month", (p) => `$${p.credits}`],
                  ["Reddit comment / post", (p) => `$${p.comment} / $${p.post}`],
                  ["Brands", (p) => p.brands],
                  ["Thread scans", (p) => p.scans],
                  ["Brand & competitor mentions", (p) => p.mentions],
                ].map(([label, f]) => (
                  <tr key={label}>
                    <td style={{ ...td, color: "var(--text)", fontWeight: 600 }}>{label}</td>
                    {PLANS.map((p) => (
                      <td key={p.name} style={{ ...td, textAlign: "right" }}>
                        {f(p)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 10 }}>
            Every plan includes daily AI answer tracking on ChatGPT, Gemini and Claude, share of voice against competitors, and
            the sources ChatGPT cites. Current details on the <Link href="/pricing">pricing page</Link>.
          </p>
        </div>
      </section>


      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <div className="card" style={{ padding: 26 }}>
            <h2 style={{ fontSize: 22, textAlign: "left", margin: "0 0 8px" }}>Contact</h2>
            <p style={{ color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>
              Ilyas, founder · <a href="mailto:ilyas@aeorank.tech">ilyas@aeorank.tech</a> ·{" "}
              <Link href="/">aeorank.tech</Link>
            </p>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
