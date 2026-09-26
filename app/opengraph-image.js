import { ImageResponse } from "next/og";

// One generated card for every route. Next fills openGraph.images from this
// file wherever a page's own generateMetadata does not set images itself,
// so all 32 pages get a preview without per-page artwork.

export const alt = "AEOrank — rank in AI answers via Reddit signals";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          // Satori supports linear-gradient; the two-radius radial syntax
          // it does not parse.
          backgroundImage:
            "linear-gradient(135deg, #06112a 0%, #0a1c42 58%, #13284f 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 30,
            fontWeight: 700,
            color: "#f2a83b",
            letterSpacing: "-0.01em",
          }}
        >
          AEOrank
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 26,
            fontSize: 74,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.06,
            letterSpacing: "-0.03em",
            maxWidth: 940,
          }}
        >
          Rank in AI answers via Reddit signals
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 30,
            fontSize: 30,
            color: "rgba(255,255,255,.72)",
            maxWidth: 900,
            lineHeight: 1.35,
          }}
        >
          Show up in ChatGPT, Claude and Gemini answers — measurably.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 44,
            height: 8,
            width: 200,
            borderRadius: 8,
            background: "linear-gradient(90deg,#f2a83b 0%,#d97706 100%)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
