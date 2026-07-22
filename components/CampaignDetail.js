"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CREDIT_COSTS } from "@/lib/credits";

const CHECK_COST = CREDIT_COSTS.campaign_check;
const ORDER_COST = CREDIT_COSTS.campaign_order;

const ORDER_STATUS_LABEL = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
  failed: "Failed",
};

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

export default function CampaignDetail({ campaign, initialSnapshots, initialOrders }) {
  const router = useRouter();
  const [snapshots, setSnapshots] = useState(initialSnapshots);
  const [orders, setOrders] = useState(initialOrders);
  const [quantity, setQuantity] = useState(1);
  const [checking, setChecking] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [pollingId, setPollingId] = useState(null);
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

  async function placeOrder() {
    setError("");
    setSubmittingOrder(true);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not submit order.");
      if (data.order) setOrders((o) => [data.order, ...o]);
      router.refresh();
    } catch (e) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setSubmittingOrder(false);
    }
  }

  async function pollOrder(orderId) {
    setError("");
    setPollingId(orderId);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/orders/${orderId}/poll`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not check order status.");
      if (data.order) {
        setOrders((list) => list.map((o) => (o.id === data.order.id ? data.order : o)));
      }
      if (data.snapshot) {
        setSnapshots((s) => [...s, data.snapshot]);
        router.refresh();
      }
    } catch (e) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setPollingId(null);
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
            <span style={{ color: "#8b8b8b" }}>●</span> simulated order (demo)
          </p>
          <Sparkline snapshots={snapshots} />
        </div>

        <div className="camp-actions">
          <button type="button" onClick={check} disabled={checking} className="btn btn-primary">
            {checking ? "Checking…" : `Check now (${CHECK_COST} credits)`}
          </button>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 6 }}>
          "Check now" reads real, live data from Reddit for this exact post.
        </p>

        {error && (
          <p role="alert" style={{ color: "#ff8a8a", fontSize: 14, marginTop: 10 }}>
            {error}
          </p>
        )}

        <div className="card" style={{ padding: 20, marginTop: 24 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Place an order</div>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 0, marginBottom: 14 }}>
            Submits through the configured order provider (currently the built-in <strong>simulated</strong> provider —
            it demonstrates the submit → poll → complete pipeline only, it never contacts Reddit or any real vote service).
          </p>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
              Quantity
              <input
                type="number"
                min={1}
                max={1000}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                style={{
                  width: 80,
                  background: "var(--bg-3)",
                  border: "1px solid var(--card-border)",
                  borderRadius: 8,
                  padding: "6px 10px",
                  fontSize: 14,
                  color: "var(--text)",
                }}
              />
            </label>
            <button type="button" onClick={placeOrder} disabled={submittingOrder} className="btn btn-secondary">
              {submittingOrder ? "Submitting…" : `Place Order (${quantity * ORDER_COST} credits) →`}
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 0, marginTop: 20, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", fontWeight: 700, borderBottom: "1px solid var(--card-border)" }}>
            Orders ({orders.length})
          </div>
          {orders.length === 0 ? (
            <div style={{ padding: 20, color: "var(--text-dim)", textAlign: "center" }}>No orders yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {orders.map((o) => {
                const terminal = o.status === "completed" || o.status === "failed";
                return (
                  <div
                    key={o.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "10px 20px",
                      borderTop: "1px solid var(--card-border-soft)",
                      fontSize: 13.5,
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ color: "var(--text-muted)", minWidth: 120 }}>{formatDateTime(o.submitted_at)}</span>
                    <span style={{ fontFamily: "monospace", fontSize: 12 }}>{o.provider}</span>
                    <span>×{o.quantity}</span>
                    <span
                      style={{
                        fontWeight: 600,
                        color:
                          o.status === "completed" ? "var(--state-success-fg)" : o.status === "failed" ? "#ff8a8a" : "var(--text)",
                      }}
                    >
                      {ORDER_STATUS_LABEL[o.status] || o.status}
                    </span>
                    <span style={{ marginLeft: "auto" }}>
                      {!terminal && (
                        <button
                          type="button"
                          onClick={() => pollOrder(o.id)}
                          disabled={pollingId === o.id}
                          className="btn btn-ghost btn-sm"
                        >
                          {pollingId === o.id ? "Checking…" : "Refresh status"}
                        </button>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

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
