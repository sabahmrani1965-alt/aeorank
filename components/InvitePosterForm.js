"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InvitePosterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setTempPassword("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/posters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not create this account.");

      if (!data.isNewAccount) {
        setMessage("Existing account granted poster access — they can log in with their current password.");
      } else if (data.emailSent) {
        setMessage(`Password emailed to ${email}.`);
      } else {
        setMessage("Account created, but the email couldn't be sent — share this password manually:");
        setTempPassword(data.temporaryPassword || "");
      }
      setEmail("");
      router.refresh();
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card" style={{ padding: 20, maxWidth: 480, display: "flex", flexDirection: "column", gap: 12 }}>
      <h4 style={{ margin: 0 }}>Add a poster</h4>
      <div>
        <label style={{ display: "block", fontSize: 13, color: "var(--text-dim)", marginBottom: 4 }}>Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="poster@example.com" disabled={loading} />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading || !email}>
        {loading ? "Creating…" : "Add poster"}
      </button>
      {error && (
        <p role="alert" style={{ color: "#ff8a8a", fontSize: 13.5, margin: 0 }}>
          {error}
        </p>
      )}
      {message && (
        <p style={{ color: "#7ee3a3", fontSize: 13.5, margin: 0 }}>
          {message}
        </p>
      )}
      {tempPassword && (
        <code style={{ background: "var(--bg-3)", padding: "8px 12px", borderRadius: 8, fontSize: 14, wordBreak: "break-all" }}>
          {tempPassword}
        </code>
      )}
    </form>
  );
}
