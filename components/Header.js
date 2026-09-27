import Link from "next/link";
import Image from "next/image";
import HeaderAuthLink from "@/components/HeaderAuthLink";

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
        <Link href="/pricing" className="header-link">
          Pricing
        </Link>
        <HeaderAuthLink />
      </div>
    </header>
  );
}
