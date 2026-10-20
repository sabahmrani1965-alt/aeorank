import Link from "next/link";
import { notFound } from "next/navigation";
import MarketingLayout from "@/components/MarketingLayout";
import { getCategory, hasBrandPage, loadReddit, loadSummary } from "@/lib/categoryData";

// One public page per brand the engines name often enough (lib/categoryData.js
// hasBrandPage): does ChatGPT, Claude or Gemini recommend it, how often, next
// to whom, in which words, and in which Reddit threads. Built from the same
// daily summary as the category page, so every number here is on that page too.
// The outreach report (/ai-report) is a different page, written to the brand.
// Rendered per request: brands enter and leave the ranking daily, and the
// Supabase client opts out of Next's data cache (lib/supabase/admin.js), so a
// page generated on demand cannot stay static and would fail.
export const dynamic = "force-dynamic";

const SITE_URL = "https://www.aeorank.tech";
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const shortName = (n) => String(n).replace(/\s+(crm|software|app|platform|suite)$/i, "");
const longDate = (d) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

async function load(params) {
  const cat = getCategory(params.slug);
  if (!cat) return null;
  const d = await loadSummary(cat.slug);
  const rank = (d?.brands || []).findIndex((b) => b.slug === params.brand);
  if (rank < 0 || !hasBrandPage(d.brands[rank])) return null;
  return { cat, d, b: d.brands[rank], rank };
}

// "Yes", "Often", "Sometimes", "Rarely": the plain answer to the page's
// question, from the share of answers that name the brand.
function verdictWord(share) {
  if (share >= 75) return "Yes";
  if (share >= 40) return "Often";
  if (share >= 15) return "Sometimes";
  return "Rarely";
}

function summaryLine({ cat, d, b, rank }) {
  const engines = Object.keys(d.engines).sort();
  const name = shortName(b.name);
  const window = d.firstDay === d.lastDay ? `On ${longDate(d.lastDay)}` : `Between ${longDate(d.firstDay)} and ${longDate(d.lastDay)}`;
  return (
    `${window}, ${name} was named in ${b.share}% of ${d.totalAnswers} answers ${engines.join(", ")} gave to buyer questions about ${cat.name}, ` +
    `${rank === 0 ? "more than any other brand" : `#${rank + 1} of the brands they named`}. ` +
    `By engine: ${engines.map((e) => `${e} ${b.byEngine[e] ?? 0}%`).join(", ")}.`
  );
}

export async function generateMetadata({ params }) {
  const x = await load(params);
  if (!x) return {};
  const name = shortName(x.b.name);
  const title = `Does ChatGPT recommend ${name}? AI answer data`;
  const description = `${name} was named in ${x.b.share}% of AI answers about ${x.cat.name} (ChatGPT, Claude and Gemini), #${x.rank + 1} overall. Quotes, rivals and Reddit threads, updated daily.`;
  const url = `${SITE_URL}/ai-recommendations/${x.cat.slug}/${x.b.slug}`;
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, type: "article", url } };
}

export default async function BrandPage({ params }) {
  const x = await load(params);
  if (!x) notFound();
  const { cat, d, b, rank } = x;
  const name = shortName(b.name);
  const engines = Object.keys(d.engines).sort();
  const url = `${SITE_URL}/ai-recommendations/${cat.slug}/${b.slug}`;
  const line = summaryLine(x);
  // The question is about ChatGPT, so the yes/no comes from ChatGPT's own
  // answers; the other engines follow in the same sentence.
  const gpt = d.engines.ChatGPT ? b.byEngine.ChatGPT ?? 0 : null;
  const verdict = verdictWord(gpt ?? b.share);
  const gptLine =
    gpt == null ? "" : `ChatGPT named ${name} in ${gpt}% of its ${d.engines.ChatGPT} answers about ${cat.name}. `;

  // Rivals: the brands around it in the ranking, itself included.
  const rivals = d.brands.slice(0, Math.max(6, rank + 2));

  // Reddit threads whose text names the brand: where the engines' training
  // data and live search find buyers discussing it.
  const reddit = await loadReddit(cat.slug).catch(() => null);
  const re = new RegExp(`\\b${escRe(name)}\\b`, "i");
  const threads = (reddit?.threads || []).filter((t) => re.test(`${t.title}\n${t.text || ""}`)).slice(0, 4);

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "AI recommendations", item: `${SITE_URL}/ai-recommendations` },
        { "@type": "ListItem", position: 2, name: cap(cat.name), item: `${SITE_URL}/ai-recommendations/${cat.slug}` },
        { "@type": "ListItem", position: 3, name, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `Does ChatGPT recommend ${name}?`,
          acceptedAnswer: { "@type": "Answer", text: `${verdict}. ${gptLine}${line}` },
        },
        {
          "@type": "Question",
          name: `Which ${cat.name} do AI assistants name alongside ${name}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: rivals
              .filter((r) => r.slug !== b.slug)
              .slice(0, 5)
              .map((r) => `${shortName(r.name)} (${r.share}%)`)
              .join(", "),
          },
        },
      ],
    },
  ];

  return (
    <MarketingLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <section className="section">
        <div className="container-narrow">
          <nav aria-label="Breadcrumb" style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 18 }}>
            <Link href="/ai-recommendations">AI recommendations</Link> ›{" "}
            <Link href={`/ai-recommendations/${cat.slug}`}>{cap(cat.name)}</Link> › {name}
          </nav>
          <h1 style={{ textAlign: "left" }}>
            Does ChatGPT recommend <span className="accent">{name}</span>?
          </h1>
          <p style={{ fontSize: 20, lineHeight: 1.6, color: "var(--text)", margin: "18px 0 0" }}>
            <strong>{verdict}.</strong> {gptLine}
            {line}
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 14 }}>
            Updated {longDate(d.lastDay)} · rolling 30 days · {d.days} {d.days === 1 ? "day" : "days"} of data
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <h2 style={{ fontSize: 24, marginBottom: 14, textAlign: "left" }}>By AI engine</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
            {engines.map((e) => {
              const v = b.byEngine[e] ?? 0;
              return (
                <div key={e} className="card" style={{ padding: 20 }}>
                  <div style={{ color: "var(--text-muted)", fontSize: 14, fontWeight: 600 }}>{e}</div>
                  <div style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.15, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
                    {v}%
                  </div>
                  <div style={{ color: "var(--text-dim)", fontSize: 14 }}>
                    of {d.engines[e]} {d.engines[e] === 1 ? "answer" : "answers"} name {name}
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ color: "var(--text-muted)", marginTop: 12, fontSize: 14, lineHeight: 1.7 }}>
            Engines with fewer answers swing more from day to day.
          </p>
        </div>
      </section>

      {b.quotes?.length ? (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container-narrow">
            <h2 style={{ fontSize: 24, marginBottom: 14, textAlign: "left" }}>What the engines say about {name}</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {b.quotes.map((q) => (
                <figure key={`${q.engine}${q.date}${q.text}`} className="card" style={{ padding: 22, margin: 0 }}>
                  <blockquote style={{ margin: 0, color: "var(--text)", lineHeight: 1.7, fontSize: 16.5 }}>{q.text}</blockquote>
                  <figcaption style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 10 }}>
                    <strong style={{ color: "var(--text-dim)" }}>{q.engine}</strong>, {longDate(q.date)}, asked &ldquo;{q.question}&rdquo;
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <h2 style={{ fontSize: 24, marginBottom: 14, textAlign: "left" }}>Who AI names alongside {name}</h2>
          <div className="card" style={{ padding: "8px 22px" }}>
            {rivals.map((r, i) => {
              const you = r.slug === b.slug;
              const label = shortName(r.name);
              return (
                <div
                  key={r.name}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "28px minmax(0, 1fr) 64px",
                    gap: 12,
                    alignItems: "center",
                    padding: "11px 0",
                    borderTop: i ? "1px solid var(--border)" : "none",
                    fontWeight: you ? 800 : 500,
                  }}
                >
                  <span style={{ color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
                  <span style={{ minWidth: 0 }}>
                    {you || !hasBrandPage(r) ? (
                      <span style={{ color: you ? "var(--accent)" : "var(--text)" }}>{label}</span>
                    ) : (
                      <Link href={`/ai-recommendations/${cat.slug}/${r.slug}`} style={{ color: "var(--text)" }}>
                        {label}
                      </Link>
                    )}
                    <span
                      aria-hidden="true"
                      style={{
                        display: "block",
                        marginTop: 6,
                        height: 6,
                        borderRadius: 3,
                        width: `${Math.max(2, r.share)}%`,
                        background: you ? "var(--accent)" : "var(--border)",
                      }}
                    />
                  </span>
                  <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--text-dim)" }}>{r.share}%</span>
                </div>
              );
            })}
          </div>
          <p style={{ color: "var(--text-muted)", marginTop: 12, fontSize: 14, lineHeight: 1.7 }}>
            Share of all {d.totalAnswers} answers that name each brand.{" "}
            <Link href={`/ai-recommendations/${cat.slug}`}>Full {cat.name} ranking, by engine →</Link>
          </p>
        </div>
      </section>

      {threads.length ? (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container-narrow">
            <h2 style={{ fontSize: 24, marginBottom: 8, textAlign: "left" }}>Reddit threads that mention {name}</h2>
            <p style={{ color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 16 }}>
              Reddit is among the sources AI assistants cite most for software questions. These are the busiest {cat.name}{" "}
              threads we track that name {name}.
            </p>
            <div style={{ display: "grid", gap: 10 }}>
              {threads.map((t) => (
                <a
                  key={t.url}
                  href={t.url}
                  target="_blank"
                  rel="noopener nofollow"
                  className="card"
                  style={{ padding: "16px 20px", textDecoration: "none", display: "block" }}
                >
                  <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
                    r/{t.sub}
                    {t.comments ? ` · ${t.comments} comments` : ""}
                    {t.ups ? ` · ${t.ups} upvotes` : ""}
                  </div>
                  <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 17, lineHeight: 1.4, marginTop: 4 }}>{t.title}</div>
                </a>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <h2 style={{ fontSize: 24, marginBottom: 14, textAlign: "left" }}>How this is measured</h2>
          <p style={{ color: "var(--text-dim)", lineHeight: 1.8 }}>
            Every day we ask ChatGPT, Claude and Gemini the same fixed buyer questions about {cat.name}, such as &ldquo;
            {cat.questions[0]}&rdquo;, and record which brands each answer names. A brand counts once per answer. No brand
            pays to appear, and answers are not edited. The method and every question are on the{" "}
            <Link href={`/ai-recommendations/${cat.slug}`}>{cat.name} page</Link>.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <div className="card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: 24, margin: "0 0 10px", textAlign: "left" }}>Is {name} your brand, or a competitor?</h2>
            <p style={{ color: "var(--text-dim)", lineHeight: 1.8, margin: 0 }}>
              Run the same check for your own site: which engines name you, who they name instead, and the threads that
              shape it. Free, one check a day.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
              <Link href="/free-ai-visibility-checker" className="btn btn-primary">
                Check your brand free →
              </Link>
              <Link href="/pricing" className="btn btn-ghost">
                Track it daily
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
