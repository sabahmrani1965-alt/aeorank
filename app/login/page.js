"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <Header />
        <section className="section">
          <div className="container-narrow" style={{ maxWidth: 440 }}>
            <span className="section-tag">( account )</span>
            <h2>Accounts are coming soon</h2>
            <p className="section-sub">
              Customer login isn't set up yet — check back soon, or reach
              out via the contact page.
            </p>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return <LoginForm />;
}

function LoginForm() {
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
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (otpError) throw otpError;
      setSent(true);
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <section className="section">
        <div className="container-narrow" style={{ maxWidth: 440 }}>
          <span className="section-tag">( account )</span>
          <h2>Log in to AEOrank</h2>
          <p className="section-sub">
            Enter the email you used to subscribe. We'll send you a magic
            link — no password needed.
          </p>

          {sent ? (
            <div className="card" style={{ padding: 24, textAlign: "center" }}>
              <strong>Check your inbox.</strong>
              <p style={{ color: "var(--text-muted)", marginTop: 8 }}>
                We sent a login link to {email}. Click it to access your dashboard.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="card" style={{ padding: 24 }}>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                aria-label="Email"
                style={{ width: "100%", marginBottom: 14 }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !email}
                style={{ width: "100%" }}
              >
                {loading ? "Sending…" : "Send magic link →"}
              </button>
              {error && (
                <p role="alert" style={{ color: "#ff8a8a", marginTop: 12, fontSize: 14 }}>
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
