import Link from "next/link";

export default function EmptyState({
  icon = "📭",
  title = "No tasks available right now.",
  subtitle = "Check back soon or invite friends while you wait.",
  actionHref,
  actionLabel,
}) {
  return (
    <div className="kc-empty-state fade-in">
      <div className="kc-empty-state-icon">{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{title}</div>
      <div style={{ fontSize: 13.5, maxWidth: 340 }}>{subtitle}</div>
      {actionHref && (
        <Link href={actionHref} className="btn btn-primary btn-sm" style={{ marginTop: 14 }}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
