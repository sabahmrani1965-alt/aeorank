import Link from "next/link";
import { notFound } from "next/navigation";
import MarketingLayout from "@/components/MarketingLayout";
import { DATA_CATEGORIES, getCategory, hasBrandPage, loadSummary } from "@/lib/categoryData";

// Read from the summary the daily cron writes (lib/categoryData.js); the
// cron also revalidates this path after each run.
export const revalidate = 3600;
export const dynamicParams = false;

const SITE_URL = "https://www.aeorank.tech";

export function generateStaticParams() {
  return DATA_CATEGORIES.map((c) => ({ slug: c.slug }));
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export async function generateMetadata({ params }) {
  const cat = getCategory(params.slug);
  if (!cat) return {};
  const title = `Which ${cat.name} do ChatGPT, Claude and Gemini recommend?`;
  const description = `Daily data on the ${cat.name} brands AI assistants name when buyers ask for options. Share of answers by brand and by engine, updated every day by AEOrank.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/ai-recommendations/${cat.slug}` },
    // No images here: the segment's opengraph-image.js draws a card per category.
    openGraph: { title, description, type: "website", url: `${SITE_URL}/ai-recommendations/${cat.slug}` },
  };
}

const th = (right) => ({
  textAlign: right ? "right" : "left",
  padding: "10px 12px",
  borderBottom: "1px solid var(--accent)",
  color: "var(--text)",
  fontWeight: 700,
  whiteSpace: "nowrap",
});
const td = (right) => ({
  padding: "10px 12px",
  borderBottom: "1px solid var(--border)",
  color: "var(--text-dim)",
  textAlign: right ? "right" : "left",
  fontVariantNumeric: "tabular-nums",
});

function Figure({ value, label }) {
  return (
    <div style={{ flex: 1, minWidth: 130 }}>
      <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1, color: "var(--text)" }}>{value}</div>
      <div style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>{label}</div>
    </div>
  );
}

const ENGINE_NOTES = {
  Claude: "Claude (claude-haiku-4-5) through Anthropic's API, answering from model knowledge without web search.",
  ChatGPT: "ChatGPT through OpenAI's API (gpt-5.3-chat-latest, the model behind the ChatGPT app), with web search off, so it answers from model knowledge. Before 21 October 2026, through Cloro's monitoring API.",
  Gemini: "Gemini through Cloro's monitoring API, which returns the consumer Gemini answer.",
};

export default async function CategoryData({ params }) {
  const cat = getCategory(params.slug);
  if (!cat) notFound();
  const d = await loadSummary(cat.slug);
  const engineNames = d ? Object.keys(d.engines).sort() : [];
  const [b1, b2, b3] = d?.brands || [];
  const finding =
    d && b1
      ? `${d.firstDay === d.lastDay ? `On ${d.lastDay}` : `Between ${d.firstDay} and ${d.lastDay}`}, ${b1.name} was named in ${b1.share}% of ${d.totalAnswers} AI answers about ${cat.name}` +
        (b2 ? `, ahead of ${b2.name} (${b2.share}%)` : "") +
        (b3 ? ` and ${b3.name} (${b3.share}%)` : "") +
        `, across ${engineNames.join(", ")}.`
      : null;

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "AI recommendations", item: `${SITE_URL}/ai-recommendations` },
        { "@type": "ListItem", position: 2, name: cap(cat.name), item: `${SITE_URL}/ai-recommendations/${cat.slug}` },
      ],
    },
    d && {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: `${cap(cat.name)} recommended by AI assistants`,
      description: finding,
      url: `${SITE_URL}/ai-recommendations/${cat.slug}`,
      creator: { "@id": `${SITE_URL}/#organization` },
      temporalCoverage: `${d.firstDay}/${d.lastDay}`,
      dateModified: d.lastDay,
      isAccessibleForFree: true,
      variableMeasured: ["Share of AI answers naming each brand", "Answer engine"],
      measurementTechnique: "Fixed buyer questions sent to AI assistants daily; brand names extracted from each answer.",
    },
  ].filter(Boolean);

  return (
    <MarketingLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <section className="section">
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <span className="section-tag">( daily AI answer data )</span>
          <h1>
            Which {cat.name} do <span className="accent">AI assistants recommend?</span>
          </h1>
          <p className="section-sub">
            We ask ChatGPT, Claude and Gemini the same buyer questions about {cat.name} every day and count which
            brands they name. No sponsored placements, no edited answers.
          </p>
        </div>
      </section>

      {d ? (
        <>
          <section className="section" style={{ paddingTop: 0 }}>
            <div className="container-narrow">
              <h2 style={{ fontSize: 24, marginBottom: 10, textAlign: "left" }}>The finding</h2>
              <p style={{ fontSize: 19, lineHeight: 1.6, color: "var(--text)", marginBottom: 22 }}>{finding}</p>
              <div className="card" style={{ padding: 28 }}>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  <Figure value={d.totalAnswers} label="AI answers read" />
                  <Figure value={d.brands.length >= 15 ? "15+" : d.brands.length} label="brands named" />
                  <Figure value={engineNames.length} label={engineNames.length === 1 ? "AI engine" : "AI engines"} />
                  <Figure value={d.days} label={d.days === 1 ? "day measured" : "days measured"} />
                </div>
                <p style={{ color: "var(--text-muted)", marginTop: 18, marginBottom: 0, lineHeight: 1.7 }}>
                  {d.firstDay} to {d.lastDay}, rolling 30 days. Updated automatically every day.
                  {d.days < 7 ? " Collection started recently, so expect these shares to move as days accumulate." : ""}
                </p>
              </div>
            </div>
          </section>

          <section className="section" style={{ paddingTop: 0 }}>
            <div className="container-narrow">
              <h2 style={{ fontSize: 24, marginBottom: 14, textAlign: "left" }}>Share of AI answers, by brand</h2>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15.5 }}>
                  <thead>
                    <tr>
                      <th style={th()}>#</th>
                      <th style={th()}>Brand</th>
                      <th style={th(true)}>All engines</th>
                      {engineNames.map((e) => (
                        <th key={e} style={th(true)}>
                          {e}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {d.brands.map((b, i) => (
                      <tr key={b.name}>
                        <td style={td()}>{i + 1}</td>
                        <td style={{ ...td(), color: "var(--text)", fontWeight: 600 }}>
                          {b.slug && hasBrandPage(b) ? (
                            <Link href={`/ai-recommendations/${cat.slug}/${b.slug}`} style={{ color: "var(--text)" }}>
                              {b.name}
                            </Link>
                          ) : (
                            b.name
                          )}
                        </td>
                        <td style={td(true)}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <span
                              aria-hidden="true"
                              style={{
                                display: "inline-block",
                                width: Math.max(2, Math.round(b.share * 0.6)),
                                height: 6,
                                borderRadius: 3,
                                background: "var(--accent)",
                              }}
                            />
                            {b.share}%
                          </span>
                        </td>
                        {engineNames.map((e) => (
                          <td key={e} style={td(true)}>
                            {b.byEngine[e] ?? 0}%
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ color: "var(--text-muted)", marginTop: 14, lineHeight: 1.7 }}>
                A brand counts once per answer that names it. Answers per engine over the window:{" "}
                {engineNames.map((e) => `${e} ${d.engines[e]}`).join(", ")}. Engines with few answers swing more, so
                compare brands within a column rather than across columns.
              </p>
            </div>
          </section>

          {d.latest?.length ? (
            <section className="section" style={{ paddingTop: 0 }}>
              <div className="container-narrow">
                <h2 style={{ fontSize: 24, marginBottom: 14, textAlign: "left" }}>What the engines said on {d.lastDay}</h2>
                <div style={{ display: "grid", gap: 14 }}>
                  {d.latest.map((l) => (
                    <figure key={l.engine} className="card" style={{ padding: 22, margin: 0 }}>
                      <figcaption style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 8 }}>
                        <strong style={{ color: "var(--text)" }}>{l.engine}</strong>, asked &ldquo;{l.question}&rdquo;
                      </figcaption>
                      <blockquote style={{ margin: 0, color: "var(--text-dim)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                        {l.answer}
                        {l.answer.length >= 900 ? "…" : ""}
                      </blockquote>
                    </figure>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          <section className="section" style={{ paddingTop: 0 }}>
            <div className="container-narrow">
              <h2 style={{ fontSize: 24, marginBottom: 14, textAlign: "left" }}>How we measure</h2>
              <ul style={{ color: "var(--text-dim)", paddingLeft: 22, lineHeight: 1.9 }}>
                <li>These three questions are fixed and asked every day:</li>
                {cat.questions.map((q) => (
                  <li key={q} style={{ listStyle: "none", marginLeft: 8 }}>
                    &ldquo;{q}&rdquo;
                  </li>
                ))}
                {engineNames.map((e) => (ENGINE_NOTES[e] ? <li key={e}>{ENGINE_NOTES[e]}</li> : null))}
                <li>Claude and ChatGPT answer all three questions daily (ChatGPT answered only the first one before 21 October 2026). Gemini answers the first question for as many categories as its rate limit allows each day.</li>
                <li>A language model lists the brands named in each answer, and only names that literally appear in the answer are kept.</li>
                <li>These are our own fixed questions. No customer data is used on this page.</li>
              </ul>
            </div>
          </section>
        </>
      ) : (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container-narrow">
            <p style={{ color: "var(--text-muted)" }}>The first day of data for this category is being collected. Check back tomorrow.</p>
          </div>
        </section>
      )}

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <h2 style={{ fontSize: 24, marginBottom: 14, textAlign: "left" }}>Is your brand missing from these answers?</h2>
          <p style={{ color: "var(--text-dim)", lineHeight: 1.8 }}>
            AI assistants lean on what is written about a product across the web, and Reddit threads are among the
            sources they cite most. See where your brand stands with a free check, then track it daily.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
            <Link href="/free-ai-visibility-checker" className="btn btn-primary">
              Check your brand free →
            </Link>
            <Link href="/ai-recommendations" className="btn btn-ghost">
              Other categories
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
