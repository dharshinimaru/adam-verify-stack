import type { CrossSiteResult } from "../lib/types";

export default function CrossSiteChart({ crossSite, embedded }: { crossSite: CrossSiteResult; embedded?: boolean }) {
  if (!crossSite.drift_detected || !crossSite.site_a_baseline || !crossSite.site_b_trend) return null;
  const a = crossSite.site_a_baseline;
  const b = crossSite.site_b_trend;
  const all = [...a, ...b];
  const min = Math.min(...all) - 1;
  const max = Math.max(...all) + 1;
  const range = max - min;
  const toY = (v: number) => 150 - ((v - min) / range) * 120;
  const toX = (i: number, len: number) => 48 + (i * 304 / Math.max(len - 1, 1));
  const aPts = a.map((v, i) => `${toX(i, a.length)},${toY(v)}`).join(" ");
  const bPts = b.map((v, i) => `${toX(i, b.length)},${toY(v)}`).join(" ");

  const wrap = embedded ? "mt-4" : "mt-4 p-6 panel";

  return (
    <div className={wrap}>
      {!embedded && (
        <div className="flex justify-between mb-4 text-xs">
          <span className="section-label">{crossSite.affected_parameter}</span>
          <span className="flex gap-4">
            <span style={{ color: "var(--site-a-color)" }}>— Site A baseline</span>
            <span style={{ color: "var(--site-b-color)" }}>- - Site B B-203</span>
          </span>
        </div>
      )}
      <svg viewBox="0 0 400 170" className="w-full h-44">
        {[23, 24, 25, 26, 27, 28, 29, 30].filter(v => v >= min && v <= max).map(v => (
          <g key={v}>
            <line x1="48" y1={toY(v)} x2="352" y2={toY(v)} stroke="var(--border-hairline)" />
            <text x="8" y={toY(v) + 4} fill="var(--text-muted)" fontSize="10" fontFamily="JetBrains Mono">{v}h</text>
          </g>
        ))}
        <polyline points={aPts} fill="none" stroke="var(--site-a-color)" strokeWidth="2" />
        <polyline points={bPts} fill="none" stroke="var(--site-b-color)" strokeWidth="2" strokeDasharray="6 4" />
        {a.map((v, i) => <circle key={`a${i}`} cx={toX(i, a.length)} cy={toY(v)} r="3" fill="var(--site-a-color)" />)}
        {b.map((v, i) => <circle key={`b${i}`} cx={toX(i, b.length)} cy={toY(v)} r="3" fill="var(--site-b-color)" />)}
      </svg>
    </div>
  );
}
