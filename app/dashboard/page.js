import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyProfile } from "@/lib/brands";

export const dynamic = "force-dynamic";

const DAY = 86400000;

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// Thresholds match components/ScoreBadge.js (Opportunities page) so the
// same relevance_score doesn't show as a different tier color depending
// on which page it's viewed from.
function scoreColor(score) {
  if (score == null) return { bg: "var(--state-neutral-bg)", fg: "var(--text-dim)" };
  if (score >= 85) return { bg: "var(--state-success-bg)", fg: "var(--state-success-fg)" };
  if (score >= 60) return { bg: "rgba(242, 168, 59, 0.15)", fg: "var(--accent)" };
  return { bg: "var(--state-danger-bg)", fg: "var(--state-danger-fg)" };
}

// post_created_at has been stored both as epoch seconds and as a timestamp.
function toMs(v) {
  if (v == null) return null;
  if (typeof v === "number") return v < 1e12 ? v * 1000 : v;
  const n = Number(v);
  if (Number.isFinite(n)) return n < 1e12 ? n * 1000 : n;
  const t = Date.parse(v);
  return Number.isNaN(t) ? null : t;
}

function ago(ms) {
  if (!ms) return "";
  const min = Math.max(1, Math.floor((Date.now() - ms) / 60000));
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr > 1 ? "s" : ""} ago`;
  const d = Math.floor(hr / 24);
  return `${d} day${d > 1 ? "s" : ""} ago`;
}

// Change vs the previous 7 days, only when both weeks had activity: a
// "+100%" on a new account or a "-100%" on a quiet week says nothing.
function delta(thisWeek, lastWeek) {
  if (!thisWeek || !lastWeek) return null;
  return Math.round(((thisWeek - lastWeek) / lastWeek) * 100) || null;
}

const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);

/* ── Data ─────────────────────────────────────────────────────── */

async function loadData(supabase, userId, profileId) {
  const since30 = new Date(Date.now() - 30 * DAY).toISOString();
  const [{ data: opportunities }, { data: mentions }, { count: tasksCount }, { data: prompts }] = await Promise.all([
    supabase
      .from("opportunities")
      .select("id, sub, title, permalink, relevance_score, relevance_reason, post_created_at")
      .eq("user_id", userId)
      .eq("company_profile_id", profileId)
      .order("relevance_score", { ascending: false, nullsFirst: false })
      .limit(500),
    supabase
      .from("mentions")
      .select("id, sub, title, permalink, sentiment, post_created_at")
      .eq("user_id", userId)
      .eq("company_profile_id", profileId)
      .limit(500),
    supabase
      .from("report_drafts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("company_profile_id", profileId)
      .eq("posted", false),
    supabase.from("prompts").select("id").eq("user_id", userId).eq("company_profile_id", profileId).eq("active", true),
  ]);
  const promptIds = (prompts || []).map((p) => p.id);
  const { data: checks } = promptIds.length
    ? await supabase
        .from("prompt_checks")
        .select("mentioned, model, created_at")
        .in("prompt_id", promptIds)
        .gte("created_at", since30)
        .order("created_at", { ascending: true })
        .limit(5000)
    : { data: [] };
  return { opportunities: opportunities || [], mentions: mentions || [], tasksCount: tasksCount || 0, promptCount: promptIds.length, checks: checks || [] };
}

function summarize({ opportunities, mentions, tasksCount, promptCount, checks }) {
  const now = Date.now();
  const inWeek = (ms, w) => ms && ms > now - (w + 1) * 7 * DAY && ms <= now - w * 7 * DAY;
  const oppMs = opportunities.map((o) => toMs(o.post_created_at));
  const menMs = mentions.map((m) => toMs(m.post_created_at));
  const count = (arr, w) => arr.filter((ms) => inWeek(ms, w)).length;

  // AI visibility: share of checks naming the brand, per day and per engine.
  const byDay = new Map();
  const byEngine = {};
  for (const c of checks) {
    const d = c.created_at.slice(0, 10);
    const day = byDay.get(d) || { n: 0, hit: 0 };
    day.n++;
    if (c.mentioned) day.hit++;
    byDay.set(d, day);
    const e = (byEngine[c.model || "Other"] ||= { n: 0, hit: 0 });
    e.n++;
    if (c.mentioned) e.hit++;
  }
  const visIn = (w) => {
    const xs = checks.filter((c) => inWeek(Date.parse(c.created_at), w));
    return xs.length ? { n: xs.length, rate: pct(xs.filter((c) => c.mentioned).length, xs.length) } : null;
  };
  const vNow = visIn(0) || (checks.length ? { n: checks.length, rate: pct(checks.filter((c) => c.mentioned).length, checks.length) } : null);
  const vPrev = visIn(1);

  const subs = new Map();
  for (const o of opportunities) subs.set(o.sub, (subs.get(o.sub) || 0) + 1);
  const bySub = [...subs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const recent = (rows) =>
    [...rows].sort((a, b) => (toMs(b.post_created_at) || 0) - (toMs(a.post_created_at) || 0)).slice(0, 3);

  return {
    opp: { total: opportunities.length, week: count(oppMs, 0), delta: delta(count(oppMs, 0), count(oppMs, 1)), high: opportunities.filter((o) => o.relevance_score >= 80).length },
    men: { total: mentions.length, week: count(menMs, 0), delta: delta(count(menMs, 0), count(menMs, 1)) },
    tasks: tasksCount,
    vis: vNow ? { rate: vNow.rate, delta: vPrev && visIn(0) ? visIn(0).rate - vPrev.rate || null : null } : null,
    trend: [...byDay.entries()].map(([d, v]) => ({ d, rate: pct(v.hit, v.n), n: v.n })),
    engines: Object.entries(byEngine).map(([e, v]) => ({ e, rate: pct(v.hit, v.n), n: v.n })).sort((a, b) => b.n - a.n),
    promptCount,
    bySub,
    bySubTotal: opportunities.length,
    top: opportunities[0] || null,
    recentOpps: recent(opportunities),
    recentMentions: recent(mentions),
  };
}

// Shown, clearly labelled, to accounts that haven't added a brand yet.
const EXAMPLE = {
  opp: { total: 24, week: 9, delta: 12, high: 6 },
  men: { total: 8, week: 3, delta: null },
  tasks: 5,
  vis: { rate: 12, delta: 4 },
  trend: Array.from({ length: 30 }, (_, i) => ({ d: new Date(Date.now() - (29 - i) * DAY).toISOString().slice(0, 10), rate: Math.round(4 + i * 0.27 + Math.sin(i / 2) * 1.5), n: 3 })),
  engines: [
    { e: "ChatGPT", rate: 14, n: 30 },
    { e: "Claude", rate: 8, n: 30 },
    { e: "Gemini", rate: 15, n: 30 },
  ],
  promptCount: 3,
  bySub: [["r/SaaS", 8], ["r/Entrepreneur", 6], ["r/startups", 4], ["r/marketing", 3], ["r/smallbusiness", 3]],
  bySubTotal: 24,
  top: null,
  recentOpps: [
    { id: 1, sub: "r/Entrepreneur", title: "Best project management tool for a small team?", post_created_at: Date.now() - 2 * 3600000 },
    { id: 2, sub: "r/marketing", title: "Anyone using AI for content briefs?", post_created_at: Date.now() - 4 * 3600000 },
    { id: 3, sub: "r/SaaS", title: "Looking for alternatives to Notion", post_created_at: Date.now() - 6 * 3600000 },
  ],
  recentMentions: [
    { id: 1, sub: "r/startups", title: "Has anyone compared these tools for tracking AI answers?", sentiment: "positive", post_created_at: Date.now() - DAY },
    { id: 2, sub: "r/marketing", title: "What do you use to monitor brand mentions?", sentiment: "neutral", post_created_at: Date.now() - 2 * DAY },
  ],
};

/* ── Icons (stroke, 20px) ─────────────────────────────────────── */

const Icon = ({ d }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);
const I = {
  search: <Icon d={<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>} />,
  chat: <Icon d={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />} />,
  check: <Icon d={<><rect x="3" y="3" width="18" height="18" rx="3" /><path d="m8 12 3 3 5-6" /></>} />,
  chart: <Icon d={<><path d="M3 3v18h18" /><path d="M8 16v-5M13 16V8M18 16v-9" /></>} />,
  chevron: <Icon d={<path d="m9 6 6 6-6 6" />} />,
};

/* ── Pieces ───────────────────────────────────────────────────── */

function Delta({ value, unit = "%" }) {
  if (value == null) return null;
  const up = value >= 0;
  return (
    <span className={`dx-delta ${up ? "is-up" : "is-down"}`} title="Change vs the previous 7 days">
      {up ? "↑" : "↓"} {Math.abs(value)}
      {unit}
    </span>
  );
}

function Kpi({ href, icon, tone, label, value, delta, deltaUnit, sub }) {
  return (
    <Link href={href} className="dx-kpi">
      <span className={`dx-kpi-icon tone-${tone}`}>{icon}</span>
      <span className="dx-kpi-body">
        <span className="dx-kpi-label">{label}</span>
        <span className="dx-kpi-value">
          {value}
          <Delta value={delta} unit={deltaUnit} />
        </span>
        <span className="dx-kpi-sub">{sub}</span>
      </span>
      <span className="dx-kpi-chevron">{I.chevron}</span>
    </Link>
  );
}

// Server-rendered SVG: area + line over the last 30 days of daily
// mention rates, y axis rounded up to the next 5%.
function TrendChart({ points }) {
  const W = 640, H = 220, L = 60, R = 14, T = 14, B = 30;
  const max = Math.max(20, Math.ceil(Math.max(...points.map((p) => p.rate)) / 5) * 5);
  const start = Date.now() - 29 * DAY;
  const x = (d) => L + ((Date.parse(d) - start) / (29 * DAY)) * (W - L - R);
  const y = (r) => T + (1 - r / max) * (H - T - B);
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(p.d).toFixed(1)},${y(p.rate).toFixed(1)}`).join(" ");
  const area = `${line} L${x(points[points.length - 1].d).toFixed(1)},${y(0)} L${x(points[0].d).toFixed(1)},${y(0)} Z`;
  const ticks = [0, max / 4, max / 2, (3 * max) / 4, max];
  const last = points[points.length - 1];
  const xLabels = [0, 7, 14, 21, 28].map((k) => new Date(start + k * DAY));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="dx-chart" role="img" aria-label={`AI visibility over 30 days, latest ${last.rate}%`}>
      <defs>
        <linearGradient id="dxFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="var(--card-border-soft)" />
          <text x={L - 8} y={y(t) + 4} textAnchor="end" className={`dx-chart-tick${i % 2 ? " dx-tick-minor" : ""}`}>
            {Math.round(t)}%
          </text>
        </g>
      ))}
      {xLabels.map((d) => (
        <text key={+d} x={x(d.toISOString())} y={H - 8} textAnchor="middle" className="dx-chart-tick">
          {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </text>
      ))}
      <path d={area} fill="url(#dxFill)" />
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p) => (
        <circle key={p.d} cx={x(p.d)} cy={y(p.rate)} r="7" fill="transparent">
          <title>{`${p.d}: ${p.rate}% of ${p.n} answers`}</title>
        </circle>
      ))}
      <circle cx={x(last.d)} cy={y(last.rate)} r="5" fill="var(--accent)" stroke="var(--card)" strokeWidth="2.5" />
    </svg>
  );
}

function Sentiment({ value }) {
  const v = String(value || "").toLowerCase();
  if (!v) return null;
  const cls = v === "positive" ? "is-pos" : v === "negative" ? "is-neg" : "is-neu";
  return <span className={`dx-pill ${cls}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</span>;
}

function SubLabel({ sub }) {
  const s = String(sub || "");
  return s.startsWith("r/") ? s : `r/${s}`;
}

function Overview({ s, example }) {
  const showTrend = s.trend.length >= 2;
  return (
    <div className={example ? "dx-example" : undefined}>
      <div className="dx-kpis">
        <Kpi
          href="/dashboard/opportunities"
          icon={I.search}
          tone="blue"
          label="Opportunities"
          value={s.opp.total}
          delta={s.opp.delta}
          sub={s.opp.week ? `${s.opp.week} new this week · ${s.opp.high} high priority` : `${s.opp.high} high priority`}
        />
        <Kpi
          href="/dashboard/mentions"
          icon={I.chat}
          tone="green"
          label="Mentions"
          value={s.men.total}
          delta={s.men.delta}
          sub={s.men.week ? `${s.men.week} new this week` : s.men.total ? "None new this week" : "Brand mentions found"}
        />
        <Kpi
          href="/dashboard/tasks"
          icon={I.check}
          tone="amber"
          label="Tasks"
          value={s.tasks}
          sub={s.tasks ? "Waiting to be posted" : "Nothing waiting"}
        />
        <Kpi
          href="/dashboard/prompts"
          icon={I.chart}
          tone="rose"
          label="AI visibility"
          value={s.vis ? `${s.vis.rate}%` : "–"}
          delta={s.vis?.delta}
          deltaUnit=" pts"
          sub={s.vis ? "Share of AI answers naming you" : "No checks yet"}
        />
      </div>

      {s.top ? (
        <div className="opportunity-spotlight">
          <span className="opportunity-spotlight-eyebrow">Top opportunity right now</span>
          <div className="opportunity-spotlight-meta">
            <SubLabel sub={s.top.sub} />
            {s.top.relevance_score != null && (
              <span
                className="dx-pill"
                style={{ marginLeft: 10, background: scoreColor(s.top.relevance_score).bg, color: scoreColor(s.top.relevance_score).fg }}
              >
                Relevance: {s.top.relevance_score}/100
              </span>
            )}
          </div>
          <div className="opportunity-spotlight-title">{s.top.title}</div>
          {s.top.relevance_reason && <p className="opportunity-spotlight-reason">{s.top.relevance_reason}</p>}
          <div className="opportunity-spotlight-actions">
            <Link href={`/dashboard/drafts/new?url=${encodeURIComponent(s.top.permalink || "")}`} className="btn btn-primary btn-sm">
              Generate reply →
            </Link>
            <a href={s.top.permalink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
              View thread ↗
            </a>
          </div>
        </div>
      ) : null}

      <div className="dx-row dx-row-wide">
        <section className="dx-panel">
          <div className="dx-panel-head">
            <h2>AI visibility trend</h2>
            <span className="dx-panel-note">Last 30 days</span>
          </div>
          {showTrend ? (
            <>
              <TrendChart points={s.trend} />
              <div className="dx-engines">
                {s.engines.map((e) => (
                  <span key={e.e} className="dx-engine">
                    <strong>{e.e}</strong> {e.rate}%<span className="dx-engine-n"> of {e.n}</span>
                  </span>
                ))}
              </div>
              {s.vis?.rate === 0 ? (
                <p className="dx-note">
                  Not named in any answer yet.{" "}
                  <Link href="/dashboard/prompts" className="dx-link">
                    See who the engines name instead →
                  </Link>
                </p>
              ) : null}
            </>
          ) : (
            <div className="dx-empty">
              <p>
                {s.promptCount
                  ? "Your prompts are checked every day. The trend appears once there are two days of answers."
                  : "Track the questions your buyers ask AI assistants, and see each day whether ChatGPT, Claude and Gemini name you."}
              </p>
              <Link href="/dashboard/prompts" className="btn btn-primary btn-sm">
                {s.promptCount ? "Add more prompts" : "Track your first prompts"} →
              </Link>
            </div>
          )}
        </section>

        <section className="dx-panel">
          <div className="dx-panel-head">
            <h2>Opportunities by subreddit</h2>
            <Link href="/dashboard/opportunities" className="dx-link">
              View all →
            </Link>
          </div>
          {s.bySub.length ? (
            <ul className="dx-subs">
              {s.bySub.map(([sub, n]) => (
                <li key={sub}>
                  <span className="dx-sub-name">
                    <SubLabel sub={sub} />
                    <span className="dx-sub-n">
                      {n} {n === 1 ? "opportunity" : "opportunities"}
                    </span>
                  </span>
                  <span className="dx-bar">
                    <span style={{ width: `${pct(n, s.bySubTotal)}%` }} />
                  </span>
                  <span className="dx-sub-pct">{pct(n, s.bySubTotal)}%</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="dx-empty">
              <p>No opportunities yet. A scan finds the threads where buyers ask about your category.</p>
              <Link href="/dashboard/opportunities" className="btn btn-primary btn-sm">
                Find opportunities →
              </Link>
            </div>
          )}
        </section>
      </div>

      <div className="dx-row">
        <section className="dx-panel">
          <div className="dx-panel-head">
            <h2>Recent opportunities</h2>
            <Link href="/dashboard/opportunities" className="dx-link">
              View all →
            </Link>
          </div>
          {s.recentOpps.length ? (
            <ul className="dx-list">
              {s.recentOpps.map((o) => (
                <li key={o.id}>
                  <span className="dx-list-main">
                    <span className="dx-list-title">{o.title}</span>
                    <span className="dx-list-meta">
                      <SubLabel sub={o.sub} /> · {ago(toMs(o.post_created_at))}
                    </span>
                  </span>
                  {o.permalink ? (
                    <Link href={`/dashboard/drafts/new?url=${encodeURIComponent(o.permalink)}`} className="dx-action">
                      Reply →
                    </Link>
                  ) : (
                    <span className="dx-action">Reply →</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="dx-muted">Nothing yet.</p>
          )}
        </section>

        <section className="dx-panel">
          <div className="dx-panel-head">
            <h2>Recent mentions</h2>
            <Link href="/dashboard/mentions" className="dx-link">
              View all →
            </Link>
          </div>
          {s.recentMentions.length ? (
            <ul className="dx-list">
              {s.recentMentions.map((m) => (
                <li key={m.id}>
                  <span className="dx-list-main">
                    {m.permalink ? (
                      <a href={m.permalink} target="_blank" rel="noopener noreferrer" className="dx-list-title">
                        {m.title}
                      </a>
                    ) : (
                      <span className="dx-list-title">{m.title}</span>
                    )}
                    <span className="dx-list-meta">
                      <SubLabel sub={m.sub} /> · {ago(toMs(m.post_created_at))}
                    </span>
                  </span>
                  <Sentiment value={m.sentiment} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="dx-muted">No mentions of your brand found on Reddit yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */

export default async function DashboardOverviewPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = await getActiveCompanyProfile(supabase, user.id);
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);
  const sub = subs?.[0] || null;
  const hasPlan = Boolean(sub && ["active", "trialing"].includes(sub.status));

  const displayName = (user.email || "")
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .replace(/\d+$/, "")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });

  const s = profile && hasPlan ? summarize(await loadData(supabase, user.id, profile.id)) : null;

  return (
    <section className="dashboard-page">
      <div className="dx-head">
        <div>
          <h1 className="command-greeting">
            {greeting()}, {displayName}
          </h1>
          <p className="command-greeting-sub">
            {s ? `Here's what's happening with ${profile.company_name || "your brand"}.` : "Here's how AEOrank works for your brand."}
          </p>
        </div>
        <span className="dx-date">{today}</span>
      </div>

      {!profile ? (
        <>
          <div className="dx-setup">
            <div>
              <h2>Let's set up your brand</h2>
              <p>Add your website. We work out your category, find the Reddit threads where your buyers ask for recommendations, and start checking whether AI assistants name you. It takes about a minute.</p>
            </div>
            <Link href="/onboarding" className="btn btn-primary">
              Add your website →
            </Link>
          </div>
          <p className="dx-example-label">Example data: this is what your dashboard looks like once your brand is set up.</p>
          <Overview s={EXAMPLE} example />
        </>
      ) : !hasPlan ? (
        <>
          <div className="dx-setup">
            <div>
              <h2>Start your 7-day trial</h2>
              <p>{profile.company_name || "Your brand"} is set up. Choose a plan to start finding opportunities, tracking mentions and checking your AI visibility every day.</p>
            </div>
            <Link href="/dashboard/billing" className="btn btn-primary">
              Choose a plan →
            </Link>
          </div>
          <p className="dx-example-label">Example data: your own numbers appear here once your trial starts.</p>
          <Overview s={EXAMPLE} example />
        </>
      ) : (
        <Overview s={s} />
      )}
    </section>
  );
}
