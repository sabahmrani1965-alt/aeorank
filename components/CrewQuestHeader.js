import Link from "next/link";

// Minimal public header for /apply-poster — deliberately not the AEOrank
// Header (different logo, no marketing nav) since this area is meant to
// read as its own site. See .kc-theme in globals.css for the color scheme.
export default function CrewQuestHeader() {
  return (
    <header className="header">
      <Link href="/apply-poster" className="logo" aria-label="CrewQuest home">
        <span className="logo-mark">C</span>
        CrewQuest
      </Link>
      <div className="header-actions">
        <Link href="/login" className="header-link">
          Log in
        </Link>
      </div>
    </header>
  );
}
