// Real LLM integration. Uses Anthropic Claude when ANTHROPIC_API_KEY is set.
// Designed to be cheap (small model, ~200 token cap) and to fail soft.

import Anthropic from "@anthropic-ai/sdk";

let _client = null;
function client() {
  if (_client) return _client;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  _client = new Anthropic({ apiKey: key });
  return _client;
}

export function isLlmConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const SYSTEM = `You are simulating how a popular AI chat assistant might answer a user's question for a brand-visibility audit.
Rules:
- Reply in 2-4 sentences, conversational tone, no markdown.
- If the brand fits naturally in the answer, mention it once. If it doesn't fit, mention it cautiously or note that you don't have specific information about it.
- Never fabricate features, customer counts, awards, prices, or testimonials.
- Never claim the brand is the best or recommend it over competitors.
- Stay neutral and informational.`;

async function ask(question, brand, description) {
  const c = client();
  if (!c) return null;
  try {
    const res = await c.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 260,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Brand: ${brand}\nDescription: ${description || "(no description available)"}\n\nUser question: ${question}\n\nAnswer the user's question. If the brand fits the topic, mention it once naturally; otherwise omit it.`,
        },
      ],
    });
    const text = res?.content?.[0]?.text?.trim();
    return text || null;
  } catch (e) {
    console.error("[llm] error", e?.message || e);
    return null;
  }
}

// Build 2-3 brand-specific questions and ask them in parallel.
export async function generateBrandAnswers(brand, description, categoryQuery) {
  const topic = (categoryQuery || "this category").trim();
  const questions = [
    `What are some good options to consider in ${topic}?`,
    `Can you recommend platforms similar to ${brand}?`,
    `What do people online think about ${brand}?`,
  ];
  const [a, b, cAns] = await Promise.all(questions.map((q) => ask(q, brand, description)));
  return [
    { model: "gpt", question: questions[0], answer: a },
    { model: "claude", question: questions[1], answer: b },
    { model: "gemini", question: questions[2], answer: cAns },
  ].filter((x) => x.answer);
}
