import { ImageResponse } from "next/og";
import { getCategory, loadSummary } from "@/lib/categoryData";

// Share card per brand page: the question and the brand's share per engine.
export const runtime = "nodejs";
export const revalidate = 3600;
export const alt = "Does ChatGPT recommend this brand? Daily AI answer data by AEOrank";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }) {
  const cat = getCategory(params.slug);
  const d = cat ? await loadSummary(cat.slug).catch(() => null) : null;
  const b = (d?.brands || []).find((x) => x.slug === params.brand);
  const name = String(b?.name || "this brand").replace(/\s+(crm|software|app|platform|suite)$/i, "");
  const engines = Object.keys(d?.engines || {}).sort();
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
          {`AEOrank · ${cat?.name || "AI answer data"}`}
        </div>
        <div style={{ display: "flex", marginTop: 22, fontSize: 64, fontWeight: 800, color: "#ffffff", lineHeight: 1.08, letterSpacing: "-0.03em", maxWidth: 1000 }}>
          {`Does ChatGPT recommend ${name}?`}
        </div>
        <div style={{ display: "flex", marginTop: 44, gap: 28 }}>
          {engines.map((e) => (
            <div key={e} style={{ display: "flex", flexDirection: "column", padding: "18px 26px", borderRadius: 16, background: "rgba(255,255,255,.07)" }}>
              <div style={{ display: "flex", fontSize: 26, color: "rgba(255,255,255,.7)" }}>{e}</div>
              <div style={{ display: "flex", fontSize: 54, fontWeight: 800, color: "#ffffff" }}>{`${b?.byEngine?.[e] ?? 0}%`}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", marginTop: 40, fontSize: 24, color: "rgba(255,255,255,.6)" }}>
          {d ? `Share of ${d.totalAnswers} AI answers naming it · updated ${d.lastDay}` : "Updated daily"}
        </div>
      </div>
    ),
    { ...size }
  );
}
