import { ImageResponse } from "next/og";
import { getCategory, loadSummary } from "@/lib/categoryData";

// Share card per category, drawn from the latest summary: the question and
// the three most-named brands with their share of AI answers.
export const runtime = "nodejs";
export const revalidate = 3600;
export const alt = "Which brands AI assistants recommend, daily data by AEOrank";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }) {
  const cat = getCategory(params.slug);
  const d = cat ? await loadSummary(cat.slug).catch(() => null) : null;
  const top = (d?.brands || []).slice(0, 3);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 92px",
          background: "#06112a",
          backgroundImage: "linear-gradient(135deg, #06112a 0%, #0a1c42 58%, #13284f 100%)",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: "#f2a83b" }}>
          AEOrank · daily AI answer data
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 22,
            fontSize: 60,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            maxWidth: 1000,
          }}
        >
          {`Which ${cat?.name || "brands"} do AI assistants recommend?`}
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 40, gap: 14 }}>
          {top.map((b, i) => (
            <div key={b.name} style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ display: "flex", width: 330, fontSize: 32, color: "#ffffff", fontWeight: 700 }}>
                {`${i + 1}. ${b.name}`}
              </div>
              <div
                style={{
                  display: "flex",
                  height: 16,
                  width: Math.max(8, Math.round(b.share * 5)),
                  borderRadius: 8,
                  background: "linear-gradient(90deg,#f2a83b 0%,#d97706 100%)",
                }}
              />
              <div style={{ display: "flex", fontSize: 28, color: "rgba(255,255,255,.75)" }}>{`${b.share}% of answers`}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", marginTop: 40, fontSize: 24, color: "rgba(255,255,255,.6)" }}>
          {d ? `${d.totalAnswers} answers from ChatGPT, Claude and Gemini · updated ${d.lastDay}` : "Updated daily"}
        </div>
      </div>
    ),
    { ...size }
  );
}
