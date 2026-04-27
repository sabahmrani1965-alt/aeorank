"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Pretty-print a slug like "saasoffers" → "SaaSOffers". Mirrors the
// server-side helper in lib/site.js but kept local so this file stays a pure
// client component without server imports.
function prettyBrand(slug) {
  if (!slug) return "your brand";
  const s = slug.toLowerCase();
  if (s.length >= 2 && s.length <= 5 && !/[aeiouy]/.test(s)) return s.toUpperCase();
  if (s.startsWith("saas")) {
    return "SaaS" + (s[4] ? s[4].toUpperCase() + s.slice(5) : "");
  }
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const STEPS = [
  { label: (b) => `Understanding what ${b} does`, duration: 3000 },
  { label: () => `Reviewing relevant keywords`, duration: 5000 },
  { label: () => `Researching Reddit communities`, duration: 9000 },
  { label: () => `Analyzing AI overview presence`, duration: 8000 },
];

const TOTAL = STEPS.reduce((s, x) => s + x.duration, 0);

export default function Loading() {
  const pathname = usePathname();
  const slug = (pathname || "").split("/report/")[1]?.split(/[?#/]/)[0] || "";
  const brand = prettyBrand(slug);

  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      // Fill to 95% over TOTAL ms; the last 5% appears when the real page mounts.
      const pct = Math.min(95, (elapsed / TOTAL) * 95);
      setProgress(pct);

      let cum = 0;
      let idx = STEPS.length;
      for (let i = 0; i < STEPS.length; i++) {
        cum += STEPS[i].duration;
        if (elapsed < cum) {
          idx = i;
          break;
        }
      }
      setStepIdx(idx);
    }, 80);
    return () => clearInterval(tick);
  }, []);

  const activeLabel =
    stepIdx < STEPS.length ? STEPS[stepIdx].label(brand) : "Finalizing your report";

  return (
    <>
      <Header />
      <div className="loading-wrap">
        <div className="loading-card">
          <h1 className="loading-title">Analyzing AI Visibility</h1>
          <p className="loading-subtitle">
            Generating insights for <span className="accent">{brand}</span>
          </p>

          <div className="loading-status-row">
            <span className="loading-status-label">{activeLabel}…</span>
            <span className="loading-pct">{Math.round(progress)}%</span>
          </div>

          <div className="loading-bar">
            <div
              className="loading-bar-fill"
              style={{ width: `${Math.max(2, progress)}%` }}
            />
          </div>

          <div className="loading-steps">
            <h3 className="loading-steps-heading">Pipeline</h3>
            {STEPS.map((step, i) => {
              const state = i < stepIdx ? "done" : i === stepIdx ? "active" : "pending";
              return (
                <div key={i} className={`loading-step ${state}`}>
                  <span className="loading-step-icon">
                    {state === "done" && "✓"}
                    {state === "active" && <span className="loading-spinner-small" />}
                    {state === "pending" && <span className="loading-dot" />}
                  </span>
                  <span className="loading-step-label">{step.label(brand)}</span>
                </div>
              );
            })}
          </div>

          <p className="loading-tip">
            This usually takes 20–30 seconds. We're scanning Reddit and running
            the report through our AI engine — feel free to keep this tab open.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
