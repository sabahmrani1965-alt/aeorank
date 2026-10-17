import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import MarketingLayout from "@/components/MarketingLayout";
import { getCategory, loadReddit, loadSummary } from "@/lib/categoryData";
import { createAdminClient } from "@/lib/supabase/admin";

// One brand's AI report, the page the outreach email links to: what the
// engines answered for its category, who they named instead, the Reddit
// threads behind it, and how that changes. Built from the same daily summary
// as /ai-recommendations. Not indexed: it exists for the person the email
// went to.
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
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// "HubSpot CRM" -> "hubspot", so the short name people write counts.
const coreName = (name) =>
  String(name)
    .toLowerCase()
    .replace(/\s+(crm|software|app|platform|suite)$/, "")
    .trim();
const nameRe = (name) => new RegExp(`\\b${escRe(coreName(name))}\\b`, "i");

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

// Wraps every brand name the summary knows in <mark>; the report's own brand
// gets the "you" style.
function Highlighted({ text, names, you }) {
  const all = [...new Set([you, ...names].map(coreName).filter((n) => n.length > 2))].sort((a, b) => b.length - a.length);
  if (!all.length) return text;
  const re = new RegExp(`\\b(${all.map(escRe).join("|")})\\b`, "gi");
  const youCore = coreName(you);
  return text.split(re).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className={part.toLowerCase() === youCore ? "rp-mark rp-mark-you" : "rp-mark"}>
        {part}
      </mark>
    ) : (
      part
    )
  );
}

const CSS = `
.rp { --text-dim: #343944; --text-muted: #5a6070; --rp-bad: #c4432a; --rp-good: #2f8f5b; --rp-bad-bg: rgba(212,85,58,.09); --rp-good-bg: rgba(47,143,91,.1); }
.rp-wrap { max-width: 920px; margin: 0 auto; padding: 0 24px; }
.rp-sec { padding: 0 0 64px; }
.rp-hero { padding: 72px 0 40px; }
.rp-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; color: var(--text-muted); font-size: 14.5px; letter-spacing: .02em; margin-bottom: 18px; }
.rp-meta b { color: var(--text); font-weight: 700; letter-spacing: .06em; text-transform: uppercase; font-size: 12px; }
.rp-meta i { width: 4px; height: 4px; border-radius: 50%; background: var(--text-muted); opacity: .5; }
.rp h1 { font-size: clamp(32px, 5vw, 52px); font-weight: 800; letter-spacing: -.025em; line-height: 1.06; margin: 0 0 18px; text-align: left; text-wrap: balance; }
.rp h1 em { font-style: normal; color: var(--rp-bad); }
.rp-lede { color: var(--text-dim); font-size: 18.5px; line-height: 1.65; max-width: 680px; margin: 0; }
.rp h2 { font-size: 27px; font-weight: 800; letter-spacing: -.015em; margin: 0 0 8px; text-align: left; text-wrap: balance; }
.rp-sub { color: var(--text-dim); font-size: 17px; line-height: 1.65; margin: 0 0 20px; max-width: 680px; }
.rp-card { background: var(--card); border: 1px solid var(--card-border); border-radius: 16px; }

.rp-verdict { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); margin-top: 32px; overflow: hidden; }
.rp-v-main { padding: 28px; border-right: 1px solid var(--card-border); }
.rp-v-num { font-size: 64px; font-weight: 800; line-height: 1; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }
.rp-v-num small { font-size: 26px; color: var(--text-muted); font-weight: 700; letter-spacing: 0; }
.rp-v-label { color: var(--text-dim); font-size: 17px; margin-top: 8px; line-height: 1.5; }
.rp-v-vs { margin-top: 18px; padding-top: 16px; border-top: 1px dashed var(--card-border); color: var(--text-dim); font-size: 16px; line-height: 1.5; }
.rp-v-vs strong { color: var(--text); }
.rp-v-eng { padding: 22px 28px; display: grid; gap: 10px; align-content: center; }
.rp-v-eng-title { font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--text-muted); }
.rp-eng { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 10px; background: var(--rp-bad-bg); }
.rp-eng.ok { background: var(--rp-good-bg); }
.rp-eng span { font-weight: 700; color: var(--text); }
.rp-eng em { font-style: normal; font-size: 15px; font-weight: 700; color: var(--rp-bad); }
.rp-eng.ok em { color: var(--rp-good); }

.rp-bars { padding: 14px 24px 16px; }
.rp-bar { display: grid; grid-template-columns: minmax(96px, 180px) 1fr 48px; gap: 14px; align-items: center; padding: 8px 0; }
.rp-bar-name { color: var(--text); font-weight: 600; font-size: 16px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rp-bar-track { height: 10px; border-radius: 5px; background: var(--border); overflow: hidden; }
.rp-bar-fill { display: block; height: 100%; border-radius: 5px; background: var(--accent); }
.rp-bar-pct { text-align: right; font-variant-numeric: tabular-nums; color: var(--text-dim); font-size: 16px; font-weight: 600; }
.rp-bar.you { border-top: 1px solid var(--card-border); margin-top: 6px; padding-top: 14px; }
.rp-bar.you .rp-bar-name, .rp-bar.you .rp-bar-pct { color: var(--rp-bad); font-weight: 800; }

.rp-why { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.rp-why .rp-card { padding: 20px; display: flex; flex-direction: column; }
.rp-why h3 { font-size: 17.5px; margin: 0 0 8px; line-height: 1.35; color: var(--text); }
.rp-why p { color: var(--text-dim); line-height: 1.65; margin: 0; font-size: 16px; }
.rp-why a { margin-top: auto; padding-top: 12px; font-size: 14px; color: var(--text-muted); }
.rp-kicker { margin: 18px 0 0; padding: 16px 20px; border-radius: 12px; background: var(--accent-dim); color: var(--text); font-size: 17px; font-weight: 600; line-height: 1.55; }

.rp-threads { display: grid; gap: 10px; }
.rp-thread { display: grid; grid-template-columns: 1fr auto; gap: 6px 16px; padding: 16px 20px; text-decoration: none; transition: border-color .15s; }
.rp-thread:hover { border-color: var(--accent); }
.rp-thread:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.rp-thread-sub { color: var(--text-muted); font-size: 14px; }
.rp-thread-title { grid-column: 1; color: var(--text); font-weight: 700; font-size: 17px; line-height: 1.4; }
.rp-thread-status { grid-column: 2; grid-row: 1 / span 2; align-self: center; }
.rp-thread-names { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
.rp-chip { display: inline-block; font-size: 13.5px; padding: 3px 9px; border-radius: 999px; border: 1px solid var(--card-border); color: var(--text-dim); }
.rp-chip.bad { border-color: var(--rp-bad); color: var(--rp-bad); background: var(--rp-bad-bg); font-weight: 700; }
.rp-chip.good { border-color: var(--rp-good); color: var(--rp-good); background: var(--rp-good-bg); font-weight: 700; }
.rp-note { color: var(--text-muted); font-size: 14px; margin: 10px 0 0; }

.rp-answers { display: grid; gap: 12px; }
.rp-answer { padding: 22px 26px; }
.rp-answer-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 10px; }
.rp-answer-head div { color: var(--text-muted); font-size: 15px; line-height: 1.5; }
.rp-answer-head strong { color: var(--text); }
.rp-answer blockquote { margin: 0; color: var(--text-dim); font-size: 16.5px; line-height: 1.75; white-space: pre-line; max-width: 72ch; }
.rp-answer details { margin-top: 6px; }
.rp-answer summary { cursor: pointer; color: var(--text); font-size: 15px; font-weight: 600; list-style: none; }
.rp-answer summary::-webkit-details-marker { display: none; }
.rp-answer summary::after { content: " ↓"; }
.rp-answer details[open] summary { display: none; }
.rp-mark { background: rgba(242,168,59,.28); color: var(--text); padding: 1px 4px; border-radius: 4px; font-weight: 700; }
.rp-mark-you { background: var(--rp-good-bg); color: var(--rp-good); }

.rp-steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; counter-reset: step; }
.rp-step { padding: 22px; }
.rp-step-n { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; font-size: 14px; background: var(--accent-dim); color: var(--text); margin-bottom: 14px; }
.rp-step h3 { font-size: 17.5px; margin: 0 0 6px; color: var(--text); line-height: 1.35; }
.rp-step p { margin: 0; color: var(--text-dim); line-height: 1.65; font-size: 16px; }

.rp-cta { padding: 34px; display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 28px; align-items: center; border-color: var(--accent); }
.rp-cta h2 { font-size: 28px; margin-bottom: 10px; }
.rp-cta p { color: var(--text-dim); font-size: 17px; line-height: 1.65; margin: 0; }
.rp-cta ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 9px; }
.rp-cta li { display: flex; gap: 10px; color: var(--text); line-height: 1.5; font-size: 16px; }
.rp-cta li::before { content: "✓"; color: var(--accent); font-weight: 800; }
.rp-cta-actions { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.rp-cta-actions small { color: var(--text-muted); font-size: 14.5px; }
.rp-method { color: var(--text-muted); font-size: 14.5px; line-height: 1.7; margin: 20px 0 0; }

@media (max-width: 760px) {
  .rp-hero { padding: 44px 0 28px; }
  .rp-sec { padding-bottom: 48px; }
  .rp-wrap { padding: 0 16px; }
  .rp-verdict, .rp-cta { grid-template-columns: 1fr; }
  .rp-v-main { border-right: 0; border-bottom: 1px solid var(--card-border); }
  .rp-v-num { font-size: 52px; }
  .rp-why, .rp-steps { grid-template-columns: 1fr; }
  .rp-thread { grid-template-columns: 1fr; }
  .rp-thread-status { grid-column: 1; grid-row: auto; }
  .rp-cta { padding: 24px; }
}
`;

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
  const brandRe = nameRe(brand);

  // Only threads opened with their comments (v2) can say who is (not) in them.
  const threads = (reddit?.v === 2 ? reddit.threads : [])
    .filter((t) => t.text)
    .slice(0, 6)
    .map((t) => ({ ...t, names: d.brands.filter((b) => keyOf(b.name) !== k && nameRe(b.name).test(t.text)).map((b) => b.name), has: brandRe.test(t.text) }));
  const without = threads.filter((t) => !t.has).length;
  const leadIn = lead ? threads.filter((t) => t.names.includes(lead.name)).length : 0;

  const headline = !mentioned ? (
    <>
      {brand} <em>isn&apos;t</em> in the AI answers for {cat.name}
    </>
  ) : ranked ? (
    <>
      {brand} is named in {Math.round(share)}% of AI answers for {cat.name}
    </>
  ) : (
    <>
      {brand} is <em>barely</em> in the AI answers for {cat.name}
    </>
  );
  const allNames = d.brands.map((b) => b.name);

  return (
    <MarketingLayout>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="rp">
        <header className="rp-hero">
          <div className="rp-wrap">
            <div className="rp-meta">
              <b>AI visibility report</b>
              <i />
              <span>{cap(cat.name)}</span>
              <i />
              <span>Prepared for {brand}</span>
              <i />
              <span>{longDate(d.lastDay)}</span>
            </div>
            <h1>{headline}</h1>
            <p className="rp-lede">
              Every day we ask ChatGPT, Claude and Gemini the questions a buyer asks before choosing {cat.name}, and record
              which brands they name. This is what they answered {range}, and where {brand} stands.
            </p>

            <div className="rp-card rp-verdict">
              <div className="rp-v-main">
                <div className="rp-v-num" style={{ color: named ? "var(--text)" : "var(--rp-bad)" }}>
                  {named}
                  <small> / {d.totalAnswers}</small>
                </div>
                <div className="rp-v-label">AI answers that named {brand}</div>
                {lead ? (
                  <div className="rp-v-vs">
                    <strong>{lead.name}</strong> was named in {lead.answers} of the same {d.totalAnswers}, and{" "}
                    {d.mentioned ? d.mentioned.length - (mentioned ? 1 : 0) : d.brands.length} other brands came up.
                  </div>
                ) : null}
              </div>
              <div className="rp-v-eng">
                <div className="rp-v-eng-title">By engine</div>
                {engines.map((e) => {
                  const p = Math.round(ranked?.byEngine?.[e] || 0);
                  return (
                    <div key={e} className={`rp-eng${p ? " ok" : ""}`}>
                      <span>{e}</span>
                      <em>{p ? `Named in ${p}%` : "Not named"}</em>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </header>

        <section className="rp-sec">
          <div className="rp-wrap">
            <h2>Who the engines recommend instead</h2>
            <p className="rp-sub">Share of answers that named each brand.</p>
            <div className="rp-card rp-bars">
              {others.map((b) => (
                <div key={b.name} className="rp-bar">
                  <span className="rp-bar-name">{b.name}</span>
                  <span className="rp-bar-track">
                    <span className="rp-bar-fill" style={{ width: `${Math.max(2, b.share)}%` }} />
                  </span>
                  <span className="rp-bar-pct">{Math.round(b.share)}%</span>
                </div>
              ))}
              <div className="rp-bar you">
                <span className="rp-bar-name">{brand}</span>
                <span className="rp-bar-track">
                  <span className="rp-bar-fill" style={{ width: `${share}%`, background: "var(--rp-bad)" }} />
                </span>
                <span className="rp-bar-pct">{Math.round(share)}%</span>
              </div>
            </div>
          </div>
        </section>

        <section className="rp-sec">
          <div className="rp-wrap">
            <h2>Why Reddit shapes these answers</h2>
            <p className="rp-sub">The engines don&apos;t rank websites. They repeat what they have read about a category, and much of that is Reddit.</p>
            <div className="rp-why">
              <div className="rp-card">
                <h3>It&apos;s the site AI engines cite most</h3>
                <p>
                  A March 2026 study of 30 million AI citations ranked Reddit first overall, and first or second on every engine
                  tested: ChatGPT, Gemini, Google AI Overviews and Perplexity.
                </p>
                <a href="https://docs.peec.ai/research/most-cited-domains-in-ai-search" target="_blank" rel="noopener noreferrer nofollow">
                  Source: Peec AI ↗
                </a>
              </div>
              <div className="rp-card">
                <h3>Google and OpenAI pay for it</h3>
                <p>
                  Both signed data deals with Reddit in 2024. OpenAI&apos;s gives ChatGPT real-time access to Reddit conversations;
                  Google&apos;s was reported at about $60 million a year.
                </p>
                <a href="https://fortune.com/2024/05/16/sam-altman-openai-reddit-partner" target="_blank" rel="noopener noreferrer nofollow">
                  Source: Fortune ↗
                </a>
              </div>
              <div className="rp-card">
                <h3>It&apos;s where buyers compare tools</h3>
                <p>
                  When someone asks which {cat.name} to pick, real users answer with the tools they use. An engine asked the same
                  question repeats the names it keeps reading there.
                </p>
              </div>
            </div>
            <p className="rp-kicker">
              So a brand that isn&apos;t in the Reddit threads where its category gets discussed is rarely in the answers either.
            </p>
          </div>
        </section>

        {threads.length ? (
          <section className="rp-sec">
            <div className="rp-wrap">
              <h2>Where buyers ask about {cat.name} on Reddit</h2>
              <p className="rp-sub">
                The busiest threads where people ask for {cat.name}. <strong style={{ color: "var(--text)" }}>{brand} isn&apos;t in {without} of these {threads.length}</strong>
                {lead && leadIn ? `; ${lead.name} is in ${leadIn}` : ""}.
              </p>
              <div className="rp-threads">
                {threads.map((t) => (
                  <a key={t.url} href={t.url} target="_blank" rel="noopener noreferrer nofollow" className="rp-card rp-thread">
                    <span className="rp-thread-sub">
                      r/{t.sub}
                      {t.ups ? ` · ${t.ups} upvotes` : ""}
                      {t.comments ? ` · ${t.comments} comments` : ""}
                    </span>
                    <span className="rp-thread-title">{t.title}</span>
                    <span className="rp-thread-status">
                      <span className={`rp-chip ${t.has ? "good" : "bad"}`}>{t.has ? `${brand} mentioned` : `No ${brand}`}</span>
                    </span>
                    {t.names.length ? (
                      <span className="rp-thread-names">
                        {t.names.slice(0, 6).map((n) => (
                          <span key={n} className="rp-chip">
                            {n}
                          </span>
                        ))}
                        {t.names.length > 6 ? <span className="rp-chip">+{t.names.length - 6} more</span> : null}
                      </span>
                    ) : null}
                  </a>
                ))}
              </div>
              <p className="rp-note">Checked against each thread&apos;s post and its top comments.</p>
            </div>
          </section>
        ) : null}

        {d.latest?.length ? (
          <section className="rp-sec">
            <div className="rp-wrap">
              <h2>What the engines actually said</h2>
              <p className="rp-sub">The latest answers, word for word, with every brand they named highlighted. This is what a buyer reads before they reach your site.</p>
              <div className="rp-answers">
                {d.latest.map((orig) => {
                  let l = orig;
                  l = { ...l, answer: l.answer.replace(/\n{2,}/g, "\n") };
                  const has = brandRe.test(l.answer);
                  const cut = l.answer.length > 340 ? l.answer.slice(0, 340).replace(/\s+\S*$/, "") : null;
                  return (
                    <figure key={l.engine} className="rp-card rp-answer" style={{ margin: 0 }}>
                      <div className="rp-answer-head">
                        <div>
                          <strong>{l.engine}</strong>, asked &ldquo;{l.question}&rdquo;
                        </div>
                        <span className={`rp-chip ${has ? "good" : "bad"}`}>{has ? `${brand} named` : `No ${brand}`}</span>
                      </div>
                      <blockquote>
                        {cut ? (
                          <>
                            <Highlighted text={`${cut}…`} names={allNames} you={brand} />
                            <details>
                              <summary>Read the full answer</summary>
                              <Highlighted text={l.answer.slice(cut.length)} names={allNames} you={brand} />
                              {l.answer.length >= 900 ? "…" : ""}
                            </details>
                          </>
                        ) : (
                          <Highlighted text={l.answer} names={allNames} you={brand} />
                        )}
                      </blockquote>
                    </figure>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        <section className="rp-sec">
          <div className="rp-wrap">
            <h2>How {brand} gets into these answers</h2>
            <p className="rp-sub">
              {lead ? `${lead.name} comes up in these conversations again and again. ` : ""}
              {mentioned ? `${brand} shows up too rarely to make most answers.` : `${brand} isn't there often enough to be named at all.`} Changing
              that takes three steps.
            </p>
            <div className="rp-steps">
              <div className="rp-card rp-step">
                <div className="rp-step-n">1</div>
                <h3>Find the sources behind the answers</h3>
                <p>The Reddit threads and pages the engines draw on for {cat.name}, ranked by how much buying intent they carry.</p>
              </div>
              <div className="rp-card rp-step">
                <div className="rp-step-n">2</div>
                <h3>Put {brand} in those conversations</h3>
                <p>Useful, honest comments from real accounts where people are choosing a tool. Not ads.</p>
              </div>
              <div className="rp-card rp-step">
                <div className="rp-step-n">3</div>
                <h3>Ask again every day</h3>
                <p>The same questions, the same engines, so you see the week {brand} starts being named.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rp-sec">
          <div className="rp-wrap">
            <div className="rp-card rp-cta">
              <div>
                <h2>Want this done for {brand}?</h2>
                <p>AEOrank does all three, and sends you this report every week with the answers as they change.</p>
              </div>
              <ul>
                <li>The threads that matter for {cat.name}, found daily</li>
                <li>Comments written and posted for {brand}</li>
                <li>ChatGPT, Claude and Gemini re-asked every day</li>
              </ul>
              <div className="rp-cta-actions">
                <Link href={`/start?brand=${encodeURIComponent(brand)}`} className="btn btn-primary">
                  Start the 7-day free trial →
                </Link>
                <a href={`mailto:ilyas@aeorank.tech?subject=${encodeURIComponent(`${brand} and AI answers`)}`} className="btn btn-ghost">
                  Ask me a question
                </a>
                <small>Cancel before day 7 and pay nothing.</small>
              </div>
            </div>
            <p className="rp-method">
              Method: the same fixed questions every day, for example &ldquo;{cat.questions[0]}&rdquo; Brand names are read from each
              answer, and a brand counts once per answer. Full category data:{" "}
              <Link href={`/ai-recommendations/${cat.slug}`}>{cap(cat.name)} in AI answers</Link>.
            </p>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
