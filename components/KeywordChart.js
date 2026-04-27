// Pure-SVG bar chart — no library. Designed for 7-20 keyword rows with
// diagonal labels and a tidy gridline scale on the y-axis.

function formatY(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) {
    const k = n / 1_000;
    return (k >= 100 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")) + "K";
  }
  return String(n);
}

// Round a number up to a "nice" tick value so the y-axis labels feel natural.
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

export default function KeywordChart({ rows }) {
  if (!rows || rows.length === 0) return null;
  const dataMax = Math.max(1, ...rows.map((r) => r.monthly));
  const yMax = niceCeil(dataMax);
  const ticks = 5; // 0, 25%, 50%, 75%, 100%

  // Width grows with row count so 20 bars remain legible. Min 800, max 1400.
  const W = Math.min(1400, Math.max(800, 70 * rows.length));
  const H = 360;
  const pad = { l: 56, r: 14, t: 18, b: 110 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const groupW = innerW / rows.length;
  const barW = Math.max(6, Math.min(18, groupW / 2.6));
  const gap = Math.max(2, barW * 0.18);

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        preserveAspectRatio="xMinYMid meet"
        style={{ display: "block", minWidth: "100%" }}
      >
        {/* Gridlines + y-axis tick labels */}
        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const tickValue = (yMax * (ticks - i)) / ticks;
          const y = pad.t + (innerH * i) / ticks;
          return (
            <g key={i}>
              <line
                x1={pad.l} y1={y}
                x2={pad.l + innerW} y2={y}
                stroke="#1a2547"
                strokeWidth={i === ticks ? 1.5 : 1}
                strokeDasharray={i === ticks ? "0" : "3 4"}
              />
              <text
                x={pad.l - 8} y={y + 3}
                fill="#a8b2c8" fontSize="11" textAnchor="end"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {formatY(Math.round(tickValue))}
              </text>
            </g>
          );
        })}

        {rows.map((r, i) => {
          const xCenter = pad.l + groupW * i + groupW / 2;
          const h1 = (r.monthly / yMax) * innerH;
          const h2 = (r.potential / yMax) * innerH;
          const x1 = xCenter - barW - gap / 2;
          const x2 = xCenter + gap / 2;
          const labelY = pad.t + innerH + 14;
          return (
            <g key={`${r.keyword}-${i}`}>
              <rect
                x={x1} y={pad.t + innerH - h1} width={barW} height={h1}
                fill="#f2a83b" rx="2"
              />
              <rect
                x={x2} y={pad.t + innerH - h2} width={barW} height={h2}
                fill="#a06b1c" rx="2" opacity="0.9"
              />
              {/* Diagonal label rotated -45deg around its anchor */}
              <text
                transform={`rotate(-45 ${xCenter} ${labelY})`}
                x={xCenter} y={labelY}
                fill="#a8b2c8" fontSize="11"
                textAnchor="end"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                #{r.keyword.length > 26 ? r.keyword.slice(0, 25) + "…" : r.keyword}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
