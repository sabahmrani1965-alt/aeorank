import Link from "next/link";
import Image from "next/image";

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
        <Link href="/contact" className="btn btn-primary">
          Get Started →
        </Link>
      </div>
    </header>
  );
}
