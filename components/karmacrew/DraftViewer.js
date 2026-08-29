"use client";

import CopyButton from "./CopyButton";

export default function DraftViewer({ initialTitle, initialBody, type }) {
  const fullText = type === "post" && initialTitle ? `${initialTitle}\n\n${initialBody}` : initialBody;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)" }}>
          Generated Content
        </span>
        <CopyButton text={fullText} />
      </div>
      <div className="kc-code-block">
        {type === "post" && initialTitle && <div style={{ fontWeight: 700, marginBottom: 8 }}>{initialTitle}</div>}
        {initialBody}
      </div>
    </div>
  );
}
