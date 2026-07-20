"use client";

import { useEffect, useRef, useState } from "react";

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

// Real, not decorative — notifications are the poster's own recent
// submissions + payouts (computed server-side in app/poster/layout.js),
// not a static icon with nothing behind it.
export default function NotificationBell({ notifications = [] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        style={{
          width: 38, height: 38,
          borderRadius: 10,
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          color: "var(--text)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          position: "relative",
        }}
      >
        🔔
        {notifications.length > 0 && (
          <span
            style={{
              position: "absolute", top: 6, right: 6,
              width: 7, height: 7, borderRadius: "50%",
              background: "var(--accent)",
            }}
          />
        )}
      </button>

      {open && (
        <div
          className="fade-in"
          style={{
            position: "absolute", right: 0, top: "calc(100% + 8px)",
            width: 300,
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            borderRadius: 14,
            boxShadow: "0 16px 40px -12px rgba(0,0,0,.5)",
            zIndex: 60,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--card-border-soft)", fontWeight: 700, fontSize: 13.5 }}>
            Notifications
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              Nothing yet.
            </div>
          ) : (
            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              {notifications.map((n, i) => (
                <div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid var(--card-border-soft)" }}>
                  <div style={{ fontSize: 13, color: "var(--text)" }}>{n.text}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 3 }}>{timeAgo(n.at)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
