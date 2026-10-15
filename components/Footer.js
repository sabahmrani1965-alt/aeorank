import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link href="/" className="logo" aria-label="AEOrank home">
              <Image src="/logo.svg" alt="AEOrank" width={150} height={34} className="logo-on-dark" />
              <Image src="/logo-light.svg" alt="AEOrank" width={150} height={34} className="logo-on-light" />
            </Link>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 12, maxWidth: 320 }}>
              Help your brand show up in ChatGPT, Claude, and Gemini answers
              through measurable Reddit engagement.
            </p>
          </div>

          <div className="footer-col">
            <h4>Product</h4>
            <Link href="/services">Services</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/proof">Our own score</Link>
            <Link href="/ai-recommendations">What AI recommends</Link>
            <Link href="/industries">Industries</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/#faq">FAQ</Link>
            <Link href="/free-ai-visibility-checker">Free AI visibility checker</Link>
            <Link href="/tools">Free Reddit tools</Link>
            <Link href="/affiliates">Affiliates</Link>
            <Link href="/contact">Contact</Link>
          </div>

          <div className="footer-col">
            <h4>Compare</h4>
            <Link href="/blog/best-reddit-marketing-tools">Best Reddit marketing tools</Link>
            <Link href="/blog/bazzly-vs-aeorank">Bazzly vs AEOrank</Link>
            <Link href="/blog/crowdreply-vs-aeorank">CrowdReply vs AEOrank</Link>
            <Link href="/blog/reddgrow-vs-aeorank">ReddGrow vs AEOrank</Link>
            <Link href="/blog/reddireach-vs-aeorank">ReddiReach vs AEOrank</Link>
            <Link href="/blog/profound-vs-peec-vs-aeorank">Profound vs Peec AI</Link>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <Link href="/about">About</Link>
            {/* The only confirmed sameAs in our Organization schema was not
                linked from any page. A profile nothing points at is a weak
                entity signal. */}
            <a
              href="https://www.linkedin.com/company/aeoranktech"
              target="_blank"
              rel="noopener"
            >
              LinkedIn
            </a>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>

        <div className="footer-meta">
          © {new Date().getFullYear()} AEOrank.
        </div>
      </div>
    </footer>
  );
}
