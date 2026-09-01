// 'submitted' here means verified (auto-confirmed live, or grandfathered
// in from before the review gate existed) — genuinely approved, not just
// "turned in." A row that couldn't be auto-verified shows 'pending_review'
// instead (see getEarningsSummary, lib/posterPay.js) until an admin
// approves (-> 'submitted'/paid track), asks for a fix (-> 'changes_requested',
// the poster can resubmit), or rejects (-> 'rejected') it via
// app/api/admin/drafts/[id]/review.
const CONFIG = {
  available: { label: "Available", cls: "kc-badge-available" },
  claimed: { label: "In Progress", cls: "kc-badge-claimed" },
  submitted: { label: "Submitted · Approved", cls: "kc-badge-submitted" },
  pending_review: { label: "Pending Review", cls: "kc-badge-claimed" },
  changes_requested: { label: "Changes Requested", cls: "kc-badge-claimed" },
  paid: { label: "Paid", cls: "kc-badge-paid" },
  requested: { label: "Requested", cls: "kc-badge-claimed" },
  rejected: { label: "Rejected", cls: "kc-badge-rejected" },
};

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] || CONFIG.available;
  return <span className={`kc-badge ${cfg.cls}`}>{cfg.label}</span>;
}
