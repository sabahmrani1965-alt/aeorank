"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import GoogleAuthButton from "@/components/GoogleAuthButton";

// Extracted from app/signup/page.js so the same real signup logic (auth
// account creation, not just UI) is shared with app/apply-poster/page.js's
// creator signup step 1 — one code path, not two copies that could drift.
// New accounts default to role='customer' (see supabase/schema.sql) — the
// creator flow promotes to 'poster' in a separate step 2, only once their
// Reddit account actually passes verification. `intent` just tags which
// flow the signup came from (signup_source) so an incomplete CrewQuest
// signup (never finished verification) is still recognizable as one,
// rather than looking exactly like a genuine AEOrank customer.
//
// Wrapped in Suspense here (rather than requiring every caller to do it)
// so app/signup/page.js and app/apply-poster/page.js don't need any
// changes to pick up useSearchParams below.
export default function SignupForm(props) {
  return (
    <Suspense fallback={null}>
      <SignupFormInner {...props} />
    </Suspense>
  );
}

function SignupFormInner({ redirectTo = "/onboarding", intent = "aeorank" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const searchParams = useSearchParams();
  // Same failure mode as app/login/page.js: app/auth/callback/route.js
  // redirects back here with ?error=auth when the Google round-trip
  // fails, and without reading it, the user just lands back on this form
  // with no explanation at all.
  const [error, setError] = useState(
    searchParams.get("error") === "auth"
      ? "Something went wrong signing in with Google. Please try again, or use email and password below."
      : ""
  );
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (signUpError) throw signUpError;
      if (data?.session) {
        // Best-effort — never blocks navigation on failure.
        if (data.user) {
          try {
            await supabase.from("users").update({ signup_source: intent }).eq("id", data.user.id);
          } catch {}
        }
        // Email confirmation is off — signUp already returned a live
        // session, so go straight to the next step.
        router.push(redirectTo);
        router.refresh();
      } else {
        // Fallback for if confirmation is ever turned back on.
        setSent(true);
      }
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="card" style={{ padding: 24, textAlign: "center" }}>
        <strong>Check your inbox.</strong>
        <p style={{ color: "var(--text-muted)", marginTop: 8 }}>
          We sent a confirmation link to {email}. Click it to activate your account.
        </p>
      </div>
    );
  }

  return (
    <>
      <GoogleAuthButton label="Sign up with Google" redirectTo={redirectTo} intent={intent} />
      <div className="auth-divider"><span>or</span></div>

      <form onSubmit={submit}>
      <label className="auth-field">
        <span>Email</span>
        <input
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
      </label>
      <label className="auth-field">
        <span>Password</span>
        <input
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />
      </label>
      <label className="auth-field">
        <span>Confirm password</span>
        <input
          type="password"
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={loading}
          required
        />
      </label>
      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading || !email || !password || !confirm}
        style={{ width: "100%" }}
      >
        {loading ? "Creating account…" : "Sign up →"}
      </button>
      {error && (
        <p role="alert" style={{ color: "var(--state-danger-fg)", marginTop: 12, fontSize: 14 }}>
          {error}
        </p>
      )}
      <p style={{ marginTop: 16, fontSize: 12.5, color: "var(--text-muted)" }}>
        By signing up, you agree to our <Link href="/terms">Terms of Service</Link>.
      </p>
      <div className="auth-links" style={{ justifyContent: "center" }}>
        <span>
          Already have an account? <Link href="/login">Log in</Link>
        </span>
      </div>
      </form>
    </>
  );
}
