import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { guard } from "@/lib/easyrepGuard";

export const runtime = "nodejs";
export const maxDuration = 30;

// FirstRep's machine recognizer. Hosted here because this deployment
// already holds ANTHROPIC_API_KEY (same arrangement as /api/snapcal) —
// a spec-compliant Supabase Edge Function twin lives in the FirstRep
// repo for when that app gets its own Supabase project.

const MAX_BASE64_LENGTH = 4 * 1024 * 1024;

const SYSTEM = `You identify gym equipment for nervous beginners. Reply ONLY with JSON: { machine_name, muscles_simple (plain words like 'front of thighs'), setup_steps (array, max 4, how to adjust seat/pins/handles), movement_steps (array, exactly 3), common_mistakes (array, exactly 3, each one sentence), reassurance (one warm sentence), confidence (0-1) }. If it is not gym equipment, return { machine_name: null }. Never use jargon like 'hypertrophy', 'eccentric', 'RPE'. Never use em dashes.`;

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

  const image = typeof body?.imageBase64 === "string" ? body.imageBase64 : "";
  const mediaType = body?.mediaType === "image/png" ? "image/png" : "image/jpeg";
  if (!image) return NextResponse.json({ error: "Send { imageBase64 }." }, { status: 400, headers: CORS });
  if (image.length > MAX_BASE64_LENGTH) {
    return NextResponse.json({ error: "Image too large." }, { status: 413, headers: CORS });
  }

  try {
    const client = new Anthropic({ apiKey: key });
    const msg = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 600,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
            { type: "text", text: "What machine is this?" },
          ],
        },
      ],
    });

    const raw = msg?.content?.[0]?.text?.trim() || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: "Couldn't read that, try a clearer photo." }, { status: 502, headers: CORS });

    let parsed;
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      return NextResponse.json({ error: "Couldn't read that, try a clearer photo." }, { status: 502, headers: CORS });
    }

    if (!parsed.machine_name) {
      return NextResponse.json(
        { error: "That doesn't look like gym equipment. Try a clearer photo of the machine." },
        { status: 422, headers: CORS }
      );
    }

    return NextResponse.json({ result: parsed }, { headers: CORS });
  } catch (e) {
    console.error("[firstrep/scan] failed:", e?.message || e);
    return NextResponse.json({ error: "Couldn't read that, try a clearer photo." }, { status: 502, headers: CORS });
  }
}
