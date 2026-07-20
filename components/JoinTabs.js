"use client";

import { useState } from "react";
import ApplyPosterForm from "./ApplyPosterForm";
import SignupForm from "./SignupForm";

// Same two real flows as before (poster application w/ Reddit
// verification vs immediate AEOrank account creation) — just one entry
// page instead of two separate ones.
export default function JoinTabs({ referral, initialTab = "creator" }) {
  const [tab, setTab] = useState(initialTab);

  return (
    <div>
      <div className="cq-join-tabs">
        <button
          type="button"
          onClick={() => setTab("creator")}
          className={`cq-join-tab${tab === "creator" ? " is-active" : ""}`}
        >
          I'm a Creator
        </button>
        <button
          type="button"
          onClick={() => setTab("brand")}
          className={`cq-join-tab${tab === "brand" ? " is-active" : ""}`}
        >
          I'm a Brand
        </button>
      </div>

      <div className="card" style={{ padding: 30, marginTop: 20, maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
        {tab === "creator" ? (
          <>
            <p className="section-sub" style={{ marginBottom: 20 }}>
              Complete real posting/commenting missions on Reddit and get paid per mission.
            </p>
            <ApplyPosterForm referral={referral} />
          </>
        ) : (
          <>
            <h3 style={{ marginBottom: 8 }}>Create a brand account</h3>
            <p className="section-sub" style={{ textAlign: "left", margin: "0 0 20px" }}>
              AEOrank helps your brand show up in AI answers, backed by measurable Reddit signals —
              launch CrewQuest missions from your account.
            </p>
            <SignupForm />
          </>
        )}
      </div>
    </div>
  );
}
