import Link from "next/link";

export default function CreditBadge({ balance }) {
  return (
    <Link href="/dashboard/credits" className="credit-badge">
      <span className="credit-badge-dot" />
      {balance ?? 0} credits
    </Link>
  );
}
