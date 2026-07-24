import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PromptTrendChart from "@/components/PromptTrendChart";

export const dynamic = "force-dynamic";

const TYPE_DOT = { commercial: "#5AA9FF", competitor: "#D9C27A", branded: "#B084F0" };

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

export default async function PromptDetailPage({ params }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: prompt } = await supabase
    .from("prompts")
    .select("id, text, type, location, active, created_at")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!prompt) notFound();

  const { data: checksData } = await supabase
    .from("prompt_checks")
    .select("id, mentioned, position, brands, answer, model, created_at")
    .eq("prompt_id", params.id)
    .order("created_at", { ascending: true });

  const history = checksData || [];
  const total = history.length;

  const positioned = history.filter((c) => c.position != null);
  const avgPosition = positioned.length
    ? Math.round((positioned.reduce((sum, c) => sum + c.position, 0) / positioned.length) * 10) / 10
    : null;

  // Prefer the last-7-days window for Visibility if it has any data; fall
  // back to all-time so a brand-new prompt's stat isn't just a blank dash.
  const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const recent = history.filter((c) => new Date(c.created_at).getTime() >= sevenDaysAgo);
  const visibilityWindow = recent.length > 0 ? recent : history;
  const visibilityPct = visibilityWindow.length
    ? Math.round((visibilityWindow.filter((c) => c.mentioned).length / visibilityWindow.length) * 100)
    : null;
  const visibilityLabel = recent.length > 0 ? "last 7 days" : "all time";

  // Cumulative mention rate at each real check, chronologically — not one
  // point per calendar day (checks are on-demand, not scheduled).
  let runningHits = 0;
  const points = history.map((c, i) => {
    if (c.mentioned) runningHits++;
    return {
      label: new Date(c.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      value: Math.round((runningHits / (i + 1)) * 100),
    };
  });

  const brandStats = new Map();
  for (const c of history) {
    for (const b of c.brands || []) {
      const key = b.toLowerCase();
      if (!brandStats.has(key)) brandStats.set(key, { name: b, appearances: 0 });
      brandStats.get(key).appearances += 1;
    }
  }
  const topBrands = [...brandStats.values()]
    .sort((a, b) => b.appearances - a.appearances)
    .slice(0, 8)
    .map((b) => ({ ...b, visibilityPct: total ? Math.round((b.appearances / total) * 100) : 0 }));

  return (
    <section className="dashboard-page">
      <p style={{ marginBottom: 12 }}>
        <Link href="/dashboard/prompts" className="header-link">← Back to Prompts</Link>
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: TYPE_DOT[prompt.type] }} />
        <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "capitalize" }}>{prompt.type}</span>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>· {prompt.location}</span>
        <span style={{ fontSize: 12, color: prompt.active ? "#6EE7B7" : "var(--text-dim)" }}>
          · {prompt.active ? "Active" : "Inactive"}
        </span>
      </div>
      <h2 style={{ marginBottom: 24 }}>{prompt.text}</h2>

      <div className="kpi-row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="kpi">
          <div className="kpi-label">Avg. position</div>
          <div className="kpi-value">{avgPosition != null ? `#${avgPosition}` : "-"}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Visibility ({visibilityLabel})</div>
          <div className="kpi-value">{visibilityPct != null ? `${visibilityPct}%` : "-"}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Total checks</div>
          <div className="kpi-value">{total}</div>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <h3 style={{ marginBottom: 14 }}>Visibility over time</h3>
        {points.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
            No checks yet. Run "Check now" from the Prompts list to start tracking this.
          </div>
        ) : (
          <div className="card" style={{ padding: 20 }}>
            <PromptTrendChart points={points} />
          </div>
        )}
      </div>

      {topBrands.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 14 }}>Top brands</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,.1))" }}>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Brand</th>
                  <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Visibility</th>
                  <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Appearances</th>
                </tr>
              </thead>
              <tbody>
                {topBrands.map((b) => (
                  <tr key={b.name} style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,.06))" }}>
                    <td style={{ padding: "10px 12px" }}>{b.name}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>{b.visibilityPct}%</td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      {b.appearances}/{total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ marginTop: 32 }}>
        <h3 style={{ marginBottom: 14 }}>Recent checks</h3>
        {history.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
            No checks yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[...history].reverse().map((c) => (
              <div key={c.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                    {c.model} · {timeAgo(c.created_at)}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "3px 9px",
                        borderRadius: 999,
                        background: c.position ? "rgba(110, 231, 183, 0.15)" : "rgba(255,255,255,.06)",
                        color: c.position ? "#6EE7B7" : "var(--text-dim)",
                      }}
                    >
                      {c.position ? `#${c.position}` : "-"}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "3px 9px",
                        borderRadius: 999,
                        background: c.mentioned ? "rgba(110, 231, 183, 0.15)" : "rgba(255, 120, 120, 0.12)",
                        color: c.mentioned ? "#6EE7B7" : "#ff8a8a",
                      }}
                    >
                      {c.mentioned ? "Mentioned" : "Not mentioned"}
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.5, margin: 0, whiteSpace: "pre-wrap" }}>
                  {c.answer && c.answer.length > 220 ? `${c.answer.slice(0, 220)}…` : c.answer}
                </p>
                {c.brands?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                    {c.brands.map((b) => (
                      <span key={b} style={{ fontSize: 12, background: "var(--bg-3)", padding: "3px 9px", borderRadius: 999, color: "var(--text-dim)" }}>
                        {b}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
