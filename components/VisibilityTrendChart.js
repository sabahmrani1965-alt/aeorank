// Daily share of AI answers naming the brand, last 30 days: an area and a
// line on one scale, y axis rounded up to the next 5%. Points are
// { d: "YYYY-MM-DD", rate: 0-100, n: answers that day }. Used by the
// dashboard and the Prompts page.
const DAY = 86400000;

export default function TrendChart({ points }) {
  const W = 640, H = 220, L = 60, R = 14, T = 14, B = 30;
  const max = Math.max(20, Math.ceil(Math.max(...points.map((p) => p.rate)) / 5) * 5);
  const start = Date.now() - 29 * DAY;
  const x = (d) => L + ((Date.parse(d) - start) / (29 * DAY)) * (W - L - R);
  const y = (r) => T + (1 - r / max) * (H - T - B);
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(p.d).toFixed(1)},${y(p.rate).toFixed(1)}`).join(" ");
  const area = `${line} L${x(points[points.length - 1].d).toFixed(1)},${y(0)} L${x(points[0].d).toFixed(1)},${y(0)} Z`;
  const ticks = [0, max / 4, max / 2, (3 * max) / 4, max];
  const last = points[points.length - 1];
  const xLabels = [0, 7, 14, 21, 28].map((k) => new Date(start + k * DAY));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="dx-chart" role="img" aria-label={`AI visibility over 30 days, latest ${last.rate}%`}>
      <defs>
        <linearGradient id="dxFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="var(--card-border-soft)" />
          <text x={L - 8} y={y(t) + 4} textAnchor="end" className={`dx-chart-tick${i % 2 ? " dx-tick-minor" : ""}`}>
            {Math.round(t)}%
          </text>
        </g>
      ))}
      {xLabels.map((d) => (
        <text key={+d} x={x(d.toISOString())} y={H - 8} textAnchor="middle" className="dx-chart-tick">
          {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </text>
      ))}
      <path d={area} fill="url(#dxFill)" />
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p) => (
        <circle key={p.d} cx={x(p.d)} cy={y(p.rate)} r="7" fill="transparent">
          <title>{`${p.d}: ${p.rate}% of ${p.n} answers`}</title>
        </circle>
      ))}
      <circle cx={x(last.d)} cy={y(last.rate)} r="5" fill="var(--accent)" stroke="var(--card)" strokeWidth="2.5" />
    </svg>
  );
}

