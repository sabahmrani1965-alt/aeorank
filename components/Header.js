import Link from "next/link";
import Image from "next/image";
import HeaderAuthLink from "@/components/HeaderAuthLink";

const NAV = [
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/proof", label: "Proof" },
  { href: "/blog", label: "Blog" },
];

export default function Header() {
  return (
    <header className="header">
      <Link href="/" className="logo" aria-label="AEOrank home">
        <Image src="/logo.svg" alt="AEOrank" width={170} height={38} priority className="logo-on-dark" />
        <Image src="/logo-light.svg" alt="AEOrank" width={170} height={38} priority className="logo-on-light" />
      </Link>
      <div className="header-actions">
        {/* Pricing was reachable only from the footer, so anyone landing on
            a service or blog page from search had no path to it. */}
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="header-link">
            {n.label}
          </Link>
        ))}
        <HeaderAuthLink />
        {/* Below 720px the inline links are hidden, which left mobile with
            no navigation at all. <details> opens without any JavaScript. */}
        <details className="mobile-nav">
          <summary aria-label="Open menu">
            <span aria-hidden="true">☰</span>
          </summary>
          <nav className="mobile-nav-panel" aria-label="Main">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}>
                {n.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
