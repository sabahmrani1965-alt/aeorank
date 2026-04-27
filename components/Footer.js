import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link href="/" className="logo" aria-label="AEOrank home">
              <Image src="/logo.svg" alt="AEOrank" width={150} height={34} />
            </Link>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 12, maxWidth: 320 }}>
              Help your brand show up in ChatGPT, Claude, and Gemini answers
              through measurable Reddit engagement.
            </p>
          </div>

          <div className="footer-col">
            <h4>Product</h4>
            <Link href="/#faq">FAQ</Link>
            <Link href="/contact">Contact</Link>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>

        <div className="footer-meta">
          © {new Date().getFullYear()} AEOrank. Reddit data fetched via
          public read-only API. AEOrank is independently operated and is not
          affiliated with Reddit, OpenAI, Anthropic, or Google.
        </div>
      </div>
    </footer>
  );
}
