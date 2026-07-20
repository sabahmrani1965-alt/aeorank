"use client";

import { useState } from "react";
import ScrollReveal from "./ScrollReveal";

const FAQS = [
  {
    q: "What is CrewQuest?",
    a: "CrewQuest is a marketplace connecting brands with creators. Creators complete real posting/commenting missions on Reddit and get paid per mission — no bots, no fake engagement.",
  },
  {
    q: "How do I get paid?",
    a: "Each mission pays a flat rate ($0.50 for a comment or reply, $1.00 for a post). Your earnings build up in your dashboard, and you can request a withdrawal once you've earned at least $10.",
  },
  {
    q: "Why do you check my Reddit account?",
    a: "To keep missions genuine, your account needs to be active (not suspended), at least 6 months old, and have at least 50 combined karma. This keeps the platform trustworthy for the brands posting missions.",
  },
  {
    q: "What happens if I don't finish a mission in time?",
    a: "Each mission has a time limit once you claim it. If you don't submit in time, it goes back into the pool for someone else to grab.",
  },
  {
    q: "Can I do more than one mission at once?",
    a: "One at a time — finishing a mission briefly cools that mission type down for you specifically, but other types stay open right away.",
  },
  {
    q: "Is this just Reddit?",
    a: "Reddit missions are live today. LinkedIn, X, and Discord support is coming — we'll only say a platform is live once it actually is.",
  },
  {
    q: "Can I earn from referrals?",
    a: "Yes — share your referral link, and you'll earn 15% of everything your referred creator makes in their first 3 months.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" className="section">
      <div className="container-narrow">
        <ScrollReveal>
          <span className="section-tag">( faq )</span>
          <h2>Questions, answered</h2>
        </ScrollReveal>

        <div className="cq-faq-list">
          {FAQS.map((item, i) => (
            <ScrollReveal key={item.q} delay={i * 50}>
              <div className="cq-faq-item">
                <button
                  type="button"
                  className="cq-faq-question"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                >
                  {item.q}
                  <span className={`cq-faq-chevron${open === i ? " is-open" : ""}`}>⌄</span>
                </button>
                {open === i && <div className="cq-faq-answer">{item.a}</div>}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
