"use client";

import { useState } from "react";

const inputStyle = { width: "100%" };

function emptyEditForm(pkg) {
  return {
    name: pkg.name,
    credits: String(pkg.credits),
    price: String(pkg.price_cents / 100),
    bonus_credits: String(pkg.bonus_credits || 0),
    badge: pkg.badge || "",
    description: pkg.description || "",
  };
}

export default function AdminCreditPackagesManager({ initialPackages }) {
  const [packages, setPackages] = useState(initialPackages || []);
  const [name, setName] = useState("");
  const [credits, setCredits] = useState("");
  const [price, setPrice] = useState(""); // dollars, converted to cents on submit
  const [bonusCredits, setBonusCredits] = useState("");
  const [badge, setBadge] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

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
          bonus_credits: Number(bonusCredits) || 0,
          badge: badge || null,
          description: description || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not create package.");
      setName("");
      setCredits("");
      setPrice("");
      setBonusCredits("");
      setBadge("");
      setDescription("");
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

  function startEdit(pkg) {
    setEditingId(pkg.id);
    setEditForm(emptyEditForm(pkg));
    setEditError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
    setEditError("");
  }

  async function saveEdit(id) {
    setEditError("");
    setSavingEdit(true);
    try {
      const res = await fetch("/api/admin/credit-packages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: editForm.name,
          credits: Number(editForm.credits),
          price_cents: Math.round(Number(editForm.price) * 100),
          bonus_credits: Number(editForm.bonus_credits) || 0,
          badge: editForm.badge || null,
          description: editForm.description || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not update package.");
      await refresh();
      cancelEdit();
    } catch (err) {
      setEditError(err?.message || "Something went wrong.");
    } finally {
      setSavingEdit(false);
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
              <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Bonus</th>
              <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Price</th>
              <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Badge</th>
              <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Status</th>
              <th style={{ padding: "10px 12px" }} />
            </tr>
          </thead>
          <tbody>
            {packages.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "16px 12px", color: "var(--text-dim)", textAlign: "center" }}>
                  No packages yet.
                </td>
              </tr>
            ) : (
              packages.map((pkg) =>
                editingId === pkg.id ? (
                  <tr key={pkg.id} style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,.06))", background: "var(--bg-3)" }}>
                    <td style={{ padding: "8px 12px" }}>
                      <input style={inputStyle} value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <input style={{ ...inputStyle, textAlign: "right" }} type="number" value={editForm.credits} onChange={(e) => setEditForm((f) => ({ ...f, credits: e.target.value }))} />
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <input style={{ ...inputStyle, textAlign: "right" }} type="number" value={editForm.bonus_credits} onChange={(e) => setEditForm((f) => ({ ...f, bonus_credits: e.target.value }))} />
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <input style={{ ...inputStyle, textAlign: "right" }} type="number" step="0.01" value={editForm.price} onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))} />
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <input style={inputStyle} placeholder="Most Popular" value={editForm.badge} onChange={(e) => setEditForm((f) => ({ ...f, badge: e.target.value }))} />
                    </td>
                    <td style={{ padding: "10px 12px" }}>{pkg.active ? "Active" : "Inactive"}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => saveEdit(pkg.id)} disabled={savingEdit} style={{ marginRight: 6 }}>
                        {savingEdit ? "Saving…" : "Save"}
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={cancelEdit} disabled={savingEdit}>
                        Cancel
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={pkg.id} style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,.06))" }}>
                    <td style={{ padding: "10px 12px" }}>{pkg.name}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>{pkg.credits}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>{pkg.bonus_credits || 0}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      {(pkg.price_cents / 100).toLocaleString("en-US", {
                        style: "currency",
                        currency: pkg.currency.toUpperCase(),
                      })}
                    </td>
                    <td style={{ padding: "10px 12px", color: "var(--text-dim)" }}>{pkg.badge || "—"}</td>
                    <td style={{ padding: "10px 12px" }}>{pkg.active ? "Active" : "Inactive"}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => startEdit(pkg)} style={{ marginRight: 6 }}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => toggleActive(pkg)}>
                        {pkg.active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
      {editError && (
        <p role="alert" style={{ color: "#ff8a8a", fontSize: 13.5, margin: 0 }}>
          {editError}
        </p>
      )}

      <form onSubmit={createPackage} className="card" style={{ padding: 20, maxWidth: 520, display: "flex", flexDirection: "column", gap: 12 }}>
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
            <label style={{ display: "block", fontSize: 13, color: "var(--text-dim)", marginBottom: 4 }}>Bonus credits</label>
            <input type="number" value={bonusCredits} onChange={(e) => setBonusCredits(e.target.value)} placeholder="0" disabled={loading} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 13, color: "var(--text-dim)", marginBottom: 4 }}>Price (USD)</label>
            <input type="number" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="79" disabled={loading} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 13, color: "var(--text-dim)", marginBottom: 4 }}>Badge (optional)</label>
            <input type="text" value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="Most Popular" disabled={loading} />
          </div>
          <div style={{ flex: 2 }}>
            <label style={{ display: "block", fontSize: 13, color: "var(--text-dim)", marginBottom: 4 }}>Description (optional)</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Best for regular monthly usage" disabled={loading} />
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
