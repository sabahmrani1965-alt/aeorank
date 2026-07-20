// Cosmetic status display — there's no real admin review gate, so
// "submitted" and "approved" are the same real state, shown together.
// 'rejected' is a reserved value (not currently produced anywhere; no
// review pipeline sets it yet) — kept here so the badge renders sanely
// if that phase gets built later, instead of falling through to Available.
const CONFIG = {
  available: { label: "Available", cls: "kc-badge-available" },
  claimed: { label: "In Progress", cls: "kc-badge-claimed" },
  submitted: { label: "Submitted · Approved", cls: "kc-badge-submitted" },
  paid: { label: "Paid", cls: "kc-badge-paid" },
  rejected: { label: "Rejected", cls: "kc-badge-rejected" },
};

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] || CONFIG.available;
  return <span className={`kc-badge ${cfg.cls}`}>{cfg.label}</span>;
}
