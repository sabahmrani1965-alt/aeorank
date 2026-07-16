"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CREDIT_COSTS } from "@/lib/credits";

const TYPES = [
  { key: "comment", label: "Post a Comment" },
  { key: "post", label: "Create a Post" },
  { key: "reply", label: "Reply to a Comment" },
];
const TONES = ["Helpful", "Casual", "Expert", "Enthusiastic"];
const LENGTHS = [
  { key: "short", label: "Short" },
  { key: "medium", label: "Medium" },
  { key: "long", label: "Long" },
];

const selectStyle = {
  background: "var(--bg-3)",
  border: "1px solid var(--card-border)",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
  color: "var(--text)",
  fontFamily: "inherit",
};

const labelStyle = {
  fontSize: 12.5,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: ".04em",
  color: "var(--text-muted)",
  marginBottom: 4,
};

function intentColor(intent) {
  if (intent === "high") return { bg: "rgba(110, 231, 183, 0.15)", fg: "#6EE7B7" };
  if (intent === "medium") return { bg: "rgba(242, 168, 59, 0.15)", fg: "var(--accent)" };
  if (intent === "low") return { bg: "rgba(255,255,255,.06)", fg: "var(--text-dim)" };
  return null;
}

const ANALYZE_COST = CREDIT_COSTS.thread_analysis;

export default function NewDraftPage() {
  return (
    <Suspense fallback={null}>
      <NewDraftForm />
    </Suspense>
  );
}

function NewDraftForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [type, setType] = useState("comment");
  const [subreddit, setSubreddit] = useState(searchParams.get("subreddit") || "");
  const [threadUrl, setThreadUrl] = useState("");
  const [threadContext, setThreadContext] = useState(searchParams.get("context") || "");
  const [tone, setTone] = useState("Helpful");
  const [length, setLength] = useState("medium");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [analysis, setAnalysis] = useState(null);

  async function analyzeUrl() {
    setAnalyzeError("");
    setAnalyzing(true);
    try {
      const res = await fetch("/api/drafts/analyze-thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: threadUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not analyze this thread.");
      setAnalysis(data.analysis);
      if (data.sub && !subreddit.trim()) setSubreddit(data.sub);
      // Auto-fills the existing context field — transparent and still
      // editable, not a hidden hand-off — so what's fed to the draft
      // generator below is exactly what's visible here.
      const synthesized = [data.analysis?.summary, data.analysis?.responseAngle].filter(Boolean).join(" ");
      if (synthesized) setThreadContext(synthesized.slice(0, 400));
    } catch (e) {
      setAnalyzeError(e?.message || "Something went wrong.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function generate() {
    setError("");
    setGenerating(true);
    try {
      const res = await fetch("/api/drafts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          subreddit,
          threadContext,
          tone: tone.toLowerCase(),
          length,
          existingText: body,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not generate content.");
      if (data.title) setTitle(data.title);
      setBody(data.body || "");
    } catch (e) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setGenerating(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    if (!subreddit.trim() || !body.trim()) {
      setError("Subreddit and content are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subreddit: subreddit.startsWith("r/") ? subreddit : `r/${subreddit}`,
          title: type === "post" ? title : title || threadContext,
          body,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not save draft.");
      router.push("/dashboard/drafts");
      router.refresh();
    } catch (e) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  const intent = intentColor(analysis?.buyingIntent);

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <span className="section-tag">( draft studio )</span>
        <h2>Compose a Reddit draft</h2>
        <p className="section-sub">
          AI-assisted drafting to help you write, nothing here posts for
          you — copy the result and publish it yourself from your own
          account.
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setType(t.key)}
              className={type === t.key ? "btn btn-primary" : "btn btn-ghost"}
              style={{ fontSize: 13.5, padding: "8px 14px" }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={save} className="card" style={{ padding: 24 }}>
          <label className="auth-field">
            <span>Subreddit</span>
            <input
              type="text"
              placeholder="r/SaaS"
              value={subreddit}
              onChange={(e) => setSubreddit(e.target.value)}
              required
            />
          </label>

          {type === "post" ? (
            <label className="auth-field">
              <span>Post title</span>
              <input
                type="text"
                placeholder="A title for your post"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
          ) : (
            <>
              <label className="auth-field">
                <span>Reddit thread URL</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    placeholder="https://reddit.com/r/.../comments/..."
                    value={threadUrl}
                    onChange={(e) => setThreadUrl(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={analyzeUrl}
                    className="btn btn-ghost btn-sm"
                    disabled={analyzing || !threadUrl.trim()}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {analyzing ? (
                      <>
                        <span className="loader" /> Analyzing…
                      </>
                    ) : (
                      `Analyze thread (${ANALYZE_COST} credits)`
                    )}
                  </button>
                </div>
              </label>

              {analyzeError && (
                <p role="alert" style={{ color: "#ff8a8a", fontSize: 13.5, marginBottom: 14 }}>
                  {analyzeError}
                </p>
              )}

              {analysis && (
                <div
                  className="card"
                  style={{ background: "var(--bg-3)", padding: 18, marginBottom: 18, display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={labelStyle}>AI thread analysis</div>
                    {intent && (
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: "3px 9px",
                          borderRadius: 999,
                          background: intent.bg,
                          color: intent.fg,
                          textTransform: "capitalize",
                        }}
                      >
                        {analysis.buyingIntent} buying intent
                      </span>
                    )}
                  </div>
                  <div>
                    <div style={labelStyle}>Summary</div>
                    <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.55, margin: 0 }}>{analysis.summary}</p>
                  </div>
                  {analysis.painPoints?.length > 0 && (
                    <div>
                      <div style={labelStyle}>Pain points</div>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6 }}>
                        {analysis.painPoints.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.responseAngle && (
                    <div>
                      <div style={labelStyle}>Recommended strategy</div>
                      <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.55, margin: 0 }}>{analysis.responseAngle}</p>
                    </div>
                  )}
                </div>
              )}

              <label className="auth-field">
                <span>What's the thread/comment about?</span>
                <input
                  type="text"
                  placeholder="e.g. someone asking for a tool recommendation for X"
                  value={threadContext}
                  onChange={(e) => setThreadContext(e.target.value)}
                />
              </label>
            </>
          )}

          <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
            <label className="auth-field" style={{ flex: "1 1 160px", marginBottom: 0 }}>
              <span>Tone</span>
              <select value={tone} onChange={(e) => setTone(e.target.value)} style={selectStyle}>
                {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className="auth-field" style={{ flex: "1 1 160px", marginBottom: 0 }}>
              <span>Length</span>
              <select value={length} onChange={(e) => setLength(e.target.value)} style={selectStyle}>
                {LENGTHS.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={generate}
            className="btn btn-secondary"
            disabled={generating || !subreddit.trim()}
            style={{ marginBottom: 14 }}
          >
            {generating ? "Generating…" : body ? "Improve with AI ✨" : "Generate with AI ✨"}
          </button>

          <label className="auth-field">
            <span>Content</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, 2000))}
              rows={8}
              placeholder="Write it yourself, or generate a starting point above"
              style={{
                background: "var(--bg-3)",
                border: "1px solid var(--card-border)",
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 15,
                color: "var(--text)",
                fontFamily: "inherit",
                width: "100%",
                resize: "vertical",
              }}
            />
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{body.length}/2000 characters</span>
          </label>

          {error && (
            <p role="alert" style={{ color: "#ff8a8a", marginBottom: 12, fontSize: 14 }}>
              {error}
            </p>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={() => router.push("/dashboard/drafts")}>
              ← Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save draft →"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
