"use client";

import { useState } from "react";
import Link from "next/link";
import AuthSplitLayout from "@/components/AuthSplitLayout";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function ForgotPasswordPage() {
  if (!isSupabaseConfigured()) {
    return (
      <AuthSplitLayout>
        <span className="section-tag">( account )</span>
        <h2>Accounts are coming soon</h2>
        <p className="section-sub">Check back soon, or reach out via the contact page.</p>
      </AuthSplitLayout>
    );
  }

  return <ForgotPasswordForm />;
}

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplitLayout>
      <span className="section-tag">( account )</span>
      <h2>Reset your password</h2>
      <p className="section-sub" style={{ marginBottom: 24 }}>
        Enter your account email and we'll send you a reset link.
      </p>

      {sent ? (
        <div className="card" style={{ padding: 24, textAlign: "center" }}>
          <strong>Check your inbox.</strong>
          <p style={{ color: "var(--text-muted)", marginTop: 8 }}>
            We sent a password reset link to {email}.
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
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !email}
            style={{ width: "100%" }}
          >
            {loading ? "Sending…" : "Send reset link →"}
          </button>
          {error && (
            <p role="alert" style={{ color: "var(--msg-danger)", marginTop: 12, fontSize: 14 }}>
              {error}
            </p>
          )}
          <div className="auth-links" style={{ justifyContent: "center" }}>
            <Link href="/login">Back to log in</Link>
          </div>
        </form>
      )}
    </AuthSplitLayout>
  );
}
