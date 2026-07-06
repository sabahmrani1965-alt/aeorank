import Link from "next/link";
import Image from "next/image";
import HeaderAuthLink from "@/components/HeaderAuthLink";

export default function Header() {
  return (
    <header className="header">
      <Link href="/" className="logo" aria-label="AEOrank home">
        <Image
          src="/logo.svg"
          alt="AEOrank"
          width={170}
          height={38}
          priority
        />
      </Link>
      <div className="header-actions">
        <Link href="/about" className="header-link">About</Link>
        <HeaderAuthLink />
        <Link href="/contact" className="btn btn-primary">
          Get Started →
        </Link>
      </div>
    </header>
  );
}
