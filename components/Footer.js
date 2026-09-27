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
            <Link href="/industries">Industries</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/#faq">FAQ</Link>
            <Link href="/contact">Contact</Link>
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
