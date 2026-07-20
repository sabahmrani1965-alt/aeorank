// Pure-SVG bar chart — no library, same viewBox/gridline house style as
// components/KeywordChart.js and PromptTrendChart.js. Plots real daily
// earnings for the last 7 days (from actually-submitted tasks), not
// interpolated/fabricated points.

function niceCeil(value) {
  if (value <= 0) return 1;
  const exp = Math.floor(Math.log10(value));
  const fraction = value / Math.pow(10, exp);
  let nice;
  if (fraction <= 1) nice = 1;
  else if (fraction <= 2) nice = 2;
  else if (fraction <= 2.5) nice = 2.5;
  else if (fraction <= 5) nice = 5;
  else nice = 10;
  return nice * Math.pow(10, exp);
}

export default function EarningsChart({ points }) {
  if (!points || points.length === 0) return null;

  const W = 640;
  const H = 220;
  const pad = { l: 44, r: 14, t: 16, b: 30 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const yMax = niceCeil(Math.max(1, ...points.map((p) => p.value)));
  const ticks = 4;
  const groupW = innerW / points.length;
  const barW = Math.max(14, Math.min(36, groupW * 0.5));

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMinYMid meet" style={{ display: "block", minWidth: "100%" }}>
        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const value = (yMax * (ticks - i)) / ticks;
          const y = pad.t + (innerH * i) / ticks;
          return (
            <g key={i}>
              <line x1={pad.l} y1={y} x2={pad.l + innerW} y2={y} stroke="#232938" strokeWidth={i === ticks ? 1.5 : 1} strokeDasharray={i === ticks ? "0" : "3 4"} />
              <text x={pad.l - 8} y={y + 3} fill="#6b7686" fontSize="10.5" textAnchor="end" fontFamily="ui-sans-serif, system-ui, sans-serif">
                ${value.toFixed(0)}
              </text>
            </g>
          );
        })}

        {points.map((p, i) => {
          const xCenter = pad.l + groupW * i + groupW / 2;
          const h = (p.value / yMax) * innerH;
          return (
            <g key={p.label}>
              <rect x={xCenter - barW / 2} y={pad.t + innerH - h} width={barW} height={h} fill="#ff4500" rx="4" />
              <text x={xCenter} y={pad.t + innerH + 18} fill="#9aa4b2" fontSize="10.5" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif">
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
