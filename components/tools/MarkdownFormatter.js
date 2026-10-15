"use client";

import { useMemo, useState } from "react";

const SAMPLE = `## Reddit markdown, previewed

**Bold**, *italic*, ~~strikethrough~~, \`inline code\` and ^superscript.

> A quoted line from the thread you are answering.

- Bullet one
- Bullet two

1. Numbered step
2. Another step

[A link](https://www.reddit.com) and a >!spoiler!<.

    four-space indented code block`;

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Inline formatting, on text that is already HTML-escaped. Links only
// accept http(s) so a pasted javascript: URL can never render as a link.
function inline(s) {
  // Code spans and links are set aside first so the emphasis rules below
  // can't rewrite underscores or asterisks inside a URL or code.
  const kept = [];
  const keep = (html) => `\u0000${kept.push(html) - 1}\u0000`;
  let t = s
    .replace(/`([^`]+)`/g, (_, c) => keep(`<code>${c}</code>`))
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, label, href) =>
      keep(`<a href="${href}" rel="nofollow noopener" target="_blank">${label}</a>`)
    );
  t = t
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/(^|[\s(])_([^_]+)_(?=[\s).,!?]|$)/g, "$1<em>$2</em>")
    .replace(/~~([^~]+)~~/g, "<del>$1</del>")
    .replace(/&gt;!(.+?)!&lt;/g, '<span class="md-spoiler">$1</span>')
    .replace(/\^\(([^)]+)\)/g, "<sup>$1</sup>")
    .replace(/\^([^\s\u0000]+)/g, "<sup>$1</sup>");
  return t.replace(/\u0000(\d+)\u0000/g, (_, i) => kept[Number(i)]);
}

export function renderRedditMarkdown(src) {
  const lines = escapeHtml(src.replace(/\r\n/g, "\n")).split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^ {4}|\t/.test(line)) {
      const block = [];
      while (i < lines.length && (/^ {4}|\t/.test(lines[i]) || lines[i] === "")) {
        block.push(lines[i].replace(/^ {4}|\t/, ""));
        i++;
      }
      out.push(`<pre><code>${block.join("\n").replace(/\n+$/, "")}</code></pre>`);
      continue;
    }
    if (/^```/.test(line)) {
      const block = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) block.push(lines[i++]);
      i++;
      out.push(`<pre><code>${block.join("\n")}</code></pre>`);
      continue;
    }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`);
      i++;
      continue;
    }
    if (/^(\*\s*\*\s*\*|-\s*-\s*-)[\s*-]*$/.test(line)) {
      out.push("<hr/>");
      i++;
      continue;
    }
    if (/^&gt;(?!!)/.test(line)) {
      const block = [];
      while (i < lines.length && /^&gt;(?!!)/.test(lines[i])) block.push(lines[i++].replace(/^&gt;\s?/, ""));
      out.push(`<blockquote>${block.map(inline).join("<br/>")}</blockquote>`);
      continue;
    }
    if (/^[-*+]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i])) items.push(lines[i++].replace(/^[-*+]\s+/, ""));
      out.push(`<ul>${items.map((t) => `<li>${inline(t)}</li>`).join("")}</ul>`);
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) items.push(lines[i++].replace(/^\d+\.\s+/, ""));
      out.push(`<ol>${items.map((t) => `<li>${inline(t)}</li>`).join("")}</ol>`);
      continue;
    }
    if (line.trim() === "") {
      i++;
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() !== "" && !/^(#{1,6}\s|&gt;(?!!)|[-*+]\s|\d+\.\s| {4}|```)/.test(lines[i])) {
      para.push(lines[i++]);
    }
    // Never leave a line unconsumed: that would loop forever on input
    // no rule above recognises.
    if (para.length === 0) para.push(lines[i++]);
    // Reddit joins single newlines into one line; two trailing spaces force a break.
    out.push(`<p>${para.map((p) => inline(p.replace(/ {2,}$/, "<br/>"))).join(" ")}</p>`);
  }
  return out.join("\n");
}

export default function MarkdownFormatter() {
  const [text, setText] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);
  const html = useMemo(() => renderRedditMarkdown(text), [text]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <div className="tool-two-col">
      <div className="card">
        <label htmlFor="md-in" className="tool-label">Your markdown</label>
        <textarea
          id="md-in"
          className="input tool-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={16}
          spellCheck
        />
        <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
          <button type="button" className="btn btn-primary" onClick={copy}>
            {copied ? "Copied" : "Copy markdown"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setText("")}>
            Clear
          </button>
          <span className="tool-meta">{text.length.toLocaleString()} / 10,000 characters</span>
        </div>
      </div>
      <div className="card">
        <div className="tool-label">Preview</div>
        <div className="md-preview" aria-live="polite" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
