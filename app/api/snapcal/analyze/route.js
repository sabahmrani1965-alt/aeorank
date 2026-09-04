import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 30;

// SnapCal's food-photo analysis endpoint. Lives inside the AEOrank
// project purely because this deployment already holds ANTHROPIC_API_KEY
// (Vercel secrets can't be copied between projects) — the SnapCal mobile
// app calls it directly. Standalone twin: ~/Downloads/snapcal-api, ready
// to take over on its own domain once it gets its own key.

// ~4MB of base64 ≈ 3MB image — the app resizes to 1024px/70% JPEG before
// upload, so anything bigger than this is malformed input.
const MAX_BASE64_LENGTH = 4 * 1024 * 1024;

const SYSTEM = `You estimate nutrition from a single food photo for a calorie-tracking app.

Rules — return ONLY a JSON object, nothing else:
{
  "is_food": boolean,        // false if the photo clearly isn't food or drink
  "name": string,            // short dish name, e.g. "Chicken shawarma wrap"
  "calories": number,        // total kcal estimate for the visible portion
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "notes": string            // 1 short sentence: what drives the estimate or its biggest uncertainty
}

- Estimate the VISIBLE portion only. Never invent items you can't see.
- Round calories to the nearest 10, macros to whole grams.
- If it isn't food, set is_food false and leave the numbers 0.
- Be realistic, not flattering — restaurant portions are usually larger and oilier than home cooking.`;

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

  const image = typeof body?.image === "string" ? body.image : "";
  if (!image) return NextResponse.json({ error: "Send { image: <base64 jpeg> }." }, { status: 400, headers: CORS });
  if (image.length > MAX_BASE64_LENGTH) {
    return NextResponse.json({ error: "Image too large." }, { status: 413, headers: CORS });
  }

  try {
    const client = new Anthropic({ apiKey: key });
    const msg = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: image } },
            { type: "text", text: "Estimate this meal." },
          ],
        },
      ],
    });

    const raw = msg?.content?.[0]?.text?.trim() || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: "Could not analyze this photo. Try again." }, { status: 502, headers: CORS });

    let parsed;
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      return NextResponse.json({ error: "Could not analyze this photo. Try again." }, { status: 502, headers: CORS });
    }

    if (!parsed.is_food) {
      return NextResponse.json(
        { error: "That doesn't look like food — try a clearer photo of your meal." },
        { status: 422, headers: CORS }
      );
    }

    const num = (v) => (Number.isFinite(Number(v)) ? Math.max(0, Math.round(Number(v))) : null);
    return NextResponse.json(
      {
        result: {
          name: String(parsed.name || "Meal").slice(0, 80),
          calories: num(parsed.calories),
          protein_g: num(parsed.protein_g),
          carbs_g: num(parsed.carbs_g),
          fat_g: num(parsed.fat_g),
          notes: String(parsed.notes || "").slice(0, 200),
        },
      },
      { headers: CORS }
    );
  } catch (e) {
    console.error("[snapcal/analyze] failed:", e?.message || e);
    return NextResponse.json({ error: "Could not analyze this photo. Try again." }, { status: 502, headers: CORS });
  }
}
