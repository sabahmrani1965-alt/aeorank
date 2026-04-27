"use client";

import { useState } from "react";

export default function ContactForm({ defaultPlan = "general", planLabel = "" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState(
    planLabel
      ? `Hi — I'm interested in the ${planLabel} plan. Please reach out.`
      : ""
  );
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, company, message, plan: defaultPlan,
        }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || "Could not submit. Please try again.");
      setStatus("success");
    } catch (e) {
      setError(e.message || "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="card" style={{ textAlign: "center", padding: 32 }}>
        <div style={{ fontSize: 40 }}>✓</div>
        <h3 style={{ marginTop: 12 }}>Thanks — we'll be in touch.</h3>
        <p style={{ color: "var(--text-dim)", marginTop: 8 }}>
          We received your message and will reply within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="contact-form">
      <div className="contact-row">
        <label className="contact-field">
          <span>Your name</span>
          <input
            type="text" required
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
          />
        </label>
        <label className="contact-field">
          <span>Work email</span>
          <input
            type="email" required
            value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@yourcompany.com"
          />
        </label>
      </div>
      <label className="contact-field">
        <span>Company (optional)</span>
        <input
          type="text"
          value={company} onChange={(e) => setCompany(e.target.value)}
          placeholder="Acme Inc."
        />
      </label>
      <label className="contact-field">
        <span>What can we help with?</span>
        <textarea
          rows={4}
          value={message} onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us a bit about your goals."
        />
      </label>
      {error && <div className="contact-error">{error}</div>}
      <button
        type="submit"
        className="btn btn-primary btn-large"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? <><span className="loader" /> Sending…</> : "Send message →"}
      </button>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 8 }}>
        We'll only use your email to reply. See our{" "}
        <a href="/privacy" style={{ color: "var(--accent)" }}>privacy policy</a>.
      </p>
    </form>
  );
}
