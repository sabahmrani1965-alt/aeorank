// Visual score badge for an Opportunity card — big number + tier label,
// color-coded. Thresholds: Excellent >=85, Good 60-84, Low <60.
function tierFor(score) {
  if (score >= 85) {
    return {
      label: "Excellent Match",
      fg: "var(--state-success-fg)",
      bg: "linear-gradient(135deg, rgba(110,231,183,.18) 0%, rgba(110,231,183,.05) 100%)",
      border: "rgba(110,231,183,.4)",
    };
  }
  if (score >= 60) {
    return {
      label: "Good Match",
      fg: "var(--accent)",
      bg: "linear-gradient(135deg, rgba(242,168,59,.18) 0%, rgba(242,168,59,.05) 100%)",
      border: "rgba(242,168,59,.4)",
    };
  }
  return {
    label: "Low Match",
    fg: "var(--state-danger-fg)",
    bg: "linear-gradient(135deg, rgba(255,120,120,.16) 0%, rgba(255,120,120,.05) 100%)",
    border: "rgba(255,120,120,.35)",
  };
}

export default function ScoreBadge({ score }) {
  if (score == null) return null;
  const tier = tierFor(score);
  return (
    <div className="opp-badge" style={{ background: tier.bg, borderColor: tier.border, color: tier.fg }}>
      <span className="opp-badge-num">{score}</span>
      <span className="opp-badge-label">{tier.label}</span>
    </div>
  );
}
