"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CREDIT_COSTS } from "@/lib/credits";

const CHECK_COST = CREDIT_COSTS.campaign_check;
const BOOST_COST = CREDIT_COSTS.campaign_boost_demo;

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Plain inline SVG sparkline — no charting dependency, consistent with
// this app's no-extra-libraries convention. Snapshots with a null score
// (a check that came back with nothing usable) are skipped in the line
// but still counted in the history table below.
function Sparkline({ snapshots }) {
  const points = snapshots.filter((s) => s.score != null);
  if (points.length < 2) {
    return (
      <div style={{ color: "var(--text-muted)", fontSize: 13.5, padding: "24px 0", textAlign: "center" }}>
        Not enough data yet — check at least twice to see a trend.
      </div>
    );
  }

  const width = 640;
  const height = 160;
  const pad = 8;
  const scores = points.map((p) => p.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (width - pad * 2);
    const y = height - pad - ((p.score - min) / range) * (height - pad * 2);
    return [x, y];
  });
  const path = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
      {coords.map(([x, y], i) => (
        <circle
          key={points[i].id}
          cx={x}
          cy={y}
          r={points[i].source === "simulated" ? 3.5 : 3}
          fill={points[i].source === "simulated" ? "#8b8b8b" : "var(--accent)"}
        />
      ))}
    </svg>
  );
}

export default function CampaignDetail({ campaign, initialSnapshots }) {
  const router = useRouter();
  const [snapshots, setSnapshots] = useState(initialSnapshots);
  const [checking, setChecking] = useState(false);
  const [boosting, setBoosting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const latest = snapshots.length ? snapshots[snapshots.length - 1] : null;

  async function check() {
    setError("");
    setChecking(true);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/check`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not check this post.");
      if (data.snapshot) setSnapshots((s) => [...s, data.snapshot]);
      router.refresh();
    } catch (e) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setChecking(false);
    }
  }

  async function boost() {
    setError("");
    setBoosting(true);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/boost`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not simulate a boost.");
      if (data.snapshot) setSnapshots((s) => [...s, data.snapshot]);
      router.refresh();
    } catch (e) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setBoosting(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this campaign? Its history will be lost.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.push("/dashboard/campaigns");
      router.refresh();
    } catch {
      setError("Could not delete this campaign.");
      setDeleting(false);
    }
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 860 }}>
        <span className="section-tag">( campaign )</span>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ marginBottom: 4 }}>
              {campaign.title || (campaign.subreddit ? `r/${campaign.subreddit}` : "Reddit campaign")}
            </h2>
            <a
              href={campaign.target_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent)", fontSize: 13.5, wordBreak: "break-all" }}
            >
              {campaign.target_url} ↗
            </a>
          </div>
          <button type="button" onClick={remove} disabled={deleting} className="btn btn-ghost btn-sm">
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>

        <div className="camp-stat-grid">
          <div className="camp-stat-card">
            <div className="tt-meta-label">Current score</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>↑ {latest?.score ?? "—"}</div>
          </div>
          <div className="camp-stat-card">
            <div className="tt-meta-label">Replies</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{latest?.reply_count ?? "—"}</div>
          </div>
          <div className="camp-stat-card">
            <div className="tt-meta-label">Status</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>
              {latest ? (latest.removed ? <span style={{ color: "#ff8a8a" }}>Removed</span> : "Live") : "Not checked yet"}
            </div>
          </div>
          <div className="camp-stat-card">
            <div className="tt-meta-label">Last checked</div>
            <div style={{ fontSize: 14 }}>{latest ? formatDateTime(latest.checked_at) : "—"}</div>
          </div>
        </div>

        <div className="card" style={{ padding: 20, marginTop: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Score over time</div>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 0, marginBottom: 4 }}>
            <span style={{ color: "var(--accent)" }}>●</span> real check &nbsp;
            <span style={{ color: "#8b8b8b" }}>●</span> simulated demo boost
          </p>
          <Sparkline snapshots={snapshots} />
        </div>

        <div className="camp-actions">
          <button type="button" onClick={check} disabled={checking} className="btn btn-primary">
            {checking ? "Checking…" : `Check now (${CHECK_COST} credits)`}
          </button>
          <button type="button" onClick={boost} disabled={boosting} className="btn btn-secondary">
            {boosting ? "Simulating…" : `Simulate Boost — Demo Mode (${BOOST_COST} credit)`}
          </button>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 6 }}>
          "Simulate Boost" demonstrates the automation flow only — it never places a real vote or contacts Reddit.
          Only "Check now" reads real data from Reddit.
        </p>

        {error && (
          <p role="alert" style={{ color: "#ff8a8a", fontSize: 14, marginTop: 10 }}>
            {error}
          </p>
        )}

        <div className="card" style={{ padding: 0, marginTop: 24, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", fontWeight: 700, borderBottom: "1px solid var(--card-border)" }}>
            History ({snapshots.length})
          </div>
          {snapshots.length === 0 ? (
            <div style={{ padding: 20, color: "var(--text-dim)", textAlign: "center" }}>No checks yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {[...snapshots].reverse().map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "10px 20px",
                    borderTop: "1px solid var(--card-border-soft)",
                    fontSize: 13.5,
                  }}
                >
                  <span style={{ color: "var(--text-muted)", minWidth: 120 }}>{formatDateTime(s.checked_at)}</span>
                  <span>↑ {s.score ?? "—"}</span>
                  <span>{s.reply_count != null ? `💬 ${s.reply_count}` : ""}</span>
                  <span>{s.removed ? <span style={{ color: "#ff8a8a" }}>Removed</span> : ""}</span>
                  <span className={`camp-source-tag${s.source === "simulated" ? " is-demo" : ""}`} style={{ marginLeft: "auto" }}>
                    {s.source === "simulated" ? "demo" : "verified"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
