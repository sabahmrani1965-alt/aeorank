"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import NotificationBell from "./NotificationBell";
import { IconMenu } from "./Sidebar";

export default function TopHeader({ email, notifications, onOpenSidebar }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="app-topbar">
      <div className="app-topbar-left">
        <button type="button" className="app-sidebar-toggle" onClick={onOpenSidebar} aria-label="Open menu">
          <IconMenu />
        </button>
        <span className="logo-mark" style={{ width: 26, height: 26, fontSize: 12 }}>K</span>
      </div>

      <span
        style={{
          marginRight: "auto",
          fontSize: 13.5,
          color: "var(--text-dim)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {email}
      </span>

      <NotificationBell notifications={notifications} />

      <button type="button" onClick={handleSignOut} className="btn btn-ghost btn-sm">
        Sign out
      </button>
    </header>
  );
}
