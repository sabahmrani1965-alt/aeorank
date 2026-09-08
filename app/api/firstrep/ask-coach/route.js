import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { guard } from "@/lib/easyrepGuard";

export const runtime = "nodejs";
export const maxDuration = 30;

// FirstRep's panic chat. Same hosting arrangement as scan-machine above.

const SYSTEM = `You are a calm, friendly gym buddy texting a nervous beginner who is at the gym right now. Answer in 2 to 4 short sentences. Be concrete: tell them exactly what to do next. If they describe a machine, identify it and give setup and movement in simple steps. Never lecture. Never use jargon. End with a small reassurance when it fits. Never use em dashes.`;

const CORS = {
  "Access-Control-Allow-Origin": "null",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-easyrep-key",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req) {
  const refused = guard(req, CORS);
  if (refused) return refused;

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ error: "Not configured." }, { status: 500, headers: CORS });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400, headers: CORS });
  }

  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const cleaned = messages
    .filter((m) => (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string")
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  if (cleaned.length === 0 || cleaned[cleaned.length - 1].role !== "user") {
    return NextResponse.json({ error: "Send { messages } ending with a user message." }, { status: 400, headers: CORS });
  }

  try {
    const client = new Anthropic({ apiKey: key });
    const msg = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 300,
      system: SYSTEM,
      messages: cleaned,
    });
    const reply = msg?.content?.[0]?.text?.trim();
    if (!reply) return NextResponse.json({ error: "No answer came back, try again." }, { status: 502, headers: CORS });
    return NextResponse.json({ reply }, { headers: CORS });
  } catch (e) {
    console.error("[firstrep/ask] failed:", e?.message || e);
    return NextResponse.json({ error: "Couldn't reach your coach, try again." }, { status: 502, headers: CORS });
  }
}
