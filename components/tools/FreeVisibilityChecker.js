"use client";

import Link from "next/link";
import { useState } from "react";

export default function FreeVisibilityChecker() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [trap, setTrap] = useState("");
  const [category, setCategory] = useState("");
  const [fix, setFix] = useState("");
  const [state, setState] = useState("idle"); // idle | busy | done | error
  const [error, setError] = useState("");
  const [r, setR] = useState(null);

  function submit(e) {
    e.preventDefault();
    run(category);
  }

  // A second check with the visitor's own category, when the detected one
  // was wrong. The API allows one of these per email per day.
  function recheck(e) {
    e.preventDefault();
    if (!fix.trim()) return;
    setCategory(fix.trim());
    run(fix.trim());
  }

  async function run(cat) {
    if (state === "busy") return;
    setState("busy");
    setError("");
    try {
      const res = await fetch("/api/free-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, email, category: cat || "", company_site: trap }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.ok) throw new Error(j.error || "Something went wrong. Please try again.");
      setR(j);
      setFix(j.query || "");
      setState("done");
    } catch (err) {
      setError(err.message);
      setState("error");
    }
  }

  return (
    <div className="card" style={{ textAlign: "left" }}>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <div>
          <label htmlFor="fc-url" className="tool-label">Your website</label>
          <input id="fc-url" className="input" style={{ width: "100%" }} placeholder="yourbrand.com" value={url} onChange={(e) => setUrl(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="fc-email" className="tool-label">Your email</label>
          <input id="fc-email" type="email" className="input" style={{ width: "100%" }} placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="fc-cat" className="tool-label">
            What do you sell? <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(optional)</span>
          </label>
          <input id="fc-cat" className="input" style={{ width: "100%" }} placeholder="e.g. issue tracking software" maxLength={60} value={category} onChange={(e) => setCategory(e.target.value)} />
          <p className="tool-meta" style={{ margin: "6px 0 0" }}>Leave it empty and we'll work it out from your website.</p>
        </div>
        {/* Honeypot for bots; hidden from people and screen readers. */}
        <input type="text" name="company_site" value={trap} onChange={(e) => setTrap(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px" }} />
        <button type="submit" className="btn btn-primary" disabled={state === "busy"}>
          {state === "busy" ? "Asking the AI engines… (up to a minute)" : "Check my AI visibility →"}
        </button>
        <p className="tool-meta" style={{ margin: 0 }}>
          One free check per day. We'll add your email to AEOrank updates; unsubscribe any time.
        </p>
      </form>

      {error ? (
        <p role="alert" style={{ color: "var(--state-danger-fg, #d64545)", marginTop: 14 }}>
          {error}
        </p>
      ) : null}

      {state === "done" && r ? (
        <div aria-live="polite" style={{ marginTop: 22, borderTop: "1px solid var(--card-border, rgba(0,0,0,.08))", paddingTop: 18 }}>
          <div className="tool-score">
            <span className={r.score >= 50 ? "s-good" : r.score > 0 ? "s-warn" : "s-bad"}>{r.score}%</span>
            <span>of AI answers named {r.brand}</span>
          </div>
          <p style={{ color: "var(--text-dim)" }}>
            We asked AI engines questions a buyer would ask about <strong>{r.query}</strong>. {r.brand} was named in{" "}
            {r.hits} of {r.total} answers from {Object.keys(r.byEngine).length}{" "}
            {Object.keys(r.byEngine).length === 1 ? "engine" : "engines"}.
          </p>
          <ul className="tool-checks">
            {Object.entries(r.byEngine).map(([engine, v]) => (
              <li key={engine} className={v.mentions ? "chk-good" : "chk-bad"}>
                <strong>{engine}</strong>
                <span>
                  Named in {v.mentions} of {v.answers} {v.answers === 1 ? "answer" : "answers"}
                </span>
              </li>
            ))}
          </ul>
          {!r.categoryTyped ? (
            <form onSubmit={recheck} style={{ marginTop: 14, display: "grid", gap: 8 }}>
              <label htmlFor="fc-fix" className="tool-meta" style={{ margin: 0 }}>
                Not your category? Correct it and check again (once a day).
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input id="fc-fix" className="input" style={{ flex: "1 1 220px" }} maxLength={60} value={fix} onChange={(e) => setFix(e.target.value)} />
                <button type="submit" className="btn btn-ghost" disabled={state === "busy" || !fix.trim() || fix.trim() === r.query}>
                  Re-check
                </button>
              </div>
            </form>
          ) : null}
          {r.competitors?.length ? (
            <>
              <p style={{ fontWeight: 700, marginTop: 18 }}>Named instead</p>
              <p style={{ color: "var(--text-dim)" }}>{r.competitors.join(", ")}</p>
            </>
          ) : null}
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 14 }}>
            One snapshot from a handful of questions; AI answers vary from day to day.
          </p>
          <Link href="/pricing" className="btn btn-primary" style={{ marginTop: 8 }}>
            Track it daily and see which Reddit threads drive it →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
