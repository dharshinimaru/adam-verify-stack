import type { CrossSiteResult } from "../lib/types";

export default function CrossSiteChart({ crossSite }: { crossSite: CrossSiteResult }) {
  if (!crossSite.drift_detected || !crossSite.site_a_baseline || !crossSite.site_b_trend) return null;
  const a = crossSite.site_a_baseline;
  const b = crossSite.site_b_trend;
  const all = [...a, ...b];
  const min = Math.min(...all) - 1.5;
  const max = Math.max(...all) + 1.5;
  const range = max - min;
  const toY = (v: number) => 155 - ((v - min) / range) * 125;
  const toX = (i: number, len: number) => 40 + (i * 320 / Math.max(len - 1, 1));
  const aPts = a.map((v, i) => `${toX(i, a.length)},${toY(v)}`).join(" ");
  const bPtsFixed = b.map((v, i) => `${toX(i, b.length)},${toY(v)}`).join(" ");

  return (
    <div className="mt-4 p-5 rounded-xl border-2" style={{ background: "var(--bg-surface)", borderColor: "var(--drift-purple)" }}>
      <div className="flex flex-wrap justify-between gap-2 mb-2">
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
          {crossSite.affected_parameter}
        </h3>
        <div className="flex gap-4 text-sm font-semibold">
          <span style={{ color: "var(--site-a-color)" }}>━━ Site A baseline (~24h flat)</span>
          <span style={{ color: "var(--site-b-color)" }}>━━ Site B B-203 drift (25→29h)</span>
        </div>
      </div>
      <svg viewBox="0 0 400 180" className="w-full h-44" role="img" aria-label="Cross-site expansion kinetics chart">
        {[23, 24, 25, 26, 27, 28, 29, 30].filter(v => v >= min && v <= max).map(v => (
          <g key={v}>
            <line x1="40" y1={toY(v)} x2="360" y2={toY(v)} stroke="var(--border-subtle)" strokeDasharray="4 4" />
            <text x="4" y={toY(v) + 4} fill="var(--text-muted)" fontSize="10">{v}h</text>
          </g>
        ))}
        <polyline points={aPts} fill="none" stroke="var(--site-a-color)" strokeWidth="4" strokeLinecap="round" />
        <polyline points={bPtsFixed} fill="none" stroke="var(--site-b-color)" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 4" />
        {a.map((v, i) => <circle key={`a${i}`} cx={toX(i, a.length)} cy={toY(v)} r="5" fill="var(--site-a-color)" stroke="#fff" strokeWidth="1.5" />)}
        {b.map((v, i) => <circle key={`b${i}`} cx={toX(i, b.length)} cy={toY(v)} r="5" fill="var(--site-b-color)" stroke="#fff" strokeWidth="1.5" />)}
        <text x={toX(a.length - 1, a.length)} y={toY(a[a.length - 1]) - 12} fill="var(--site-a-color)" fontSize="11" fontWeight="bold">Site A</text>
        <text x={toX(b.length - 1, b.length)} y={toY(b[b.length - 1]) - 12} fill="var(--site-b-color)" fontSize="11" fontWeight="bold">B-203</text>
      </svg>
      <p className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>
        Day 1 → Day 6 expansion kinetics. Site B stays under its 30h internal spec the entire run — divergence only visible against Site A.
      </p>
    </div>
  );
}
