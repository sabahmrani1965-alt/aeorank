"use client";

import { useState } from "react";

// Early access capture. Deliberately small: one field, one button, and a
// state that says plainly what happened. The page around it is a server
// component, so only this island ships JavaScript.
export default function SignupForm({ variant = "hero", source = "site" }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | busy | done | error
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (state === "busy") return;
    setState("busy");
    setError("");
    try {
      const res = await fetch("/api/easyrep/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body?.error || "Couldn't save that, try again.");
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setError("Couldn't reach the server. Check your connection.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className={`su su-${variant} su-done`}>
        <strong>You are on the list.</strong>
        <span>We will email {email} the moment access opens. Nothing else, ever.</span>
      </div>
    );
  }

  return (
    <form className={`su su-${variant}`} onSubmit={submit} noValidate>
      <div className="su-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          aria-label="Your email address"
          autoComplete="email"
        />
        <button type="submit" disabled={state === "busy"}>
          {state === "busy" ? "One moment..." : "Get early access"}
        </button>
      </div>
      {state === "error" ? <p className="su-err">{error}</p> : null}
    </form>
  );
}
