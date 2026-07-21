import Link from "next/link";

export default function CrewQuestFooter() {
  return (
    <footer className="cq-footer">
      <div className="logo" style={{ marginBottom: 8 }}>
        <span className="logo-mark" style={{ width: 28, height: 28, fontSize: 13 }}>
          C
        </span>
        CrewQuest
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: 13.5, maxWidth: 420, margin: "0 auto 20px" }}>
        A creator marketplace for real Reddit missions.
      </p>
      <div className="cq-footer-links">
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
        <a href="/login">Log in</a>
        <a href="/apply-poster">Apply</a>
      </div>
      <div style={{ color: "var(--text-muted)", fontSize: 12.5, marginTop: 20 }}>
        © {new Date().getFullYear()} CrewQuest.
      </div>
    </footer>
  );
}
