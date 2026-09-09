import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { guard } from "@/lib/bitewiseGuard";

export const runtime = "nodejs";
export const maxDuration = 30;

// BiteWise's bite reader. Hosted here because this deployment already
// holds ANTHROPIC_API_KEY, the same arrangement as /api/firstrep.
//
// The whole safety design of the product lives in this prompt. A photo of
// a mark on skin cannot be diagnosed, and the dangerous failure is not
// looking foolish, it is a false negative: calling a brown recluse, an
// early Lyme rash, or a developing allergic reaction "probably a
// mosquito". So the model is asked to rank possibilities rather than
// pick one, to grade urgency on what it can actually see, and never to
// tell anyone a mark is harmless.

const MAX_BASE64_LENGTH = 4 * 1024 * 1024;

// Ordered least to most urgent. The app renders colour and copy from
// this, so the strings are part of the contract, not free text.
const URGENCY = ["routine", "watch", "same_day", "emergency"];

const SYSTEM = `You look at photographs of marks on human skin and help someone decide what to do next. You are not a doctor and you never diagnose.

Reply ONLY with JSON:
{
  "looks_like_skin": boolean,
  "headline": string,
  "candidates": [{ "name": string, "signals": string, "likelihood": "most likely" | "possible" | "less likely" }],
  "urgency": "routine" | "watch" | "same_day" | "emergency",
  "urgency_reason": string,
  "red_flags": string[],
  "care_now": string[],
  "avoid": string[],
  "timeline": string,
  "uncertainty": string
}

LOOK FOR THESE SHAPES FIRST, before you name anything. They are easy to miss and each one changes the answer:

A RING OR TARGET. A red border with paler or more normal skin inside it, or a bullseye of alternating rings, or a red patch with a darker centre and a clearer zone between. Rings are often faint, incomplete, or oval, and can be large, a hand's width or more. If you see any ring, partial ring, or central clearing, then erythema migrans, the early Lyme rash, MUST be your first candidate, urgency MUST be at least "same_day", and you MUST NOT describe the rash as uniform, diffuse, or evenly coloured. Early Lyme is easy to treat and serious if missed, so a ring is worth acting on even when you are unsure.

A DARKENING OR SINKING CENTRE. A centre going dusky, blue, black, or breaking down. Treat as "emergency".

REDNESS SPREADING FROM A POINT. Warmth and redness expanding outwards, or streaks running away from the mark. Treat as at least "same_day".

If none of these are present, say so plainly in "signals" and continue.

Rules that matter more than being helpful:

1. Never say a mark is harmless, fine, nothing to worry about, or definitely any one thing. Rank two or three candidates with "likelihood" instead. A photo cannot rule anything out.
2. "signals" says what in THIS photo points at that candidate, for example "central puncture with a pale ring". Never invent detail you cannot see.
3. Grade "urgency" on what is visible plus what the candidate could become:
   - emergency: signs of a spreading or systemic reaction, extensive swelling, streaking away from the site, a darkening or necrotic centre, or anything suggesting a severe allergic reaction. Say to seek urgent care now.
   - same_day: an expanding ring or bullseye pattern, growing warmth and redness, pus, a bite near the eye or mouth, or a mark that has clearly worsened.
   - watch: typical of a common bite but worth checking over the next days.
   - routine: settled, healing, no concerning features.
   When torn between two levels, choose the more urgent one.
4. "red_flags" is always 3 to 5 specific things that mean stop using the app and get medical help, written plainly: trouble breathing or swallowing, swelling of the face or throat, a spreading red ring, fever, red streaks, a wound turning black. Include them even when the photo looks calm, because they describe what could happen next.
5. "care_now" is 3 to 4 safe, ordinary steps: wash with soap and water, cold compress, do not scratch, keep it covered. Never name a prescription drug or a dose.
6. "avoid" is 2 to 3 common mistakes, for example squeezing it, or covering it in household remedies.
7. "timeline" is one sentence on what ordinary healing looks like and by when it should be improving.
8. "uncertainty" is one honest sentence about what a photo cannot tell, in warm plain language.
9. If the image is not human skin, return { "looks_like_skin": false } and nothing else.
10. Plain words a worried person can read. No jargon, no em dashes, never a number you cannot support.`;

const CORS = {
  "Access-Control-Allow-Origin": "null",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-bitewise-key",
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
    return NextResponse.json({ error: "Photo too large." }, { status: 413, headers: CORS });
  }

  // Optional context the app collects, which changes the reading a lot.
  const where = typeof body?.where === "string" ? body.where.slice(0, 60) : "";
  const age = typeof body?.ageHours === "number" ? body.ageHours : null;
  const symptoms = Array.isArray(body?.symptoms)
    ? body.symptoms.filter((s) => typeof s === "string").slice(0, 8).join(", ")
    : "";

  const context = [
    where && `Where on the body: ${where}.`,
    age !== null && `First noticed about ${age} hours ago.`,
    symptoms && `They also report: ${symptoms}.`,
  ]
    .filter(Boolean)
    .join(" ");

  try {
    const client = new Anthropic({ apiKey: key });
    const msg = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1200,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
            { type: "text", text: context ? `${context} What could this be?` : "What could this be?" },
          ],
        },
      ],
    });

    const raw = msg?.content?.[0]?.text?.trim() || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({ error: "Couldn't read that photo, try a clearer one." }, { status: 502, headers: CORS });
    }

    let parsed;
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      return NextResponse.json({ error: "Couldn't read that photo, try a clearer one." }, { status: 502, headers: CORS });
    }

    if (parsed.looks_like_skin === false) {
      return NextResponse.json(
        { error: "That doesn't look like skin. Try a close, well lit photo of the mark itself." },
        { status: 422, headers: CORS }
      );
    }

    // The prompt forbids em dashes and the model still emits them, so
    // strip them rather than ask twice. Walks every string in the reply.
    const deDash = (v) =>
      typeof v === "string"
        ? v.replace(/\s*[\u2014\u2013]\s*/g, ", ")
        : Array.isArray(v)
          ? v.map(deDash)
          : v && typeof v === "object"
            ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deDash(x)]))
            : v;
    parsed = deDash(parsed);

    // Never let a malformed reply read as reassurance. An unrecognised
    // urgency becomes "watch" rather than "routine", and a reply with no
    // red flags gets the universal ones, because those two fields are
    // what a worried person acts on.
    if (!URGENCY.includes(parsed.urgency)) parsed.urgency = "watch";
    if (!Array.isArray(parsed.red_flags) || parsed.red_flags.length === 0) {
      parsed.red_flags = [
        "Trouble breathing, swallowing, or swelling of the face or throat",
        "Redness spreading outwards, or red streaks running from the mark",
        "Fever, chills, or feeling generally unwell",
        "The centre darkening, blistering, or turning black",
      ];
    }

    return NextResponse.json({ result: parsed }, { headers: CORS });
  } catch (e) {
    console.error("[bitewise/identify] failed:", e?.message || e);
    return NextResponse.json({ error: "Couldn't read that photo, try a clearer one." }, { status: 502, headers: CORS });
  }
}
