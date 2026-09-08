import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { guard } from "@/lib/easyrepGuard";

export const runtime = "nodejs";
export const maxDuration = 60;

// FirstRep's form check: 6 video frames in, kind structured review out.
// Frames are analyzed and never stored anywhere server-side — the app's
// privacy promise depends on this route staying stateless.

const MAX_FRAME_LENGTH = 1.5 * 1024 * 1024; // base64 per frame, 768px frames are ~100-300KB
const LIFTS = new Set(["squat", "deadlift", "bench", "dumbbell row", "overhead press", "lunge"]);

const CORS = {
  "Access-Control-Allow-Origin": "null",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-easyrep-key",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

function buildSystem(lift) {
  return `You are a kind coach reviewing a beginner's ${lift.toUpperCase()} from a few video frames. You cannot see everything, so only comment on what is clearly visible. Reply ONLY with JSON: { did_well (one specific positive sentence, required), corrections (array, max 3, each: { issue, fix, why_it_matters }, all in plain language a first-timer understands), drill (one simple thing to practice next session), safety_flag (true only if something looks genuinely risky) }. Never call the person weak, wrong, or bad. Never use jargon. Never use em dashes.`;
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

  const lift = String(body?.lift || "").toLowerCase();
  if (!LIFTS.has(lift)) {
    return NextResponse.json({ error: "Unknown lift." }, { status: 400, headers: CORS });
  }
  const frames = Array.isArray(body?.framesBase64) ? body.framesBase64.filter((f) => typeof f === "string") : [];
  if (frames.length < 2 || frames.length > 8) {
    return NextResponse.json({ error: "Send 2 to 8 frames." }, { status: 400, headers: CORS });
  }
  if (frames.some((f) => f.length > MAX_FRAME_LENGTH)) {
    return NextResponse.json({ error: "Frames too large." }, { status: 413, headers: CORS });
  }

  try {
    const client = new Anthropic({ apiKey: key });
    const msg = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 700,
      system: buildSystem(lift),
      messages: [
        {
          role: "user",
          content: [
            ...frames.map((data) => ({
              type: "image",
              source: { type: "base64", media_type: "image/jpeg", data },
            })),
            { type: "text", text: `These frames are evenly spaced through one set of ${lift}. Review the form.` },
          ],
        },
      ],
    });

    const raw = msg?.content?.[0]?.text?.trim() || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: "Couldn't read the video, try again with better light." }, { status: 502, headers: CORS });

    let parsed;
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      return NextResponse.json({ error: "Couldn't read the video, try again with better light." }, { status: 502, headers: CORS });
    }
    if (!parsed.did_well) {
      return NextResponse.json({ error: "Couldn't see the lift clearly, try filming from the side." }, { status: 422, headers: CORS });
    }

    return NextResponse.json(
      {
        result: {
          did_well: String(parsed.did_well).slice(0, 300),
          corrections: (Array.isArray(parsed.corrections) ? parsed.corrections : [])
            .slice(0, 3)
            .map((c) => ({
              issue: String(c?.issue || "").slice(0, 200),
              fix: String(c?.fix || "").slice(0, 300),
              why_it_matters: String(c?.why_it_matters || "").slice(0, 300),
            })),
          drill: String(parsed.drill || "").slice(0, 300),
          safety_flag: Boolean(parsed.safety_flag),
        },
      },
      { headers: CORS }
    );
  } catch (e) {
    console.error("[firstrep/check-form] failed:", e?.message || e);
    return NextResponse.json({ error: "Couldn't read the video, try again." }, { status: 502, headers: CORS });
  }
}
