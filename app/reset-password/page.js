"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthSplitLayout from "@/components/AuthSplitLayout";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function ResetPasswordPage() {
  if (!isSupabaseConfigured()) {
    return (
      <AuthSplitLayout>
        <span className="section-tag">( account )</span>
        <h2>Accounts are coming soon</h2>
        <p className="section-sub">Check back soon, or reach out via the contact page.</p>
      </AuthSplitLayout>
    );
  }

  return <ResetPasswordForm />;
}

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [hasSession, setHasSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // This page only works when reached via the reset-link's callback
    // redirect, which leaves an active recovery session in place.
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setHasSession(Boolean(data?.user)));
  }, []);

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
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplitLayout>
      <span className="section-tag">( account )</span>
      <h2>Set a new password</h2>

      {hasSession === false ? (
        <div className="card" style={{ padding: 24, textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)" }}>
            This reset link is invalid or expired. Request a new one from
            the login page.
          </p>
        </div>
      ) : done ? (
        <div className="card" style={{ padding: 24, textAlign: "center" }}>
          <strong>Password updated.</strong>
          <p style={{ color: "var(--text-muted)", marginTop: 8 }}>Redirecting to your dashboard…</p>
        </div>
      ) : (
        <form onSubmit={submit} style={{ marginTop: 24 }}>
          <label className="auth-field">
            <span>New password</span>
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
            <span>Confirm new password</span>
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
            disabled={loading || !password || !confirm}
            style={{ width: "100%" }}
          >
            {loading ? "Updating…" : "Update password →"}
          </button>
          {error && (
            <p role="alert" style={{ color: "#ff8a8a", marginTop: 12, fontSize: 14 }}>
              {error}
            </p>
          )}
        </form>
      )}
    </AuthSplitLayout>
  );
}
