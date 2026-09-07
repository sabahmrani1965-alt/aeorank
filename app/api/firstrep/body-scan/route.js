import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 30;

// EasyRep's body scan. A visual estimate from one photo is inherently
// rough, so the contract forces a RANGE plus an honesty note; the app
// renders it as an approximation, never as a measurement. Same hosting
// arrangement as the other /api/firstrep routes.

const MAX_BASE64_LENGTH = 4 * 1024 * 1024;

const SYSTEM = `You give kind, rough visual fitness estimates from a single full-body photo, for a beginner gym app. Reply ONLY with JSON: { body_fat_range (a range like "22-27%", never a single number), build (2-4 plain words, e.g. "average build, some muscle"), strengths (array, exactly 2 short sentences, genuinely visible positives), focus (one short sentence, the single most useful training focus), reassurance (one warm sentence), confidence (0-1) }. Rules: a photo estimate is approximate, keep ranges at least 4 points wide and lower confidence for baggy clothes or partial bodies. Be kind and never judgmental; never mention weight loss unless the photo cannot be assessed. Never use medical language, never use jargon, never use em dashes. If the image is not a person or the body is mostly not visible, return { body_fat_range: null }.`;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req) {
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
      max_tokens: 500,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
            { type: "text", text: "Give a rough visual estimate for this person." },
          ],
        },
      ],
    });
    const raw = msg?.content?.[0]?.text?.trim() || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: "Couldn't read that photo, try again in better light." }, { status: 502, headers: CORS });

    let parsed;
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      return NextResponse.json({ error: "Couldn't read that photo, try again in better light." }, { status: 502, headers: CORS });
    }

    if (!parsed.body_fat_range) {
      return NextResponse.json(
        { error: "Couldn't see a full body in that photo. Try a full-length shot, front-on." },
        { status: 422, headers: CORS }
      );
    }

    return NextResponse.json({ result: parsed }, { headers: CORS });
  } catch (e) {
    console.error("[firstrep/body-scan] failed:", e?.message || e);
    return NextResponse.json({ error: "Couldn't read that photo, try again in better light." }, { status: 502, headers: CORS });
  }
}
