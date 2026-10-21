import Link from "next/link";
import MarketingLayout from "@/components/MarketingLayout";
import { DATA_CATEGORIES } from "@/lib/categoryData";

// One-page media kit for partners and introducers (first asked for by a
// PartnerStack network manager, 2026-10-21): what AEOrank is, how it works,
// who it is for, what it costs and what a referral earns. Sales material, so
// kept out of search; the link is shared directly.
export const metadata = {
  title: "Media kit | AEOrank",
  description: "What AEOrank does, how it works, plans and partner terms, on one page.",
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
          <h2 style={{ fontSize: 26, textAlign: "left", marginBottom: 14 }}>The opportunity</h2>
          <ul style={{ color: "var(--text-dim)", lineHeight: 1.85, paddingLeft: 22, margin: 0 }}>
            <li>
              Buyers increasingly start software research in an AI assistant. A brand missing from those answers is missing
              from the shortlist, and classic SEO reports don&rsquo;t show it.
            </li>
            <li>
              The gap is common and measurable. We publish daily data for {DATA_CATEGORIES.length} SaaS categories; in each,
              a handful of brands take most of the mentions and well-known products are often absent.{" "}
              <Link href="/ai-recommendations">See the live data</Link>.
            </li>
            <li>
              Every prospect can see their own gap in two minutes with the{" "}
              <Link href="/free-ai-visibility-checker">free AI visibility check</Link>, which makes AEOrank an easy first
              introduction.
            </li>
          </ul>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <h2 style={{ fontSize: 26, textAlign: "left", marginBottom: 6 }}>Who it&rsquo;s for</h2>
          <p style={{ color: "var(--text-dim)", lineHeight: 1.75, margin: 0 }}>
            B2B SaaS companies, from seed stage to mid-market, whose buyers compare tools before buying: CRM, project
            management, help desk, email and marketing automation, SEO, HR and recruiting, accounting, website builders and
            similar categories. The buyer is usually the head of marketing, growth or the founder.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <h2 style={{ fontSize: 26, textAlign: "left", marginBottom: 6 }}>Plans</h2>
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
          <h2 style={{ fontSize: 26, textAlign: "left", marginBottom: 6 }}>Partner terms</h2>
          <p style={{ color: "var(--text-dim)", lineHeight: 1.75, margin: 0 }}>
            Partners earn <strong style={{ color: "var(--text)" }}>30% of every payment</strong> a referred customer makes in
            their first 12 months: $59.70 a month for a Lite customer, $134.70 for Max. Introductions by email work as well
            as referral links. Details on the <Link href="/affiliates">partner page</Link>.
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
