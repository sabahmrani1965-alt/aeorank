"use client";

import { useState } from "react";

const TABS = [
  { key: "profile", label: "Company Profile" },
  { key: "keywords", label: "Keywords" },
];

// Both panels stay mounted (toggled via display:none, not conditional
// unmounting) so switching tabs never loses in-progress form state or
// re-fetches anything.
export default function SettingsTabs({ initialTab, profileTab, keywordsTab }) {
  const [tab, setTab] = useState(TABS.some((t) => t.key === initialTab) ? initialTab : "profile");

  return (
    <div>
      <div className="settings-tabs-nav">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`settings-tab${tab === t.key ? " is-active" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ display: tab === "profile" ? "block" : "none" }}>{profileTab}</div>
      <div style={{ display: tab === "keywords" ? "block" : "none" }}>{keywordsTab}</div>
    </div>
  );
}
