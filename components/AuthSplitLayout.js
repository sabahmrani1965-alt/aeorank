"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { isPosterHost } from "@/lib/posterBrand";

// Shared two-column shell for /login, /signup, /forgot-password,
// /reset-password. Right panel reuses the same real numbers already shown
// on the homepage hero — no invented testimonials or metrics.
//
// Domain-aware: these pages serve both customers and posters. On the
// dedicated poster domain (NEXT_PUBLIC_POSTER_SITE_URL), this renders the
// CrewQuest variant instead — checked client-side via useEffect (not at
// first render) to avoid a server/client markup mismatch, so there's a
// brief flash of the default variant before it corrects on the poster
// domain. Everywhere else this never fires and renders exactly as before.
export default function AuthSplitLayout({ children }) {
  const [poster, setPoster] = useState(false);

  useEffect(() => {
    setPoster(isPosterHost(window.location.hostname));
  }, []);

  if (poster) {
    return (
      <div className="auth-split kc-theme">
        <div className="auth-split-form">
          <div className="auth-split-form-inner">
            <Link
              href="/apply-poster"
              className="logo"
              aria-label="CrewQuest home"
              style={{ display: "inline-flex", marginBottom: 32 }}
            >
              <span className="logo-mark">C</span>
              CrewQuest
            </Link>
            {children}
          </div>
        </div>
        <div className="auth-split-visual">
          <h3>Get paid to post on Reddit</h3>
          <p>
            Complete assignments from your own Reddit account, get paid per task, and earn 15%
            on anyone you refer.
          </p>
          <div className="auth-stats">
            <div>
              <div className="auth-stat-value">$0.50–$1</div>
              <div className="auth-stat-label">Per completed task</div>
            </div>
            <div>
              <div className="auth-stat-value">15%</div>
              <div className="auth-stat-label">Referral commission</div>
            </div>
            <div>
              <div className="auth-stat-value">3 mo</div>
              <div className="auth-stat-label">Referral earning window</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-split light-theme">
      <div className="auth-split-form">
        <div className="auth-split-form-inner">
          <Link href="/" className="logo" aria-label="AEOrank home" style={{ display: "inline-flex", marginBottom: 32 }}>
            <Image src="/logo.svg" alt="AEOrank" width={150} height={34} priority className="logo-on-dark" />
            <Image src="/logo-light.svg" alt="AEOrank" width={150} height={34} priority className="logo-on-light" />
          </Link>
          {children}
        </div>
      </div>
      <div className="auth-split-visual">
        <h3>Rank in AI Answers via Reddit signals</h3>
        <p>
          See the subreddits, threads, and keywords that influence how
          ChatGPT, Claude, and Gemini talk about your brand.
        </p>
        <div className="auth-stats">
          <div>
            <div className="auth-stat-value">12K+</div>
            <div className="auth-stat-label">Subreddits indexed</div>
          </div>
          <div>
            <div className="auth-stat-value">2M+</div>
            <div className="auth-stat-label">Reachable members</div>
          </div>
          <div>
            <div className="auth-stat-value">3</div>
            <div className="auth-stat-label">Major LLMs analysed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
