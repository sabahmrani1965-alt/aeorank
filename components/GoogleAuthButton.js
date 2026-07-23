"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Shared by /login and SignupForm (so both the customer and creator
// flows get it). Uses Supabase's OAuth redirect flow — the same
// app/auth/callback/route.js that already handles email-confirm and
// magic-link `code` exchanges also handles this, no separate callback
// needed. Requires Google to be enabled as a provider in the Supabase
// dashboard (Authentication → Providers → Google) with a real Google
// Cloud OAuth client id/secret — that's a one-time dashboard/Google
// Cloud Console setup, not something in this codebase.
export default function GoogleAuthButton({ label = "Continue with Google", redirectTo }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function signInWithGoogle() {
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      // redirectTo must be an EXACT match (no extra query string) to an
      // entry in Supabase's Redirect URLs allow-list — confirmed live that
      // appending ?next=... here caused Google's OAuth round-trip to land
      // on Supabase's configured SITE_URL instead (a customer ended up on
      // the wrong domain entirely). The destination is carried entirely
      // via a short-lived cookie instead, read by app/auth/callback/
      // route.js, which clears it right after so a stale value can't leak
      // into a later, unrelated login.
      if (redirectTo) {
        document.cookie = `oauth_next=${encodeURIComponent(redirectTo)}; path=/; max-age=600; SameSite=Lax`;
      }
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (oauthError) throw oauthError;
      // On success the browser is redirected to Google — nothing more to
      // do here. setLoading(false) never runs in that case, which is fine.
    } catch (err) {
      setError(err?.message || "Could not start Google sign-in.");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={loading}
        className="btn btn-google"
        style={{ width: "100%" }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 009 18z" />
          <path fill="#FBBC05" d="M3.97 10.72A5.41 5.41 0 013.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 00.96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
        </svg>
        {loading ? "Redirecting…" : label}
      </button>
      {error && (
        <p role="alert" style={{ color: "#ff8a8a", marginTop: 10, fontSize: 13.5 }}>
          {error}
        </p>
      )}
    </>
  );
}
