"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthSplitLayout from "@/components/AuthSplitLayout";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isPosterHost } from "@/lib/posterBrand";

export default function LoginPage() {
  if (!isSupabaseConfigured()) {
    return (
      <AuthSplitLayout>
        <span className="section-tag">( account )</span>
        <h2>Accounts are coming soon</h2>
        <p className="section-sub">
          Customer login isn't set up yet. Check back soon, or reach out
          via the contact page.
        </p>
      </AuthSplitLayout>
    );
  }

  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  // app/auth/callback/route.js redirects back here with ?error=auth when
  // the Google round-trip fails (expired/invalid code, Supabase rejecting
  // the redirect URL, etc). Without reading this, that failure was
  // completely silent — the user just lands back on this exact page with
  // nothing to explain why, indistinguishable from never having clicked
  // "Log in with Google" at all.
  const [error, setError] = useState(
    searchParams.get("error") === "auth"
      ? "Something went wrong signing in with Google. Please try again, or use email and password below."
      : ""
  );
  const router = useRouter();

  // /login is shared across both domains (see AuthSplitLayout) — Google
  // OAuth creates a brand-new account transparently on first use even
  // from a "log in" button, so this needs the same signup_source tagging
  // SignupForm's intent prop provides, just resolved from which domain
  // the visitor is actually on rather than a fixed default.
  const [intent, setIntent] = useState(undefined);
  useEffect(() => {
    setIntent(isPosterHost(window.location.hostname) ? "crewquest" : "aeorank");
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;

      // Posters land on /poster, not the customer dashboard.
      let destination = "/dashboard";
      if (signInData?.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("id", signInData.user.id)
          .maybeSingle();
        if (profile?.role === "poster") destination = "/poster";
      }
      router.push(destination);
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
      <h2>Log in</h2>
      <p className="section-sub" style={{ marginBottom: 24 }}>
        Enter the email and password you used to subscribe.
      </p>

      <GoogleAuthButton label="Log in with Google" intent={intent} />
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
          <p role="alert" style={{ color: "var(--msg-danger)", marginTop: 12, fontSize: 14 }}>
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
