"use client";

import CopyButton from "./CopyButton";

function Block({ label, text, bold }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)" }}>
          {label}
        </span>
        <CopyButton text={text} />
      </div>
      <div className="kc-code-block" style={bold ? { fontWeight: 700 } : undefined}>{text}</div>
    </div>
  );
}

// A Reddit post has two SEPARATE fields (title, body) a poster has to
// paste into individually — showing them as one merged block made the
// title just look like a bold first line of the body, easy to miss or
// paste into the wrong field. Split into two clearly labeled blocks
// (each with its own Copy button) for "post" type only; every other
// type never had a separate title to begin with.
export default function DraftViewer({ initialTitle, initialBody, type }) {
  const isPost = type === "post" && initialTitle;

  if (isPost) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Block label="Title" text={initialTitle} bold />
        <Block label="Body" text={initialBody} />
      </div>
    );
  }

  return <Block label="Generated Content" text={initialBody} />;
}
