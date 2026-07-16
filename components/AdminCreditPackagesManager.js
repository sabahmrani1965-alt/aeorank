"use client";

import { useEffect, useState } from "react";

export default function AdminCreditPackagesManager({ initialPackages }) {
  const [packages, setPackages] = useState(initialPackages || []);
  const [name, setName] = useState("");
  const [credits, setCredits] = useState("");
  const [price, setPrice] = useState(""); // dollars, converted to cents on submit
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    const res = await fetch("/api/admin/credit-packages");
    const data = await res.json().catch(() => ({}));
    if (res.ok) setPackages(data.packages || []);
  }

  async function createPackage(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/credit-packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          credits: Number(credits),
          price_cents: Math.round(Number(price) * 100),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not create package.");
      setName("");
      setCredits("");
      setPrice("");
      await refresh();
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(pkg) {
    setError("");
    try {
      const res = await fetch("/api/admin/credit-packages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pkg.id, active: !pkg.active }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not update package.");
      await refresh();
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,.1))" }}>
              <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Name</th>
              <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Credits</th>
              <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Price</th>
              <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Status</th>
              <th style={{ padding: "10px 12px" }} />
            </tr>
          </thead>
          <tbody>
            {packages.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "16px 12px", color: "var(--text-dim)", textAlign: "center" }}>
                  No packages yet.
                </td>
              </tr>
            ) : (
              packages.map((pkg) => (
                <tr key={pkg.id} style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,.06))" }}>
                  <td style={{ padding: "10px 12px" }}>{pkg.name}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right" }}>{pkg.credits}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right" }}>
                    {(pkg.price_cents / 100).toLocaleString("en-US", {
                      style: "currency",
                      currency: pkg.currency.toUpperCase(),
                    })}
                  </td>
                  <td style={{ padding: "10px 12px" }}>{pkg.active ? "Active" : "Inactive"}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right" }}>
                    <button type="button" className="btn btn-ghost" onClick={() => toggleActive(pkg)}>
                      {pkg.active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <form onSubmit={createPackage} className="card" style={{ padding: 20, maxWidth: 480, display: "flex", flexDirection: "column", gap: 12 }}>
        <h4 style={{ margin: 0 }}>New package</h4>
        <div>
          <label style={{ display: "block", fontSize: 13, color: "var(--text-dim)", marginBottom: 4 }}>Name</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="500 credits" disabled={loading} />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 13, color: "var(--text-dim)", marginBottom: 4 }}>Credits</label>
            <input type="number" required value={credits} onChange={(e) => setCredits(e.target.value)} placeholder="500" disabled={loading} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 13, color: "var(--text-dim)", marginBottom: 4 }}>Price (USD)</label>
            <input type="number" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="79" disabled={loading} />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading || !name || !credits || !price}>
          {loading ? "Creating…" : "Create package"}
        </button>
        {error && (
          <p role="alert" style={{ color: "#ff8a8a", fontSize: 13.5, margin: 0 }}>
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
