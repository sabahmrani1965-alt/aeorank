"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthSplitLayout from "@/components/AuthSplitLayout";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  if (!isSupabaseConfigured()) {
    return (
      <AuthSplitLayout>
        <span className="section-tag">( account )</span>
        <h2>Accounts are coming soon</h2>
        <p className="section-sub">
          Customer login isn't set up yet — check back soon, or reach out
          via the contact page.
        </p>
      </AuthSplitLayout>
    );
  }

  return <LoginForm />;
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplitLayout>
      <span className="section-tag">( account )</span>
      <h2>Log in to AEOrank</h2>
      <p className="section-sub" style={{ marginBottom: 24 }}>
        Enter the email and password you used to subscribe.
      </p>

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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </label>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !email || !password}
          style={{ width: "100%" }}
        >
          {loading ? "Logging in…" : "Log in →"}
        </button>
        {error && (
          <p role="alert" style={{ color: "#ff8a8a", marginTop: 12, fontSize: 14 }}>
            {error}
          </p>
        )}
        <div className="auth-links">
          <Link href="/forgot-password">Forgot password?</Link>
          <Link href="/signup">Create an account</Link>
        </div>
      </form>
    </AuthSplitLayout>
  );
}
