"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CREDIT_COSTS } from "@/lib/credits";
import { normalizeRedditUrl } from "@/lib/format";
import { ago, cleanPostText, intentLabel, scoreTier } from "./opportunityFormat";

const TONES = ["Helpful", "Casual", "Expert", "Enthusiastic"];
const LENGTHS = [
  { key: "short", label: "Short" },
  { key: "medium", label: "Medium" },
  { key: "long", label: "Long" },
];
const SAVE_COST = CREDIT_COSTS.generate_comment;

const Svg = ({ children }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

// The selected thread, why it fits, and an inline composer that drafts a
// top-level comment (an opportunity IS a Reddit post, so responding to it
// is commenting on it). Generating is free; credits are charged only when
// the comment is saved as a task (app/api/drafts/route.js).
export default function OpportunityDetailPane({ opportunity: o, brandWebsite, competitorMatch, onSavedChange, onDismissed, onPostLoaded }) {
  const [saved, setSaved] = useState(Boolean(o.saved));
  const [busy, setBusy] = useState("");
  const [actionError, setActionError] = useState("");

  const [tone, setTone] = useState("Helpful");
  const [length, setLength] = useState("medium");
  const [mentionBrand, setMentionBrand] = useState(true);
  const [includeLink, setIncludeLink] = useState(false);
  const [body, setBody] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [copied, setCopied] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedInfo, setSavedInfo] = useState(null);

  const tier = scoreTier(o.relevance_score);
  const intent = intentLabel(o.buying_intent);
  const targetUrl = normalizeRedditUrl(o.permalink);

  // The full post: stored text when there is some, otherwise fetched once
  // from Reddit (app/api/opportunities/[id]/post) and kept on the thread.
  const stored = cleanPostText(o.thread_selftext, o.title);
  const [post, setPost] = useState(
    stored ? { state: "ready", text: stored, ups: o.ups, comments: o.comments } : { state: "loading" }
  );
  useEffect(() => {
    if (stored) return;
    let live = true;
    fetch(`/api/opportunities/${o.id}/post`, { method: "POST" })
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (!live) return;
        const text = ok ? cleanPostText(j.selftext, o.title) : "";
        if (ok) onPostLoaded?.({ thread_selftext: j.selftext, ups: j.ups, comments: j.comments });
        setPost(text ? { state: "ready", text, author: j.author, ups: j.ups, comments: j.comments } : { state: "empty", snippet: cleanPostText(o.snippet, o.title) });
      })
      .catch(() => live && setPost({ state: "empty", snippet: cleanPostText(o.snippet, o.title) }));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [o.id]);
  const postText = post.state === "ready" ? post.text : post.snippet || "";

  async function patch(payload) {
    const res = await fetch(`/api/opportunities/${o.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Something went wrong.");
  }

  async function toggleSaved() {
    const next = !saved;
    setSaved(next);
    setBusy("save");
    setActionError("");
    try {
      await patch({ saved: next });
      onSavedChange?.(next);
    } catch (e) {
      setSaved(!next);
      setActionError(e.message);
    } finally {
      setBusy("");
    }
  }

  async function dismiss() {
    setBusy("dismiss");
    setActionError("");
    try {
      await patch({ dismissed: true });
      onDismissed?.();
    } catch (e) {
      setActionError(e.message);
      setBusy("");
    }
  }

  async function generateComment() {
    setGenerateError("");
    setGenerating(true);
    try {
      const res = await fetch("/api/drafts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "comment",
          subreddit: o.sub,
          threadContext: o.title,
          threadBody: postText,
          tone: tone.toLowerCase(),
          length,
          mentionBrand,
          includeLink,
          existingText: body,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not generate a comment.");
      setBody(data.body || "");
    } catch (e) {
      setGenerateError(e?.message || "Something went wrong.");
    } finally {
      setGenerating(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  }

  async function createTask() {
    setSaveError("");
    if (!body.trim()) {
      setSaveError("Generate or write a comment first.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "comment",
          subreddit: o.sub.startsWith("r/") ? o.sub : `r/${o.sub}`,
          title: o.title,
          body,
          targetUrl,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not save this task.");
      setSavedInfo({ creditsCharged: data.creditsCharged, creditsRemaining: data.creditsRemaining });
    } catch (e) {
      setSaveError(e?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="op-detail">
      <header className="op-detail-head">
        <div className="op-detail-head-main">
          <div className="op-detail-meta">
            <span>{o.sub}</span>
            {o.post_created_at ? <span>· Posted {ago(o.post_created_at)}</span> : null}
            {intent ? <span className={`op-intent ${intent.cls}`}>{intent.label}</span> : null}
          </div>
          <h2 className="op-detail-title">{o.title}</h2>
        </div>
        <div className={`op-match ${tier.cls}`}>
          <strong>{o.relevance_score ?? "–"}</strong>
          <span>{tier.label}</span>
        </div>
      </header>

      <div className="op-actions">
        <a href={o.permalink} target="_blank" rel="noopener noreferrer" className="op-btn">
          View on Reddit
          <Svg>
            <path d="M7 17 17 7M8 7h9v9" />
          </Svg>
        </a>
        <button type="button" onClick={toggleSaved} disabled={busy === "save"} className={`op-btn${saved ? " is-on" : ""}`} aria-pressed={saved}>
          <Svg>
            <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z" />
          </Svg>
          {saved ? "Saved" : "Save"}
        </button>
        <button type="button" onClick={dismiss} disabled={busy === "dismiss"} className="op-btn op-btn-quiet">
          <Svg>
            <circle cx="12" cy="12" r="9" />
            <path d="m5.7 5.7 12.6 12.6" />
          </Svg>
          {busy === "dismiss" ? "Removing…" : "Not relevant"}
        </button>
      </div>
      {actionError ? (
        <p role="alert" className="op-error">
          {actionError}
        </p>
      ) : null}

      <section className="op-post" aria-busy={post.state === "loading"}>
        <div className="op-post-head">
          <span className="op-post-avatar" aria-hidden="true">
            {(post.author || o.sub.replace(/^r\//, ""))[0]?.toUpperCase()}
          </span>
          <span>
            {post.author ? `u/${post.author}` : o.sub}
            {o.post_created_at ? ` · ${ago(o.post_created_at)}` : ""}
          </span>
        </div>
        {post.state === "loading" ? (
          <div className="op-post-loading">
            <span />
            <span />
            <span />
            <p>Loading the post from Reddit…</p>
          </div>
        ) : postText ? (
          <p className="op-post-text">{postText.length > 1200 ? `${postText.slice(0, 1200)}…` : postText}</p>
        ) : (
          <p className="op-post-missing">This post has no text we could load, or it's a link or image post.</p>
        )}
        <div className="op-post-stats">
          {(post.ups ?? o.ups) > 0 ? (
            <span>
              <Svg>
                <path d="M12 19V5M5 12l7-7 7 7" />
              </Svg>
              {(post.ups ?? o.ups).toLocaleString()}
            </span>
          ) : null}
          {(post.comments ?? o.comments) > 0 ? (
            <span>
              <Svg>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </Svg>
              {(post.comments ?? o.comments).toLocaleString()} comments
            </span>
          ) : null}
          <a href={o.permalink} target="_blank" rel="noopener noreferrer">
            Read the full thread on Reddit
          </a>
        </div>
        {competitorMatch ? (
          <p className="op-why-note">
            Mentions a competitor: <strong>{competitorMatch}</strong>
          </p>
        ) : null}
      </section>

      <section className="op-composer">
        <h3>Write a comment with AI</h3>
        {savedInfo ? (
          <div className="op-saved">
            <strong>Saved to your tasks</strong>
            <p>
              −{savedInfo.creditsCharged} credits
              {typeof savedInfo.creditsRemaining === "number" ? ` · ${savedInfo.creditsRemaining} credits left` : ""}
            </p>
            <Link href="/dashboard/drafts" className="op-btn">
              Open Track tasks →
            </Link>
          </div>
        ) : (
          <div className="op-composer-grid">
            <div className="op-composer-controls">
              <div className="op-composer-row">
                <label>
                  <span>Tone</span>
                  <select value={tone} onChange={(e) => setTone(e.target.value)} className="op-select">
                    {TONES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Length</span>
                  <select value={length} onChange={(e) => setLength(e.target.value)} className="op-select">
                    {LENGTHS.map((l) => (
                      <option key={l.key} value={l.key}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <fieldset className="op-checks">
                <legend>Include in the comment</legend>
                <label>
                  <input type="checkbox" checked={mentionBrand} onChange={(e) => setMentionBrand(e.target.checked)} />
                  Mention your brand
                </label>
                <label title={brandWebsite ? brandWebsite : "Add your website in Company Profile"}>
                  <input type="checkbox" checked={includeLink} disabled={!brandWebsite} onChange={(e) => setIncludeLink(e.target.checked)} />
                  Add your link
                </label>
              </fieldset>
              <button type="button" onClick={generateComment} disabled={generating} className="btn btn-primary">
                {generating ? "Writing…" : body ? "Rewrite with AI" : "Generate comment"}
              </button>
              <p className="op-hint">Free to generate. Saving it as a task costs {SAVE_COST} credits.</p>
              {generateError ? (
                <p role="alert" className="op-error">
                  {generateError}
                </p>
              ) : null}
            </div>

            <div className="op-composer-output">
              <div className="op-output-head">
                <span>Your comment</span>
                <button type="button" onClick={copy} disabled={!body} className="op-btn op-btn-sm">
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value.slice(0, 2000))}
                rows={8}
                placeholder="Generate a draft, or write your own. Edit it until it sounds like you."
                className="op-textarea"
                aria-label="Your comment"
              />
              <div className="op-output-foot">
                <span>{body.length}/2000</span>
                <button type="button" onClick={createTask} disabled={saving || !body.trim()} className="btn btn-secondary btn-sm">
                  {saving ? "Saving…" : `Save as task (−${SAVE_COST} credits)`}
                </button>
              </div>
              {saveError ? (
                <p role="alert" className="op-error">
                  {saveError}
                </p>
              ) : null}
            </div>
          </div>
        )}
      </section>
    </article>
  );
}
