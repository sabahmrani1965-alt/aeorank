import Link from "next/link";

export default function CrewQuestNav() {
  return (
    <header className="cq-nav">
      <Link href="/crewquest" className="logo">
        <span className="logo-mark">C</span>
        CrewQuest
      </Link>
      <nav className="cq-nav-links">
        <a href="#how-it-works">How it Works</a>
        <a href="#faq">FAQ</a>
      </nav>
      <div className="cq-nav-actions">
        <Link href="/login" className="header-link">
          Log in
        </Link>
        <Link href="/apply-poster" className="btn btn-primary btn-sm">
          Get Started
        </Link>
      </div>
    </header>
  );
}
