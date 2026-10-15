"use client";

import { useMemo, useState } from "react";

const CLICKBAIT = ["you won't believe", "shocking", "insane", "mind-blowing", "game changer", "game-changer", "must see", "must-see", "secret", "hack", "!!!"];
const PROMO = ["check out", "introducing", "launch", "launched", "we built", "i built", "my app", "my startup", "our product", "our app", "discount", "% off", "free trial", "sign up", "promo"];

export function checkTitle(raw) {
  const title = raw.trim();
  const lower = title.toLowerCase();
  const words = title.split(/\s+/).filter(Boolean);
  const letters = title.replace(/[^A-Za-z]/g, "");
  const upper = title.replace(/[^A-Z]/g, "");
  const checks = [];
  const add = (level, label, detail) => checks.push({ level, label, detail });

  if (!title) return { checks, score: 0 };

  if (title.length > 300) add("bad", "Over Reddit's 300-character limit", `${title.length} characters; Reddit will not accept it.`);
  else if (title.length > 150) add("warn", "Long title", `${title.length} characters. It gets truncated in feeds; most well-performing titles are under about 120.`);
  else if (title.length < 15) add("warn", "Very short title", "Short titles rarely tell readers what they will get. Say what the post is about.");
  else add("good", "Length is fine", `${title.length} characters.`);

  if (letters.length > 10 && upper.length / letters.length > 0.6) add("bad", "Mostly capital letters", "All-caps titles read as shouting and are removed by many subreddits.");
  const caps = words.filter((w) => w.length > 3 && w === w.toUpperCase() && /[A-Z]/.test(w));
  if (caps.length >= 2 && upper.length / letters.length <= 0.6) add("warn", "Several words in capitals", `${caps.join(", ")}. One for emphasis is fine; more looks like an ad.`);

  const bait = CLICKBAIT.filter((p) => lower.includes(p));
  if (bait.length) add("warn", "Clickbait wording", `"${bait.join('", "')}". Many subreddits remove clickbait titles.`);

  const promo = PROMO.filter((p) => lower.includes(p));
  if (promo.length) add("warn", "Reads as promotion", `"${promo.join('", "')}". Check the subreddit's self-promotion rules before posting.`);

  if (/https?:\/\/|www\./i.test(title)) add("bad", "Link in the title", "Links in titles are almost always removed. Put the link in the body or a comment.");

  const emoji = (title.match(/\p{Extended_Pictographic}/gu) || []).length;
  if (emoji > 2) add("warn", "Lots of emoji", `${emoji} emoji. On most subreddits that reads as low effort.`);

  if (/[!?]{2,}/.test(title)) add("warn", "Repeated punctuation", "Doubled ! or ? looks like an ad.");

  if (/\?\s*$/.test(title)) add("good", "Phrased as a question", "Question titles invite answers, and question-shaped threads are what AI assistants most often cite.");
  else if (/^(how|what|why|which|is|are|does|do|should|can|who|where|when)\b/i.test(title)) add("warn", "Question without a question mark", "It starts like a question; add the question mark.");

  const bad = checks.filter((c) => c.level === "bad").length;
  const warn = checks.filter((c) => c.level === "warn").length;
  const score = Math.max(0, 100 - bad * 35 - warn * 12);
  return { checks, score };
}

export default function TitleChecker() {
  const [title, setTitle] = useState("What's the best way to track which Reddit threads ChatGPT cites?");
  const { checks, score } = useMemo(() => checkTitle(title), [title]);

  return (
    <div className="card">
      <label htmlFor="title-in" className="tool-label">Post title</label>
      <textarea id="title-in" className="input tool-textarea" rows={3} value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="tool-meta" style={{ marginTop: 6 }}>{title.trim().length} / 300 characters</div>
      {title.trim() ? (
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
