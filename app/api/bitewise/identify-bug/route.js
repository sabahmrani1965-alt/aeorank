import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { guard } from "@/lib/bitewiseGuard";

export const runtime = "nodejs";
export const maxDuration = 30;

// BiteWise's insect reader: a photo of the creature itself, not the mark it
// left. Same deployment and guard as identify-bite.
//
// The dangerous failure here is the mirror of the bite reader's: calling a
// brown recluse "a house spider" or a hornet "a hoverfly". So the model must
// name the dangerous look-alikes, and when it cannot tell a harmless species
// from a dangerous one, it grades as the dangerous one.

const MAX_BASE64_LENGTH = 4 * 1024 * 1024;

// Ordered least to most concerning. The app renders from these strings.
const DANGER = ["harmless", "nuisance", "caution", "dangerous"];

const SYSTEM = `You identify insects, spiders, ticks and other small creatures from a photograph, for someone who has found one and wants to know whether to worry. You are not an entomologist and you say so when unsure.

Reply ONLY with JSON:
{
  "looks_like_bug": boolean,
  "name": string,
  "scientific_name": string,
  "certainty": "confident" | "likely" | "unsure",
  "what_it_is": string,
  "bites_or_stings": "bites" | "stings" | "both" | "neither",
  "danger": "harmless" | "nuisance" | "caution" | "dangerous",
  "danger_reason": string,
  "key_features": string[],
  "look_alikes": [{ "name": string, "how_to_tell": string, "danger": "harmless" | "nuisance" | "caution" | "dangerous" }],
  "if_bitten": string[],
  "what_to_do_now": string[],
  "uncertainty": string
}

Rules that matter more than being helpful:

1. "key_features" lists 2 to 4 things visible in THIS photo that point to the identification. Never invent detail you cannot see.
2. Grade "danger" for an ordinary healthy adult:
   - harmless: no meaningful bite or sting, for example a ladybird or a moth.
   - nuisance: bites or stings that hurt or itch but are not medically significant, for example a mosquito or a common garden spider.
   - caution: can cause a real reaction or carries disease, for example a bee, wasp, tick, or fire ant.
   - dangerous: venom or disease that can need medical care, for example a black widow, brown recluse, or a scorpion.
3. If the photo could be a harmless species or a dangerous look-alike and you cannot tell which, grade "danger" as the more dangerous one and set "certainty" to "unsure". Never talk someone out of caution you cannot justify.
4. "look_alikes" names 1 to 3 species it is commonly confused with, and ALWAYS includes any dangerous look-alike, with a plain "how_to_tell".
5. "if_bitten" is 2 to 4 plain first steps if this creature bites or stings someone, including when to get medical help. Never name a prescription drug or a dose. Empty if it neither bites nor stings.
6. "what_to_do_now" is 2 to 3 safe steps for the person looking at it now, for example do not handle it, or how to remove a tick.
7. "uncertainty" is one honest sentence about what a photo cannot show, in warm plain language.
8. If the image is not an insect, spider, tick, or similar creature, return { "looks_like_bug": false } and nothing else.
9. Plain words. No jargon beyond the scientific name, no em dashes, never a number you cannot support.`;

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
  const allergy = ["severe", "sometimes", "none"].includes(body?.allergy) ? body.allergy : null;

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
            { type: "text", text: "What is this creature, and should I worry?" },
          ],
        },
      ],
    });

    const raw = msg?.content?.[0]?.text?.trim() || "";
    const match = raw.match(/\{[\s\S]*\}/);
    let parsed;
    try {
      parsed = match ? JSON.parse(match[0]) : null;
    } catch {
      parsed = null;
    }
    if (!parsed) {
      return NextResponse.json({ error: "Couldn't read that photo, try a clearer one." }, { status: 502, headers: CORS });
    }

    if (parsed.looks_like_bug === false) {
      return NextResponse.json(
        { error: "That doesn't look like an insect or spider. Try a close, sharp photo of the creature." },
        { status: 422, headers: CORS }
      );
    }

    const deDash = (v) =>
      typeof v === "string"
        ? v.replace(/\s*[—–]\s*/g, ", ")
        : Array.isArray(v)
          ? v.map(deDash)
          : v && typeof v === "object"
            ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deDash(x)]))
            : v;
    parsed = deDash(parsed);

    // An unrecognised grade becomes "caution", never "harmless".
    if (!DANGER.includes(parsed.danger)) parsed.danger = "caution";

    // Rule 3 enforced rather than trusted: if the model is unsure and any
    // look-alike it named is more dangerous than its own grade, take that.
    const rank = (d) => (DANGER.includes(d) ? DANGER.indexOf(d) : 2);
    if (parsed.certainty === "unsure" && Array.isArray(parsed.look_alikes)) {
      const worst = parsed.look_alikes.reduce((m, l) => Math.max(m, rank(l?.danger)), rank(parsed.danger));
      if (worst > rank(parsed.danger)) {
        parsed.danger = DANGER[worst];
        parsed.danger_reason = `It could be ${parsed.look_alikes.find((l) => rank(l?.danger) === worst)?.name || "a more dangerous look-alike"}, and a photo cannot rule that out, so treat it with that level of care.`;
      }
    }

    // Someone with a severe sting allergy: anything that stings is dangerous
    // for them specifically, whatever it is for everyone else.
    if (allergy === "severe" && (parsed.bites_or_stings === "stings" || parsed.bites_or_stings === "both")) {
      if (rank(parsed.danger) < rank("dangerous")) {
        parsed.danger = "dangerous";
        parsed.danger_reason =
          "This can sting, and you told us you can react severely. Keep your distance, and if you are stung and feel a reaction starting, use your EpiPen and call emergency services.";
      }
    }

    return NextResponse.json({ result: parsed }, { headers: CORS });
  } catch (e) {
    console.error("[bitewise/identify-bug] failed:", e?.message || e);
    return NextResponse.json({ error: "Couldn't read that photo, try a clearer one." }, { status: 502, headers: CORS });
  }
}
