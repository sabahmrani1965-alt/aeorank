import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import { getActiveCompanyProfile } from "@/lib/brands";
import { competitorsOnly } from "@/lib/brandFilter";
import PromptsManager from "@/components/PromptsManager";
import VisibilityTrendChart from "@/components/VisibilityTrendChart";
import RedeemCodeForm from "@/components/RedeemCodeForm";

export const dynamic = "force-dynamic";

// Stats window — recent enough to reflect the brand's current standing,
// wide enough that a daily cron cadence still yields a real trend line.
const STATS_WINDOW_DAYS = 30;

// Canonical display order for the per-engine strip; engines missing from
// the data simply don't render — never shown with faked zeros.
const ENGINE_ORDER = ["ChatGPT", "Perplexity", "Gemini", "Claude"];

function pct(hits, total) {
  return total ? Math.round((hits / total) * 100) : null;
}

// Aggregates every engine-check in the window into the Peec-style summary
// blocks: overall visibility, per-engine visibility, a daily trend, and a
// share-of-voice ranking of every brand the AI answers actually named.
function computeStats(checks, brand) {
  const total = checks.length;
  if (total === 0) return null;

  const mentionedCount = checks.filter((c) => c.mentioned).length;

  const positioned = checks.filter((c) => c.position != null);
  const avgPosition = positioned.length
    ? Math.round((positioned.reduce((s, c) => s + c.position, 0) / positioned.length) * 10) / 10
    : null;

  const byEngine = new Map();
  for (const c of checks) {
    const key = c.model || "Unknown";
    if (!byEngine.has(key)) byEngine.set(key, { total: 0, hits: 0 });
    const e = byEngine.get(key);
    e.total += 1;
    if (c.mentioned) e.hits += 1;
  }
  const engines = ENGINE_ORDER.filter((m) => byEngine.has(m))
    .concat([...byEngine.keys()].filter((m) => !ENGINE_ORDER.includes(m)))
    .map((m) => ({ model: m, ...byEngine.get(m), pct: pct(byEngine.get(m).hits, byEngine.get(m).total) }));

  // Daily-bucketed visibility % — one point per day that actually has
  // checks, nothing padded (the chart plots only real days).
  const byDay = new Map();
  for (const c of checks) {
    const day = String(c.created_at).slice(0, 10);
    if (!byDay.has(day)) byDay.set(day, { total: 0, hits: 0 });
    const d = byDay.get(day);
    d.total += 1;
    if (c.mentioned) d.hits += 1;
  }
  const trendPoints = [...byDay.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([day, d]) => ({ d: day, rate: pct(d.hits, d.total) ?? 0, n: d.total }));

  // Share of voice: how often each named brand shows up across all
  // answers in the window. The user's own brand is counted via the
  // `mentioned` flag (substring-checked at analysis time), which is more
  // reliable than exact-matching it inside the extracted brands array.
  const brandCounts = new Map();
  for (const c of checks) {
    for (const b of competitorsOnly(c.brands, brand)) {
      const key = b.toLowerCase();
      if (!brandCounts.has(key)) brandCounts.set(key, { name: b, count: 0 });
      brandCounts.get(key).count += 1;
    }
  }
  // The brand itself always stays in the list, with its true rank, even
  // when it isn't in the top 8: at 0% that row is the point of the table.
  const ranked = [{ name: brand, count: mentionedCount, isYou: true }, ...brandCounts.values()]
    .sort((a, b) => b.count - a.count || (a.isYou ? 1 : -1))
    .map((b, i) => ({ ...b, rank: i + 1, pct: pct(b.count, total) ?? 0 }));
  const shareOfVoice = ranked.slice(0, 8);
  if (!shareOfVoice.some((b) => b.isYou)) shareOfVoice.push(ranked.find((b) => b.isYou));

  return {
    total,
    visibilityPct: pct(mentionedCount, total),
    avgPosition,
    engines,
    trendPoints,
    shareOfVoice,
  };
}

export default async function PromptsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hasPlan = await hasActiveSubscription(supabase, user.id);
  if (!hasPlan) {
    return (
      <section className="dashboard-page">
        <div className="app-sidebar-group-label" style={{ padding: 0, marginBottom: 6 }}>Analyze</div>
        <h2 style={{ marginBottom: 16 }}>Prompts</h2>
        <div className="card" style={{ textAlign: "center", padding: 32 }}>
          <p style={{ color: "var(--text-dim)", marginBottom: 16 }}>
            This is available on any active plan.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/dashboard/billing" className="btn btn-primary">
              View plans →
            </Link>
            <RedeemCodeForm />
          </div>
        </div>
      </section>
    );
  }

  const profile = await getActiveCompanyProfile(supabase, user.id);
  const brand = profile?.company_name || "";

  const { data: prompts } = profile
    ? await supabase
        .from("prompts")
        .select(
          "id, text, type, location, active, last_checked_at, last_mentioned, last_position, last_brands, last_answer, last_model, created_at"
        )
        .eq("user_id", user.id)
        .eq("company_profile_id", profile.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const promptIds = (prompts || []).map((p) => p.id);
  const since = new Date(Date.now() - STATS_WINDOW_DAYS * 24 * 3600 * 1000).toISOString();
  const { data: checks } = promptIds.length
    ? await supabase
        .from("prompt_checks")
        .select("mentioned, position, brands, model, created_at")
        .in("prompt_id", promptIds)
        .gte("created_at", since)
        .order("created_at", { ascending: true })
    : { data: [] };

  const stats = brand ? computeStats(checks || [], brand) : null;

  // Latest stored result PER ENGINE per prompt, so each row can show its
  // full per-engine breakdown on a fresh page load — not only right after
  // a "Check now" click this session. Separate, capped query (with
  // `answer`, which the stats query above deliberately omits — answers
  // are by far the heaviest column) reduced in JS: newest-first, first
  // row seen per (prompt, model) wins. PostgREST has no DISTINCT ON.
  const { data: recentRows } = promptIds.length
    ? await supabase
        .from("prompt_checks")
        .select("prompt_id, model, mentioned, position, brands, answer, created_at")
        .in("prompt_id", promptIds)
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };
  const engineResults = {};
  for (const row of recentRows || []) {
    if (!engineResults[row.prompt_id]) engineResults[row.prompt_id] = [];
    const list = engineResults[row.prompt_id];
    if (list.some((r) => r.model === row.model)) continue;
    list.push({
      model: row.model,
      mentioned: row.mentioned,
      position: row.position,
      brands: row.brands,
      answer: row.answer,
      checkedAt: row.created_at,
    });
  }
  const engineRank = (m) => {
    const i = ENGINE_ORDER.indexOf(m);
    return i === -1 ? ENGINE_ORDER.length : i;
  };
  for (const list of Object.values(engineResults)) {
    list.sort((a, b) => engineRank(a.model) - engineRank(b.model));
  }

  const maxEngine = Math.max(1, ...(stats?.engines || []).map((e) => e.pct || 0));
  const maxVoice = Math.max(1, ...(stats?.shareOfVoice || []).map((b) => b.pct));

  return (
    <section className="dashboard-page-wide pr-page">
      <div className="op-head">
        <div>
          <h1 className="command-greeting">Prompts</h1>
          <p className="command-greeting-sub" style={{ marginBottom: 0 }}>
            Questions your buyers ask AI assistants, checked daily on ChatGPT, Gemini and Claude, with whether and where{" "}
            {brand || "your brand"} is named.
          </p>
        </div>
      </div>

      {stats && (
        <>
          <div className="dx-kpis">
            {[
              { label: `Visibility (${STATS_WINDOW_DAYS} days)`, value: stats.visibilityPct != null ? `${stats.visibilityPct}%` : "–", sub: "Share of answers naming you", tone: "rose", icon: "chart" },
              { label: "Average position", value: stats.avgPosition != null ? `#${stats.avgPosition}` : "–", sub: stats.avgPosition != null ? "When you are named" : "Not named yet", tone: "amber", icon: "rank" },
              { label: "Prompts tracked", value: (prompts || []).length, sub: "Checked every day", tone: "blue", icon: "list" },
              { label: `Answers read (${STATS_WINDOW_DAYS} days)`, value: stats.total, sub: `Across ${stats.engines.length} AI ${stats.engines.length === 1 ? "engine" : "engines"}`, tone: "green", icon: "chat" },
            ].map((k) => (
              <div key={k.label} className="dx-kpi mn-kpi">
                <span className={`dx-kpi-icon tone-${k.tone}`} aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {k.icon === "chart" ? <><path d="M3 3v18h18" /><path d="M8 16v-5M13 16V8M18 16v-9" /></> : k.icon === "rank" ? <><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" /></> : k.icon === "list" ? <><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></> : <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />}
                  </svg>
                </span>
                <span className="dx-kpi-body">
                  <span className="dx-kpi-label">{k.label}</span>
                  <span className="dx-kpi-value">{k.value}</span>
                  <span className="dx-kpi-sub">{k.sub}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="dx-row dx-row-wide">
            <section className="dx-panel">
              <div className="dx-panel-head">
                <h2>Visibility over time</h2>
                <span className="dx-panel-note">Last {STATS_WINDOW_DAYS} days</span>
              </div>
              {stats.trendPoints.length > 1 ? (
                <VisibilityTrendChart points={stats.trendPoints} />
              ) : (
                <p className="dx-muted">The trend appears after two days of checks.</p>
              )}
            </section>
            <section className="dx-panel">
              <div className="dx-panel-head">
                <h2>By AI engine</h2>
              </div>
              <ul className="dx-subs">
                {stats.engines.map((e) => (
                  <li key={e.model}>
                    <span className="dx-sub-name">
                      {e.model}
                      <span className="dx-sub-n">
                        Named in {e.hits} of {e.total} answers
                      </span>
                    </span>
                    <span className="dx-bar">
                      <span style={{ width: `${((e.pct || 0) / maxEngine) * 100}%` }} />
                    </span>
                    <span className="dx-sub-pct">{e.pct != null ? `${e.pct}%` : "–"}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {stats.shareOfVoice.length > 1 && (
            <section className="dx-panel pr-voice">
              <div className="dx-panel-head">
                <h2>Share of voice</h2>
                <span className="dx-panel-note">Brands named across all answers, last {STATS_WINDOW_DAYS} days</span>
              </div>
              <ol className="pr-voice-list">
                {stats.shareOfVoice.map((b) => (
                  <li key={b.name} className={b.isYou ? "is-you" : undefined}>
                    <span className="pr-voice-rank">{b.count ? b.rank : "–"}</span>
                    <span className="pr-voice-name">
                      {b.name}
                      {b.isYou ? <span className="pr-you">You</span> : null}
                    </span>
                    <span className="dx-bar">
                      <span style={{ width: `${(b.pct / maxVoice) * 100}%`, background: b.isYou ? "var(--accent-3)" : undefined }} />
                    </span>
                    <span className="dx-sub-pct">{b.pct}%</span>
                    <span className="pr-voice-n">
                      {b.count}/{stats.total}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </>
      )}

      <PromptsManager initialPrompts={prompts || []} initialEngineResults={engineResults} brand={brand} />
    </section>
  );
}
