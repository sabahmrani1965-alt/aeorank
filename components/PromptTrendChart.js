// Pure-SVG line chart — no library, same viewBox/gridline house style as
// KeywordChart.js. Plots cumulative mention rate (0-100%) at each real
// check, in chronological order — sparse data (1-2 points) renders fine,
// nothing is padded with fake intermediate days.

export default function PromptTrendChart({ points }) {
  if (!points || points.length === 0) return null;

  const W = Math.min(1000, Math.max(480, 70 * points.length));
  const H = 220;
  const pad = { l: 40, r: 14, t: 16, b: 34 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const ticks = 4; // 0, 25, 50, 75, 100

  const stepX = points.length > 1 ? innerW / (points.length - 1) : 0;
  const xFor = (i) => pad.l + (points.length > 1 ? stepX * i : innerW / 2);
  const yFor = (v) => pad.t + innerH - (v / 100) * innerH;

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xFor(i)},${yFor(p.value)}`)
    .join(" ");
  const areaPath = `${path} L${xFor(points.length - 1)},${pad.t + innerH} L${xFor(0)},${pad.t + innerH} Z`;

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        preserveAspectRatio="xMinYMid meet"
        style={{ display: "block", minWidth: "100%" }}
      >
        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const value = (100 * (ticks - i)) / ticks;
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
                {Math.round(value)}%
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#promptTrendGradient)" stroke="none" />
        <path d={path} fill="none" stroke="#f2a83b" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {points.map((p, i) => (
          <g key={i}>
            <circle cx={xFor(i)} cy={yFor(p.value)} r="3.5" fill="#f2a83b" />
            <text
              x={xFor(i)} y={pad.t + innerH + 22}
              fill="#a8b2c8" fontSize="10.5" textAnchor="middle"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {p.label}
            </text>
          </g>
        ))}

        <defs>
          <linearGradient id="promptTrendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f2a83b" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f2a83b" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
