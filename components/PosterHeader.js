"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Minimal header for /poster — posters aren't customers (no sidebar, no
// credits, no subscription), so this deliberately doesn't reuse
// DashboardShell.
export default function PosterHeader({ email }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="header" style={{ marginBottom: 32 }}>
      <div className="logo">
        <span className="logo-mark">A</span>
        AEOrank — Poster
      </div>
      <div className="header-actions">
        <span className="header-link">{email}</span>
        <button type="button" onClick={handleSignOut} className="btn btn-ghost btn-sm">
          Sign out
        </button>
      </div>
    </header>
  );
}
