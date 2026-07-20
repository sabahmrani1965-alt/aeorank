"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const TABS = [
  { href: "/poster", label: "Assignments" },
  { href: "/poster/earnings", label: "Earnings" },
  { href: "/poster/refer", label: "Refer a friend" },
];

// Minimal header for /poster — posters aren't customers (no sidebar, no
// credits, no subscription), so this deliberately doesn't reuse
// DashboardShell. Branded as KarmaCrew (see .kc-theme in globals.css) —
// posters see a distinct site, not "AEOrank's poster page".
export default function PosterHeader({ email }) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div style={{ marginBottom: 32 }}>
      <header className="header" style={{ marginBottom: 20 }}>
        <div className="logo">
          <span className="logo-mark">K</span>
          KarmaCrew
        </div>
        <div className="header-actions">
          <span className="header-link">{email}</span>
          <button type="button" onClick={handleSignOut} className="btn btn-ghost btn-sm">
            Sign out
          </button>
        </div>
      </header>
      <div style={{ display: "flex", gap: 8 }}>
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={pathname === tab.href ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
