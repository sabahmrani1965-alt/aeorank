// Pure-CSS/SVG bar chart — no chart library dependency.

export default function KeywordChart({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.monthly));
  const W = 800;
  const H = 280;
  const pad = { l: 36, r: 12, t: 14, b: 50 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const groupW = innerW / rows.length;
  const barW = Math.max(8, groupW / 2.6);
  const gap = 4;

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        {/* y-axis label */}
        <text x={pad.l - 6} y={pad.t + 12} fill="#a8b2c8" fontSize="11" textAnchor="end">
          {Math.round((max / 1000) * 100) / 100}K
        </text>
        <text x={pad.l - 6} y={pad.t + innerH} fill="#a8b2c8" fontSize="11" textAnchor="end">
          0
        </text>
        {/* baseline */}
        <line
          x1={pad.l} y1={pad.t + innerH}
          x2={pad.l + innerW} y2={pad.t + innerH}
          stroke="#1a2547" strokeWidth="1"
        />
        {rows.map((r, i) => {
          const xCenter = pad.l + groupW * i + groupW / 2;
          const h1 = (r.monthly / max) * innerH;
          const h2 = (r.potential / max) * innerH;
          const x1 = xCenter - barW - gap / 2;
          const x2 = xCenter + gap / 2;
          return (
            <g key={r.keyword}>
              <rect
                x={x1} y={pad.t + innerH - h1} width={barW} height={h1}
                fill="#4ade80" rx="2"
              />
              <rect
                x={x2} y={pad.t + innerH - h2} width={barW} height={h2}
                fill="#1f7a3a" rx="2" opacity="0.85"
              />
              <text
                x={xCenter} y={H - 22}
                fill="#a8b2c8" fontSize="10.5"
                textAnchor="middle"
              >
                #{r.keyword.length > 16 ? r.keyword.slice(0, 16) + "…" : r.keyword}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
