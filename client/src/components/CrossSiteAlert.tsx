import type { CrossSiteResult } from "../lib/types";

export default function CrossSiteAlert({ crossSite }: { crossSite: CrossSiteResult }) {
  if (!crossSite.drift_detected) return null;
  return (
    <div className="mt-6 p-4 rounded-xl border" style={{ background: "var(--drift-purple-dim)", borderColor: "var(--drift-purple)" }}>
      <div className="text-sm font-semibold uppercase mb-2" style={{ color: "var(--drift-purple)" }}>◈ Cross-Site Drift — {crossSite.severity}</div>
      <p className="text-sm mb-2">{crossSite.description}</p>
      <p className="text-xs italic mb-2" style={{ color: "var(--text-secondary)" }}>Only visible comparing both sites.</p>
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{crossSite.recommended_action}</p>
      <div className="mt-2 flex gap-2 flex-wrap">
        {crossSite.affected_batches.map(id => (
          <span key={id} className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: "var(--drift-purple)", color: "#fff" }}>{id}</span>
        ))}
      </div>
    </div>
  );
}
