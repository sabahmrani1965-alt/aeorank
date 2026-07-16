"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PricingTiers from "@/components/PricingTiers";
import RedeemCodeForm from "@/components/RedeemCodeForm";
import { createClient } from "@/lib/supabase/client";

const LOCATIONS = [
  "United States — English",
  "United Kingdom — English",
  "Canada — English",
  "Australia — English",
  "Other",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [website, setWebsite] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [targetLocation, setTargetLocation] = useState(LOCATIONS[0]);
  const [variations, setVariations] = useState([]);
  const [description, setDescription] = useState("");
  const [competitors, setCompetitors] = useState(["", "", ""]);

  async function saveProfile(completed) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("company_profiles").upsert({
      user_id: user.id,
      website: website || null,
      company_name: companyName || null,
      target_location: targetLocation || null,
      brand_variations: variations,
      description: description || null,
      competitors: competitors.map((c) => c.trim()).filter(Boolean),
      completed,
      updated_at: new Date().toISOString(),
    });
  }

  async function skip() {
    setLoading(true);
    await saveProfile(true).catch(() => {});
    router.push("/dashboard");
  }

  async function goToStep2(e) {
    e.preventDefault();
    setError("");
    if (!website.trim()) {
      setError("Please enter your website.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/site-meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: website }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setCompanyName(data.brand || "");
        setDescription(data.description || "");
        setVariations(data.variations || []);
      }
    } catch {
      // Fetch failing shouldn't block onboarding — user fills the fields in manually.
    } finally {
      setLoading(false);
      setStep(2);
    }
  }

  function removeVariation(v) {
    setVariations((prev) => prev.filter((x) => x !== v));
  }

  function goToStep3(e) {
    e.preventDefault();
    setStep(3);
  }

  async function goToStep4(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await saveProfile(true);
      setStep(4);
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <section className="section">
        <div className="container-narrow" style={{ maxWidth: step === 4 ? 1040 : 560 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 999,
                  background: n <= step ? "var(--accent)" : "var(--card-border)",
                }}
              />
            ))}
          </div>

          {step === 1 && (
            <>
              <span className="section-tag">( step 1 )</span>
              <h2>Enter your website</h2>
              <p className="section-sub">
                We'll use it to learn about your product and suggest the most
                relevant Reddit posts to target.
              </p>
              <button
                type="button"
                onClick={skip}
                disabled={loading}
                style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: 13.5, marginBottom: 20, cursor: "pointer", padding: 0 }}
              >
                Skip onboarding
              </button>

              <form onSubmit={goToStep2}>
                <label className="auth-field">
                  <span>Your website</span>
                  <input
                    type="text"
                    placeholder="https://yourcompany.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    disabled={loading}
                    required
                  />
                </label>
                {error && (
                  <p role="alert" style={{ color: "#ff8a8a", marginBottom: 12, fontSize: 14 }}>
                    {error}
                  </p>
                )}
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Looking up your site…" : "Continue →"}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <span className="section-tag">( step 2 )</span>
              <h2>Enter your company details</h2>
              <p className="section-sub">
                We'll use it to learn about your product and suggest the most
                relevant Reddit posts to target.
              </p>

              <form onSubmit={goToStep3}>
                <label className="auth-field">
                  <span>Company name</span>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </label>

                <label className="auth-field">
                  <span>Target location</span>
                  <select
                    value={targetLocation}
                    onChange={(e) => setTargetLocation(e.target.value)}
                    style={{
                      background: "var(--bg-3)",
                      border: "1px solid var(--card-border)",
                      borderRadius: 10,
                      padding: "12px 14px",
                      fontSize: 15,
                      color: "var(--text)",
                      fontFamily: "inherit",
                      width: "100%",
                    }}
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </label>

                <div className="auth-field">
                  <span>Brand name variations</span>
                  <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 8 }}>
                    Generated from your website URL — remove any that don't fit.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {variations.map((v) => (
                      <span
                        key={v}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 12px",
                          borderRadius: 999,
                          background: "var(--bg-3)",
                          border: "1px solid var(--card-border)",
                          fontSize: 13.5,
                        }}
                      >
                        {v}
                        <button
                          type="button"
                          onClick={() => removeVariation(v)}
                          aria-label={`Remove ${v}`}
                          style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", padding: 0, fontSize: 14 }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <label className="auth-field">
                  <span>Company description</span>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, 1600))}
                    maxLength={1600}
                    rows={6}
                    style={{
                      background: "var(--bg-3)",
                      border: "1px solid var(--card-border)",
                      borderRadius: 10,
                      padding: "12px 14px",
                      fontSize: 15,
                      color: "var(--text)",
                      fontFamily: "inherit",
                      width: "100%",
                      resize: "vertical",
                    }}
                  />
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {description.length}/1600 characters
                  </span>
                </label>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
                    ← Go back
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Continue →
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <span className="section-tag">( step 3 )</span>
              <h2>Enter your competitors</h2>
              <p className="section-sub">
                We'll track how you compare to these brands in AI answers.
                Optional — leave blank to skip any.
              </p>

              <form onSubmit={goToStep4}>
                {competitors.map((c, i) => (
                  <label className="auth-field" key={i}>
                    <span>Competitor {["One", "Two", "Three"][i]}</span>
                    <input
                      type="text"
                      placeholder="https://competitor.com"
                      value={c}
                      onChange={(e) => {
                        const next = [...competitors];
                        next[i] = e.target.value;
                        setCompetitors(next);
                      }}
                    />
                  </label>
                ))}
                {error && (
                  <p role="alert" style={{ color: "#ff8a8a", marginBottom: 12, fontSize: 14 }}>
                    {error}
                  </p>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(2)} disabled={loading}>
                    ← Go back
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Saving…" : "Continue →"}
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 4 && (
            <>
              <span className="section-tag">( step 4 )</span>
              <h2>
                Choose your <span className="accent">plan</span>
              </h2>
              <p className="section-sub">
                Pick a plan that fits your stage. Cancel any time.
              </p>

              <PricingTiers brand={companyName} />

              <div style={{ marginTop: 20 }}>
                <RedeemCodeForm />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setStep(3)}>
                  ← Go back
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: 14, cursor: "pointer" }}
                >
                  Skip for now, go to dashboard →
                </button>
              </div>
            </>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
