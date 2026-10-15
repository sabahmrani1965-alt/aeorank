"use client";

import { useMemo, useState } from "react";

const SUPERLATIVES = ["best", "amazing", "incredible", "game changer", "game-changer", "revolutionary", "world-class", "industry-leading", "seamless", "perfect", "#1", "number one", "unbeatable", "must-have"];
const SALES = ["sign up", "free trial", "discount", "coupon", "promo code", "% off", "limited time", "dm me", "check it out", "check out", "link in bio", "use my code", "book a demo"];
const DISCLOSURE = [/\bi work (at|for|on)\b/i, /\bi('m| am) (the )?(founder|co-?founder|ceo|cto|maker|creator|developer|dev)\b/i, /\b(full )?disclosure\b/i, /\bi built\b/i, /\bwe built\b/i, /\bour (product|app|tool|company|team)\b/i, /\baffiliated\b/i, /\bi made\b/i, /\bmy (product|app|tool|company|startup)\b/i];

export function checkPromotion(text, brand) {
  const body = text.trim();
  const b = brand.trim().toLowerCase();
  const lower = body.toLowerCase();
  const checks = [];
  const add = (level, label, detail) => checks.push({ level, label, detail });
  if (!body) return { checks, score: 0 };

  const sentences = body.split(/(?<=[.!?])\s+/).filter(Boolean);
  const words = body.split(/\s+/).filter(Boolean).length;
  const brandCount = b ? lower.split(b).length - 1 : 0;

  const discloses = DISCLOSURE.some((r) => r.test(body));
  if (b && brandCount > 0 && !discloses) add("bad", "No disclosure", `You mention ${brand} without saying you're connected to it. Reddit's rules and most subreddits require you to say so, for example "I work on ${brand}".`);
  else if (discloses) add("good", "Discloses the connection", "Readers and moderators can see who is speaking.");

  const first = sentences[0] || "";
  if (b && first.toLowerCase().includes(b) && !DISCLOSURE.some((r) => r.test(first))) add("warn", "Opens with the brand", "Comments that lead with a product name read as ads. Answer the question first, then mention it.");
  if (b && brandCount > 2) add("warn", "Brand mentioned many times", `${brandCount} mentions. Once is usually enough.`);
  if (b && brandCount === 0) add("good", "No brand mention", "Purely helpful comments carry no promotion risk.");

  const links = (body.match(/https?:\/\/\S+|www\.\S+/gi) || []).length;
  if (links > 1) add("bad", "Several links", `${links} links. Multiple links are a common spam-filter trigger.`);
  else if (links === 1) add("warn", "Contains a link", "Some subreddits remove any link from accounts without history. Check the rules.");

  const sup = SUPERLATIVES.filter((w) => new RegExp(`\\b${w.replace(/[#-]/g, "\\$&")}\\b`, "i").test(body));
  if (sup.length >= 2) add("warn", "Marketing language", `"${sup.join('", "')}". Specific, first-hand detail is more believable and more likely to be quoted by AI assistants.`);

  const sales = SALES.filter((w) => lower.includes(w));
  if (sales.length) add("bad", "Sales calls to action", `"${sales.join('", "')}". These are what moderators remove first.`);

  if (words < 25) add("warn", "Very short", "Short product mentions add little. Explain how you'd solve the problem, with specifics.");
  else if (words >= 60) add("good", "Substantial answer", `${words} words of actual content.`);

  const noUrls = body.replace(/https?:\/\/\S+|www\.\S+/gi, "");
  if (/\d/.test(noUrls) || /\b(i|we) (tried|tested|used|switched|found)\b/i.test(noUrls)) add("good", "Specific or first-hand", "Numbers and first-hand experience are what make a comment useful, and what AI assistants quote.");

  const bad = checks.filter((c) => c.level === "bad").length;
  const warn = checks.filter((c) => c.level === "warn").length;
  return { checks, score: Math.max(0, 100 - bad * 30 - warn * 10) };
}

const SAMPLE = `We hit the same problem moving off spreadsheets last year. The thing that mattered most was whether the tool could import our existing 40k rows without manual cleanup; two of the three we tried choked above 50k.

Full disclosure, I work on Acme, so take this with a grain of salt: it handled the import, but its reporting is weaker than the others. If reporting matters more to you, I'd look elsewhere.`;

export default function PromoChecker() {
  const [brand, setBrand] = useState("Acme");
  const [text, setText] = useState(SAMPLE);
  const { checks, score } = useMemo(() => checkPromotion(text, brand), [text, brand]);

  return (
    <div className="card">
      <label htmlFor="brand-in" className="tool-label">Your product or brand name (optional)</label>
      <input id="brand-in" className="input" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Acme" />
      <label htmlFor="promo-in" className="tool-label" style={{ marginTop: 14 }}>Your comment or post</label>
      <textarea id="promo-in" className="input tool-textarea" rows={9} value={text} onChange={(e) => setText(e.target.value)} />
      {text.trim() ? (
        <>
          <div className="tool-score" aria-live="polite">
            <span className={score >= 80 ? "s-good" : score >= 50 ? "s-warn" : "s-bad"}>{score}</span>
            <span>/ 100</span>
          </div>
          <ul className="tool-checks">
            {checks.map((c) => (
              <li key={c.label} className={`chk-${c.level}`}>
                <strong>{c.label}</strong>
                <span>{c.detail}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
