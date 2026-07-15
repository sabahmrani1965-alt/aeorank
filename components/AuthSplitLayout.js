import Link from "next/link";
import Image from "next/image";

// Shared two-column shell for /login, /signup, /forgot-password,
// /reset-password. Right panel reuses the same real numbers already shown
// on the homepage hero — no invented testimonials or metrics.
export default function AuthSplitLayout({ children }) {
  return (
    <div className="auth-split">
      <div className="auth-split-form">
        <div className="auth-split-form-inner">
          <Link href="/" className="logo" aria-label="AEOrank home" style={{ display: "inline-flex", marginBottom: 32 }}>
            <Image src="/logo.svg" alt="AEOrank" width={150} height={34} priority />
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
