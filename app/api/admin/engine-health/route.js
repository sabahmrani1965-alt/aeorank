import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 150;

// Engine health check: one tiny call per AI engine, reporting status and
// the provider's own error message, never the keys. Guarded by a token
// whose SHA-256 is below (the repo is public, so only the hash lives here).
const TOKEN_SHA256 = "be07aec3d79993b11f68ee8725d57d88182d454ef90fc9eac8b8cb9fda53f250";

function authorized(req) {
  const t = new URL(req.url).searchParams.get("token") || "";
  const a = Buffer.from(createHash("sha256").update(t).digest("hex"));
  const b = Buffer.from(TOKEN_SHA256);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function timed(fn) {
  const start = Date.now();
  try {
    return { ...(await fn()), ms: Date.now() - start };
  } catch (e) {
    return { ok: false, error: String(e?.message || e).slice(0, 300), ms: Date.now() - start };
  }
}

export async function GET(req) {
  if (!authorized(req)) return NextResponse.json({ error: "not found" }, { status: 404 });
  const out = {};

  out.claude = process.env.ANTHROPIC_API_KEY
    ? await timed(async () => {
        const c = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const r = await c.messages.create({ model: "claude-haiku-4-5", max_tokens: 10, messages: [{ role: "user", content: "Reply with: ok" }] });
        return { ok: true, sample: r?.content?.[0]?.text?.slice(0, 20) };
      })
    : { ok: false, error: "ANTHROPIC_API_KEY not set" };

  for (const engine of ["gemini", "chatgpt", "perplexity"]) {
    out[engine] = process.env.CLORO_API_KEY
      ? await timed(async () => {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), 45000);
          try {
            const res = await fetch(`https://api.cloro.dev/v1/monitor/${engine}`, {
              method: "POST",
              headers: { Authorization: `Bearer ${process.env.CLORO_API_KEY}`, "Content-Type": "application/json" },
              body: JSON.stringify({ prompt: "What is the capital of France? One word.", country: "US", ...(engine === "chatgpt" ? { disableWebSearch: true } : {}) }),
              signal: ctrl.signal,
            });
            const text = await res.text();
            return { ok: res.ok, status: res.status, body: text.slice(0, 300) };
          } finally {
            clearTimeout(t);
          }
        })
      : { ok: false, error: "CLORO_API_KEY not set" };
  }
  return NextResponse.json(out);
}
