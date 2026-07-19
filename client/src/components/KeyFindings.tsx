import type { CrossSiteResult, EvaluationResult } from "../lib/types";
import CrossSiteChart from "./CrossSiteChart";

export default function KeyFindings({ a104, crossSite, onSelectBatch }: {
  a104?: EvaluationResult;
  crossSite: CrossSiteResult | null;
  onSelectBatch: (id: string) => void;
}) {
  const showRescue = a104?.is_likely_assay_noise;
  const showDrift = crossSite?.drift_detected;
  if (!showRescue && !showDrift) return null;

  return (
    <section className="py-10 animate-in">
      <p className="section-label mb-2">Key findings</p>
      <h2 className="font-display text-3xl md:text-4xl font-normal mb-8">What the agent found.</h2>

      <div className="space-y-px" style={{ background: "var(--border-hairline)" }}>
        {showRescue && (
          <div className="p-8 md:p-10 panel flex flex-col lg:flex-row gap-8 lg:items-start" style={{ background: "var(--rescue-amber-bg)", borderColor: "rgba(201,146,74,0.25)" }}>
            <div className="lg:w-1/3 shrink-0">
              <span className="section-label" style={{ color: "var(--rescue-amber)" }}>Finding 01</span>
              <h3 className="font-display text-2xl mt-2 mb-2">Likely assay noise — not a failed batch</h3>
              <button onClick={() => onSelectBatch("A-104")} className="text-xs tracking-wide underline mt-2" style={{ color: "var(--rescue-amber)" }}>
                View batch A-104 →
              </button>
            </div>
            <div className="flex-1 grid sm:grid-cols-2 gap-4">
              <div className="p-4 border" style={{ borderColor: "var(--border-hairline)", background: "rgba(0,0,0,0.2)" }}>
                <p className="section-label mb-2">Release assay</p>
                <p className="font-mono text-3xl" style={{ color: "var(--reject-red)" }}>44</p>
                <p className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>Below threshold of 50 — would trigger disposal</p>
              </div>
              <div className="p-4 border" style={{ borderColor: "var(--border-hairline)", background: "rgba(0,0,0,0.2)" }}>
                <p className="section-label mb-2">Process telemetry</p>
                <p className="font-mono text-xl" style={{ color: "var(--release-green)" }}>Healthy</p>
                <p className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>Identical trajectories to confirmed batches A-101–A-103</p>
              </div>
            </div>
            <p className="lg:w-full text-sm leading-relaxed lg:col-span-2" style={{ color: "var(--text-secondary)" }}>
              {a104?.confirmatory_action || a104?.rationale}
            </p>
          </div>
        )}

        {showDrift && crossSite && (
          <div className="p-8 md:p-10 panel" style={{ background: "var(--drift-purple-bg)", borderColor: "rgba(155,126,200,0.25)" }} data-tour="cross-site-chart">
            <div className="mb-6">
              <span className="section-label" style={{ color: "var(--drift-purple)" }}>Finding 02</span>
              <h3 className="font-display text-2xl mt-2 mb-2">Cross-site manufacturing drift</h3>
              <p className="text-sm leading-relaxed max-w-3xl" style={{ color: "var(--text-secondary)" }}>{crossSite.description}</p>
            </div>
            <CrossSiteChart crossSite={crossSite} embedded />
            <p className="text-xs mt-4 italic" style={{ color: "var(--text-muted)" }}>
              Neither site's internal QC would catch this — only visible when comparing both sites.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
