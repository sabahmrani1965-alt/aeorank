"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function IconProps({ children }) {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
const IconPlay = () => <IconProps><path d="M6 4.5l10 5.5-10 5.5z" /></IconProps>;
const IconCoin = () => <IconProps><circle cx="10" cy="10" r="6.5" /><path d="M10 6.5v7M7.7 12.5c0 1 1 1.5 2.3 1.5s2.3-.6 2.3-1.5-1-1.2-2.3-1.5-2.3-.5-2.3-1.4S9 8 10.3 8s2 .4 2.2 1.2" /></IconProps>;
const IconHistory = () => <IconProps><circle cx="10" cy="10" r="7" /><path d="M10 6v4l3 2" /></IconProps>;
const IconTrophy = () => <IconProps><path d="M6 4h8v4a4 4 0 01-8 0z" /><path d="M6 5H4a2 2 0 002 3M14 5h2a2 2 0 01-2 3M8.5 12v2h3v-2M7 16.5h6" /></IconProps>;
const IconUsers = () => <IconProps><circle cx="7.5" cy="7" r="2.5" /><circle cx="14" cy="8" r="2" /><path d="M3 16c0-2.2 2-4 4.5-4s4.5 1.8 4.5 4M12.5 12.5c2 .1 3.5 1.6 3.5 3.5" /></IconProps>;
const IconSettings = () => <IconProps><circle cx="10" cy="10" r="2.5" /><path d="M10 3.5v2M10 14.5v2M16.5 10h-2M5.5 10h-2M14.6 5.4l-1.4 1.4M6.8 13.2l-1.4 1.4M14.6 14.6l-1.4-1.4M6.8 6.8L5.4 5.4" /></IconProps>;
const IconMenu = () => <IconProps><path d="M3 5.5h14M3 10h14M3 14.5h14" /></IconProps>;

const NAV_LINKS = [
  { href: "/poster", label: "Play", icon: IconPlay },
  { href: "/poster/earnings", label: "Earnings", icon: IconCoin },
  { href: "/poster/history", label: "History", icon: IconHistory },
  { href: "/poster/leaderboard", label: "Leaderboard", icon: IconTrophy },
  { href: "/poster/refer", label: "Refer Friends", icon: IconUsers },
  { href: "/poster/settings", label: "Settings", icon: IconSettings },
];

// Longest-prefix match, same convention as DashboardShell.js's activeHref
// — keeps sibling routes that share a URL prefix from both lighting up.
function activeHref(pathname) {
  let best = null;
  for (const link of NAV_LINKS) {
    if (pathname === link.href || pathname.startsWith(link.href + "/")) {
      if (!best || link.href.length > best.length) best = link.href;
    }
  }
  return best;
}

export { IconMenu };

export default function Sidebar({ email, pending, discordUrl, sidebarOpen, onClose }) {
  const pathname = usePathname();
  const current = activeHref(pathname);

  return (
    <>
      {sidebarOpen && <div className="app-sidebar-backdrop" onClick={onClose} />}
      <aside className={`app-sidebar${sidebarOpen ? " is-open" : ""}`}>
        <Link href="/poster" className="app-sidebar-logo">
          <span className="logo-mark" style={{ width: 28, height: 28, fontSize: 13 }}>K</span>
          KarmaCrew
        </Link>

        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, overflowY: "auto" }}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`app-sidebar-link${current === link.href ? " is-active" : ""}`}
            >
              <link.icon />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="kc-sidebar-bottom">
          <div className="kc-balance-pill">
            <span className="kc-balance-pill-label">Balance</span>
            <span className="kc-balance-pill-value">${pending.toFixed(2)}</span>
          </div>
          <div className="kc-account-row">
            <span className="kc-avatar">{(email || "?")[0].toUpperCase()}</span>
            <span className="kc-account-email">{email}</span>
          </div>
          {discordUrl && (
            <a href={discordUrl} target="_blank" rel="noopener noreferrer" className="kc-discord-btn">
              💬 Join our Discord
            </a>
          )}
        </div>
      </aside>
    </>
  );
}
