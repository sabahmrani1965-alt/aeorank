import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import { getActiveCompanyProfile } from "@/lib/brands";
import PromptsManager from "@/components/PromptsManager";
import PromptTrendChart from "@/components/PromptTrendChart";
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
  // checks, nothing padded (same honesty rule as PromptTrendChart itself).
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
    .map(([day, d]) => ({
      label: new Date(`${day}T00:00:00Z`).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      value: pct(d.hits, d.total) ?? 0,
    }));

  // Share of voice: how often each named brand shows up across all
  // answers in the window. The user's own brand is counted via the
  // `mentioned` flag (substring-checked at analysis time), which is more
  // reliable than exact-matching it inside the extracted brands array.
  const brandCounts = new Map();
  for (const c of checks) {
    for (const b of c.brands || []) {
      const key = b.toLowerCase();
      if (key === brand.toLowerCase()) continue;
      if (!brandCounts.has(key)) brandCounts.set(key, { name: b, count: 0 });
      brandCounts.get(key).count += 1;
    }
  }
  const shareOfVoice = [
    { name: brand, count: mentionedCount, isYou: true },
    ...[...brandCounts.values()],
  ]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((b, i) => ({ ...b, rank: i + 1, pct: pct(b.count, total) ?? 0 }));

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

  return (
    <section className="dashboard-page">
      <div className="app-sidebar-group-label" style={{ padding: 0, marginBottom: 6 }}>Analyze</div>
      <h2 style={{ marginBottom: 8 }}>Prompts</h2>
      <p style={{ color: "var(--text-dim)", marginBottom: 28, maxWidth: 640 }}>
        Real questions checked against live AI models — ChatGPT, Perplexity, Gemini and Claude —
        showing whether, and where, your brand actually gets mentioned when someone asks.
      </p>

      {stats && (
        <>
          <div className="kpi-row" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 20 }}>
            <div className="kpi">
              <div className="kpi-label">Visibility score ({STATS_WINDOW_DAYS}d)</div>
              <div className="kpi-value">{stats.visibilityPct != null ? `${stats.visibilityPct}%` : "-"}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Avg. position</div>
              <div className="kpi-value">{stats.avgPosition != null ? `#${stats.avgPosition}` : "-"}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Prompts tracked</div>
              <div className="kpi-value">{(prompts || []).length}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Checks ({STATS_WINDOW_DAYS}d)</div>
              <div className="kpi-value">{stats.total}</div>
            </div>
          </div>

          {stats.engines.length > 0 && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
              {stats.engines.map((e) => (
                <div key={e.model} className="card" style={{ padding: "14px 18px", flex: "1 1 150px", minWidth: 150 }}>
                  <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 4 }}>{e.model}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em" }}>
                      {e.pct != null ? `${e.pct}%` : "-"}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {e.hits}/{e.total} checks
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {stats.trendPoints.length > 1 && (
            <div className="card" style={{ padding: 20, marginBottom: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>Visibility over time</div>
              <PromptTrendChart points={stats.trendPoints} />
            </div>
          )}

          {stats.shareOfVoice.length > 1 && (
            <div className="card" style={{ padding: 20, marginBottom: 28 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Share of voice</div>
              <p style={{ fontSize: 13, color: "var(--text-dim)", margin: "0 0 12px" }}>
                How often each brand shows up across every AI answer checked in the last {STATS_WINDOW_DAYS} days.
              </p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--card-border-soft)" }}>
                      <th style={{ textAlign: "left", padding: "8px 10px", color: "var(--text-dim)", fontSize: 13, width: 50 }}>#</th>
                      <th style={{ textAlign: "left", padding: "8px 10px", color: "var(--text-dim)", fontSize: 13 }}>Brand</th>
                      <th style={{ textAlign: "right", padding: "8px 10px", color: "var(--text-dim)", fontSize: 13 }}>Visibility</th>
                      <th style={{ textAlign: "right", padding: "8px 10px", color: "var(--text-dim)", fontSize: 13 }}>Appearances</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.shareOfVoice.map((b) => (
                      <tr
                        key={b.name}
                        style={{
                          borderBottom: "1px solid var(--card-border-soft)",
                          background: b.isYou ? "var(--accent-dim)" : "transparent",
                        }}
                      >
                        <td style={{ padding: "8px 10px", color: "var(--text-dim)" }}>{b.rank}</td>
                        <td style={{ padding: "8px 10px", fontWeight: b.isYou ? 700 : 400 }}>
                          {b.name}
                          {b.isYou && (
                            <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--accent)", marginLeft: 8 }}>
                              You
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "8px 10px", textAlign: "right" }}>{b.pct}%</td>
                        <td style={{ padding: "8px 10px", textAlign: "right", color: "var(--text-dim)" }}>
                          {b.count}/{stats.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <PromptsManager initialPrompts={prompts || []} initialEngineResults={engineResults} />
    </section>
  );
}
