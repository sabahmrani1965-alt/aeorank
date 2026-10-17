import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import MarketingLayout from "@/components/MarketingLayout";
import { getCategory, loadReddit, loadSummary } from "@/lib/categoryData";
import { createAdminClient } from "@/lib/supabase/admin";

// One brand's AI report, the page the outreach email links to: what the
// engines answered for its category, who they named instead, and how that
// changes. Built from the same daily summary as /ai-recommendations.
// Not indexed: it exists for the person the email went to.
export const dynamic = "force-dynamic";

const keyOf = (n) =>
  String(n)
    .toLowerCase()
    .replace(/\.(com|io|ai|co|app)$/, "")
    .replace(/\s+(crm|software|app|platform|suite)$/, "")
    .replace(/[^a-z0-9]/g, "");

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const longDate = (d) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });

export async function generateMetadata({ params }) {
  const cat = getCategory(params.category);
  const brand = decodeURIComponent(params.brand);
  return {
    title: cat ? `${brand} in AI answers for ${cat.name}` : "AI report",
    robots: { index: false, follow: false },
  };
}

// Who opened the report, so a follow-up can be timed. Email link scanners
// open links too, so the user agent is kept to tell them apart.
async function recordVisit(category, brand, ref) {
  const admin = createAdminClient();
  if (!admin) return;
  const h = headers();
  const at = new Date().toISOString();
  const body = { at, category, brand, ref: ref || null, ua: h.get("user-agent") || null, country: h.get("x-vercel-ip-country") || null };
  await admin.storage
    .from("outreach")
    .upload(`visits/${at.replace(/[:.]/g, "-")}-${keyOf(brand)}.json`, JSON.stringify(body), { contentType: "application/json" })
    .catch(() => {});
}

function Stat({ value, label, tone }) {
  return (
    <div style={{ flex: "1 1 150px" }}>
      <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1, color: tone || "var(--text)", fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 6, lineHeight: 1.4 }}>{label}</div>
    </div>
  );
}

function Bar({ name, share, you }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(110px, 180px) 1fr 52px", gap: 12, alignItems: "center", padding: "7px 0" }}>
      <span style={{ color: "var(--text)", fontWeight: you ? 800 : 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
      <span style={{ height: 10, borderRadius: 5, background: "var(--border)", overflow: "hidden" }}>
        <span style={{ display: "block", height: "100%", width: `${Math.max(you ? 0 : 2, share)}%`, background: you ? "#d4553a" : "var(--accent)", borderRadius: 5 }} />
      </span>
      <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: you ? "#d4553a" : "var(--text-dim)", fontWeight: you ? 800 : 500 }}>
        {Math.round(share)}%
      </span>
    </div>
  );
}

// "HubSpot CRM" -> /\bhubspot\b/i, so the short name people write counts.
function nameRe(name) {
  const core = String(name).toLowerCase().replace(/\s+(crm|software|app|platform|suite)$/, "").trim();
  return new RegExp(`\\b${core.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
}

function Chip({ children, tone }) {
  const c = tone === "bad" ? "#d4553a" : tone === "good" ? "#2f8f5b" : "var(--text-dim)";
  return (
    <span style={{ display: "inline-block", fontSize: 13, padding: "3px 9px", borderRadius: 999, border: `1px solid ${tone ? c : "var(--border)"}`, color: c, fontWeight: tone ? 700 : 500 }}>
      {children}
    </span>
  );
}

const H2 = ({ children }) => <h2 style={{ fontSize: 24, marginBottom: 14, textAlign: "left", textWrap: "balance" }}>{children}</h2>;

export default async function BrandReport({ params, searchParams }) {
  const cat = getCategory(params.category);
  if (!cat) notFound();
  const brand = decodeURIComponent(params.brand).slice(0, 60);
  const [d, reddit] = await Promise.all([loadSummary(cat.slug), loadReddit(cat.slug).catch(() => null)]);
  if (!d?.brands?.length) notFound();
  if (searchParams?.r) await recordVisit(cat.slug, brand, String(searchParams.r).slice(0, 20));

  const k = keyOf(brand);
  const ranked = d.brands.find((b) => keyOf(b.name) === k);
  const mentioned = ranked || (d.mentioned || []).includes(k);
  const share = ranked ? ranked.share : 0;
  const named = ranked ? ranked.answers : 0;
  const engines = Object.keys(d.engines).sort();
  const others = d.brands.filter((b) => keyOf(b.name) !== k).slice(0, 8);
  const [lead] = others;
  const range = d.firstDay === d.lastDay ? `on ${longDate(d.firstDay)}` : `from ${longDate(d.firstDay)} to ${longDate(d.lastDay)}`;

  // Only threads whose text we actually have can say who is (not) in them.
  const brandRe = nameRe(brand);
  const threads = (reddit?.threads || [])
    .filter((t) => t.text && t.text.length > 1500)
    .slice(0, 6)
    .map((t) => ({ ...t, names: d.brands.filter((b) => keyOf(b.name) !== k && nameRe(b.name).test(t.text)).map((b) => b.name), has: brandRe.test(t.text) }));
  const without = threads.filter((t) => !t.has).length;
  const leadIn = lead ? threads.filter((t) => t.names.includes(lead.name)).length : 0;

  const headline = !mentioned
    ? `${brand} isn't in the AI answers for ${cat.name}`
    : ranked
      ? `${brand} is named in ${Math.round(share)}% of AI answers for ${cat.name}`
      : `${brand} is barely in the AI answers for ${cat.name}`;

  return (
    <MarketingLayout>
      <section className="section">
        <div className="container-narrow">
          <span className="section-tag">( AI visibility report · {cat.name} )</span>
          <h1 style={{ textAlign: "left", textWrap: "balance" }}>{headline}</h1>
          <p className="section-sub" style={{ textAlign: "left", marginLeft: 0 }}>
            Every day we ask ChatGPT, Claude and Gemini the questions a buyer asks before choosing {cat.name}, and record
            which brands they name. This is what they answered {range}, and where {brand} stands.
          </p>

          <div className="card" style={{ padding: 28, marginTop: 28 }}>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <Stat value={`${named} of ${d.totalAnswers}`} label={`answers named ${brand}`} tone={named ? undefined : "#d4553a"} />
              {lead ? <Stat value={`${lead.answers} of ${d.totalAnswers}`} label={`answers named ${lead.name}`} /> : null}
              <Stat value={d.mentioned ? d.mentioned.length : d.brands.length} label={`brands named instead${mentioned ? " or alongside" : ""}`} />
              <Stat value={engines.length} label={`AI engines asked: ${engines.join(", ")}`} />
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <H2>Who the engines recommend</H2>
          <p style={{ color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 12 }}>Share of answers that named each brand.</p>
          <div className="card" style={{ padding: "18px 24px" }}>
            {others.map((b) => (
              <Bar key={b.name} name={b.name} share={b.share} />
            ))}
            <div style={{ borderTop: "1px solid var(--border)", marginTop: 8, paddingTop: 8 }}>
              <Bar name={brand} share={share} you />
            </div>
          </div>
        </div>
      </section>


      {threads.length ? (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container-narrow">
            <H2>Where buyers ask about {cat.name} on Reddit</H2>
            <p style={{ color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 14 }}>
              Threads like these are what the engines learn a category from. {brand} is missing from {without} of these {threads.length}
              {lead && leadIn ? `; ${lead.name} is in ${leadIn}` : ""}.
            </p>
            <div style={{ display: "grid", gap: 12 }}>
              {threads.map((t) => (
                <a key={t.url} href={t.url} target="_blank" rel="noopener noreferrer nofollow" className="card" style={{ padding: "16px 20px", textDecoration: "none", display: "block" }}>
                  <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 4 }}>r/{t.sub}</div>
                  <div style={{ color: "var(--text)", fontWeight: 700, lineHeight: 1.4, marginBottom: 10 }}>{t.title}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    <Chip tone={t.has ? "good" : "bad"}>{t.has ? `${brand} mentioned` : `No ${brand}`}</Chip>
                    {t.names.slice(0, 5).map((n) => (
                      <Chip key={n}>{n}</Chip>
                    ))}
                    {t.names.length > 5 ? <Chip>+{t.names.length - 5} more</Chip> : null}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {d.latest?.length ? (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container-narrow">
            <H2>What they actually said</H2>
            <p style={{ color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 14 }}>
              The latest answers, word for word. This is what a buyer reads before they ever reach your site.
            </p>
            <div style={{ display: "grid", gap: 14 }}>
              {d.latest.map((l) => (
                <figure key={l.engine} className="card" style={{ padding: 22, margin: 0 }}>
                  <figcaption style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 8 }}>
                    <strong style={{ color: "var(--text)" }}>{l.engine}</strong>, asked &ldquo;{l.question}&rdquo;
                  </figcaption>
                  <blockquote style={{ margin: 0, color: "var(--text-dim)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                    {l.answer.length > 600 ? `${l.answer.slice(0, 600).replace(/\s+\S*$/, "")}…` : l.answer}
                  </blockquote>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <H2>Why {brand} {mentioned ? "isn't named more" : "is missing"}</H2>
          <p style={{ color: "var(--text-dim)", lineHeight: 1.8 }}>
            These engines don&apos;t rank websites. They repeat what they have read about a category: Reddit threads
            where people compare tools, review sites and &ldquo;best {cat.name}&rdquo; roundups. The brands that keep
            coming up in those conversations are the ones the answers name.{" "}
            {lead ? `${lead.name} comes up in them again and again. ` : ""}
            {mentioned ? `${brand} shows up too rarely to make most answers.` : `${brand} isn't there often enough to be named at all.`}
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <H2>How {brand} gets into these answers</H2>
          <ol style={{ color: "var(--text-dim)", lineHeight: 1.8, paddingLeft: 22, display: "grid", gap: 10 }}>
            <li>
              <strong style={{ color: "var(--text)" }}>Find the sources behind the answers.</strong> The Reddit threads and
              pages the engines draw on when someone asks about {cat.name}, ranked by how much buying intent they carry.
            </li>
            <li>
              <strong style={{ color: "var(--text)" }}>Put {brand} in those conversations.</strong> Useful, honest
              comments from real accounts where people are choosing a tool, not ads.
            </li>
            <li>
              <strong style={{ color: "var(--text)" }}>Ask again every day.</strong> The same questions, the same
              engines, so you see the week {brand} starts being named.
            </li>
          </ol>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <div className="card" style={{ padding: 32 }}>
            <H2>Want this done for {brand}?</H2>
            <p style={{ color: "var(--text-dim)", lineHeight: 1.8, margin: 0 }}>
              AEOrank does all three and sends you this report every week, with the answers as they change. Try it free
              for 7 days. If nothing about it is useful to you, cancel before the trial ends and pay nothing.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 22 }}>
              <Link href={`/start?brand=${encodeURIComponent(brand)}`} className="btn btn-primary">
                Start the free trial →
              </Link>
              <a href={`mailto:ilyas@aeorank.tech?subject=${encodeURIComponent(`${brand} and AI answers`)}`} className="btn btn-ghost">
                Ask me a question
              </a>
            </div>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7, marginTop: 18 }}>
            Method: the same fixed questions every day, for example &ldquo;{cat.questions[0]}&rdquo; Brand names are
            read from each answer, and a brand counts once per answer. Full category data:{" "}
            <Link href={`/ai-recommendations/${cat.slug}`}>{cap(cat.name)} in AI answers</Link>.
          </p>
        </div>
      </section>
    </MarketingLayout>
  );
}
