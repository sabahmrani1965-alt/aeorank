"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LOCATIONS = [
  "United States - English",
  "United Kingdom - English",
  "Canada - English",
  "Australia - English",
  "Other",
];

const selectStyle = {
  background: "var(--bg-3)",
  border: "1px solid var(--card-border)",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
  color: "var(--text)",
  fontFamily: "inherit",
};

// mode="edit" (default) updates the given profileId in place. mode="create"
// posts to /api/brands instead, so the plan's brand-count limit stays
// enforced server-side rather than duplicated here.
export default function CompanyProfileForm({ initialProfile, mode = "edit", profileId }) {
  const router = useRouter();
  const p = initialProfile || {};
  const [website, setWebsite] = useState(p.website || "");
  const [companyName, setCompanyName] = useState(p.company_name || "");
  const [targetLocation, setTargetLocation] = useState(p.target_location || LOCATIONS[0]);
  const [variations, setVariations] = useState(p.brand_variations || []);
  const [variationInput, setVariationInput] = useState("");
  const [description, setDescription] = useState(p.description || "");
  const [competitors, setCompetitors] = useState([
    p.competitors?.[0] || "",
    p.competitors?.[1] || "",
    p.competitors?.[2] || "",
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [autofilling, setAutofilling] = useState(false);
  const [autofillError, setAutofillError] = useState("");

  async function autofill() {
    if (!website.trim() || autofilling) return;
    setAutofillError("");
    setAutofilling(true);
    try {
      const res = await fetch("/api/brands/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not look up that website.");
      if (data.companyName) setCompanyName(data.companyName);
      if (data.description) setDescription(data.description);
      if (Array.isArray(data.variations) && data.variations.length) setVariations(data.variations);
    } catch (err) {
      setAutofillError(err?.message || "Could not look up that website.");
    } finally {
      setAutofilling(false);
    }
  }

  function addVariation(e) {
    e.preventDefault();
    const v = variationInput.trim();
    if (!v || variations.includes(v)) {
      setVariationInput("");
      return;
    }
    setVariations((prev) => [...prev, v]);
    setVariationInput("");
  }

  function removeVariation(v) {
    setVariations((prev) => prev.filter((x) => x !== v));
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const fields = {
        website: website || null,
        companyName: companyName || null,
        targetLocation: targetLocation || null,
        brandVariations: variations,
        description: description || null,
        competitors: competitors.map((c) => c.trim()).filter(Boolean),
      };

      if (mode === "create") {
        const res = await fetch("/api/brands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fields),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Could not create this brand.");
        router.push("/dashboard");
        router.refresh();
        return;
      }

      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("company_profiles")
        .update({
          website: fields.website,
          company_name: fields.companyName,
          target_location: fields.targetLocation,
          brand_variations: fields.brandVariations,
          description: fields.description,
          competitors: fields.competitors,
          completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profileId);
      if (updateError) throw updateError;
      setSaved(true);
    } catch (err) {
      setError(err?.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="card" style={{ padding: 24, maxWidth: 640, display: "flex", flexDirection: "column", gap: 18 }}>
      <label className="auth-field">
        <span>Website</span>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="yourbrand.com"
            style={{ flex: 1 }}
          />
          <button
            type="button"
            onClick={autofill}
            disabled={autofilling || !website.trim()}
            className="btn btn-ghost btn-sm"
            style={{ whiteSpace: "nowrap" }}
          >
            {autofilling ? "Filling…" : "✨ Auto-fill with AI"}
          </button>
        </div>
        {autofillError && (
          <span style={{ fontSize: 12.5, color: "#ff8a8a" }}>{autofillError}</span>
        )}
      </label>

      <label className="auth-field">
        <span>Company name</span>
        <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your Company" />
      </label>

      <label className="auth-field">
        <span>Target location</span>
        <select value={targetLocation} onChange={(e) => setTargetLocation(e.target.value)} style={selectStyle}>
          {LOCATIONS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </label>

      <div>
        <span style={{ display: "block", marginBottom: 8, fontSize: 14 }}>Brand name variations</span>
        {variations.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            {variations.map((v) => (
              <span
                key={v}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--bg-3)",
                  border: "1px solid var(--card-border)",
                  borderRadius: 999,
                  padding: "5px 10px",
                  fontSize: 13,
                }}
              >
                {v}
                <button
                  type="button"
                  onClick={() => removeVariation(v)}
                  aria-label={`Remove ${v}`}
                  style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: 13, padding: 0 }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={variationInput}
            onChange={(e) => setVariationInput(e.target.value)}
            placeholder="Add a variation"
            onKeyDown={(e) => {
              if (e.key === "Enter") addVariation(e);
            }}
          />
          <button type="button" onClick={addVariation} className="btn btn-ghost btn-sm">
            Add
          </button>
        </div>
      </div>

      <label className="auth-field">
        <span>Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 1600))}
          rows={5}
          style={{
            background: "var(--bg-3)",
            border: "1px solid var(--card-border)",
            borderRadius: 10,
            padding: "12px 14px",
            fontSize: 14.5,
            color: "var(--text)",
            fontFamily: "inherit",
            width: "100%",
            resize: "vertical",
          }}
        />
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{description.length}/1600 characters</span>
      </label>

      <div>
        <span style={{ display: "block", marginBottom: 8, fontSize: 14 }}>Competitors (optional)</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {competitors.map((c, i) => (
            <input
              key={i}
              type="text"
              value={c}
              onChange={(e) => setCompetitors((prev) => prev.map((x, idx) => (idx === i ? e.target.value : x)))}
              placeholder={`Competitor ${i + 1} URL`}
            />
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" style={{ color: "#ff8a8a", fontSize: 14, margin: 0 }}>
          {error}
        </p>
      )}
      {saved && (
        <p style={{ color: "#7ee3a3", fontSize: 14, margin: 0 }}>
          Saved.
        </p>
      )}

      <div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : mode === "create" ? "Create brand" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
