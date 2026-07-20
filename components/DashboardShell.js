"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CreditBadge from "./CreditBadge";

function IconProps({ children }) {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
const IconGrid = () => <IconProps><rect x="3" y="3" width="6" height="6" rx="1.5" /><rect x="11" y="3" width="6" height="6" rx="1.5" /><rect x="3" y="11" width="6" height="6" rx="1.5" /><rect x="11" y="11" width="6" height="6" rx="1.5" /></IconProps>;
const IconSearch = () => <IconProps><circle cx="8.5" cy="8.5" r="5.5" /><path d="M16.5 16.5l-3.6-3.6" /></IconProps>;
const IconChat = () => <IconProps><path d="M3 4.5h14v9H8l-3.5 3v-3H3z" /></IconProps>;
const IconPencil = () => <IconProps><path d="M13 3.5l3.5 3.5L6 17.5H2.5V14z" /></IconProps>;
const IconLayers = () => <IconProps><path d="M10 3l7 4-7 4-7-4 7-4z" /><path d="M3 11l7 4 7-4" /></IconProps>;
const IconChart = () => <IconProps><path d="M3.5 16.5V9M9.5 16.5V4M15.5 16.5v-6" /><path d="M3.5 16.5h14" /></IconProps>;
const IconPrompt = () => <IconProps><circle cx="10" cy="10" r="7" /><path d="M7.8 8a2.2 2.2 0 014.2.9c0 1.5-2 1.3-2 3" /><circle cx="10" cy="14" r=".4" fill="currentColor" /></IconProps>;
const IconBook = () => <IconProps><path d="M4 4h9a3 3 0 013 3v9.5H7a3 3 0 00-3 3z" /><path d="M4 4v12.5" /></IconProps>;
const IconCoin = () => <IconProps><circle cx="10" cy="10" r="6.5" /><path d="M10 6.5v7M7.7 12.5c0 1 1 1.5 2.3 1.5s2.3-.6 2.3-1.5-1-1.2-2.3-1.5-2.3-.5-2.3-1.4S9 8 10.3 8s2 .4 2.2 1.2" /></IconProps>;
const IconCard = () => <IconProps><rect x="3" y="5" width="14" height="10" rx="2" /><path d="M3 8.5h14" /></IconProps>;
const IconMenu = () => <IconProps><path d="M3 5.5h14M3 10h14M3 14.5h14" /></IconProps>;

const NAV_GROUPS = [
  { label: null, links: [{ href: "/dashboard", label: "Dashboard", icon: IconGrid }] },
  {
    label: "Discover",
    links: [
      { href: "/dashboard/opportunities", label: "Opportunities", icon: IconSearch },
      { href: "/dashboard/mentions", label: "Mentions", icon: IconChat },
    ],
  },
  {
    label: "Create",
    links: [
      { href: "/dashboard/drafts/new", label: "Add Task", icon: IconPencil },
      { href: "/dashboard/drafts", label: "Track Task", icon: IconLayers },
    ],
  },
  {
    label: "Analyze",
    links: [
      { href: "/dashboard/reports", label: "Reports", icon: IconChart },
      { href: "/dashboard/prompts", label: "Prompts", icon: IconPrompt },
    ],
  },
  { label: "Knowledge", links: [{ href: "/dashboard/settings", label: "Company Profile", icon: IconBook }] },
  {
    label: "Account",
    links: [
      { href: "/dashboard/credits", label: "Credits", icon: IconCoin },
      { href: "/dashboard/billing", label: "Billing", icon: IconCard },
    ],
  },
];

const ALL_HREFS = NAV_GROUPS.flatMap((g) => g.links.map((l) => l.href));

// Longest-prefix match against the flat href list — correctly resolves
// sibling routes that share a URL prefix (e.g. /dashboard/drafts/new is its
// own nav item, not a child of /dashboard/drafts, even though the string
// nests) since the more specific href always wins when both match.
function activeHref(pathname) {
  let best = null;
  for (const href of ALL_HREFS) {
    if (pathname === href || pathname.startsWith(href + "/")) {
      if (!best || href.length > best.length) best = href;
    }
  }
  return best;
}

function displayDomain(website) {
  if (!website) return "";
  try {
    const u = new URL(/^https?:\/\//i.test(website) ? website : `https://${website}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return website;
  }
}

export default function DashboardShell({ email, isAdmin, creditBalance, project, plan, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const current = activeHref(pathname);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const projectLabel = displayDomain(project?.website) || project?.name || "";

  return (
    <div className="app-shell">
      {sidebarOpen && <div className="app-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <aside className={`app-sidebar${sidebarOpen ? " is-open" : ""}`}>
        <Link href="/dashboard" className="app-sidebar-logo">
          <span className="logo-mark" style={{ width: 28, height: 28, fontSize: 13 }}>A</span>
          AEOrank
        </Link>

        {projectLabel && (
          <div className="app-sidebar-project">
            <span className="app-sidebar-project-icon">{projectLabel[0].toUpperCase()}</span>
            <div className="app-sidebar-project-info">
              <div className="app-sidebar-project-name">{projectLabel}</div>
              <span className="app-sidebar-project-plan">{plan ? `${plan} Plan` : "No plan"}</span>
            </div>
          </div>
        )}

        <nav style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1, overflowY: "auto" }}>
          {NAV_GROUPS.map((group, i) => (
            <div className="app-sidebar-group" key={group.label || `top-${i}`}>
              {group.label && <div className="app-sidebar-group-label">{group.label}</div>}
              {group.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`app-sidebar-link${current === link.href ? " is-active" : ""}`}
                >
                  <link.icon />
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="app-topbar-left">
            <button type="button" className="app-sidebar-toggle" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <IconMenu />
            </button>
          </div>

          <CreditBadge balance={creditBalance} />

          <div className="account-menu" ref={menuRef}>
            <button type="button" className="account-menu-trigger" onClick={() => setMenuOpen((v) => !v)}>
              <span className="account-menu-avatar">{(email || "?")[0].toUpperCase()}</span>
            </button>
            {menuOpen && (
              <div className="account-menu-dropdown">
                <div className="account-menu-email">{email}</div>
                {isAdmin && (
                  <Link href="/admin" className="account-menu-item" onClick={() => setMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <Link href="/" className="account-menu-item" onClick={() => setMenuOpen(false)}>
                  Back to site
                </Link>
                <button type="button" className="account-menu-item" onClick={handleSignOut}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
