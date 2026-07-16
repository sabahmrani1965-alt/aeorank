"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthSplitLayout from "@/components/AuthSplitLayout";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function SignupPage() {
  if (!isSupabaseConfigured()) {
    return (
      <AuthSplitLayout>
        <span className="section-tag">( account )</span>
        <h2>Accounts are coming soon</h2>
        <p className="section-sub">
          Sign-ups aren't set up yet — check back soon, or reach out via
          the contact page.
        </p>
      </AuthSplitLayout>
    );
  }

  return <SignupForm />;
}

function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
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
        // Email confirmation is off — signUp already returned a live
        // session, so go straight into onboarding.
        router.push("/onboarding");
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

  return (
    <AuthSplitLayout>
      <span className="section-tag">( account )</span>
      <h2>Create an account</h2>
      <p className="section-sub" style={{ marginBottom: 24 }}>
        AEOrank helps your brand show up in AI answers, backed by
        measurable Reddit signals.
      </p>

      {sent ? (
        <div className="card" style={{ padding: 24, textAlign: "center" }}>
          <strong>Check your inbox.</strong>
          <p style={{ color: "var(--text-muted)", marginTop: 8 }}>
            We sent a confirmation link to {email}. Click it to activate your account.
          </p>
        </div>
      ) : (
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
            <p role="alert" style={{ color: "#ff8a8a", marginTop: 12, fontSize: 14 }}>
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
      )}
    </AuthSplitLayout>
  );
}
