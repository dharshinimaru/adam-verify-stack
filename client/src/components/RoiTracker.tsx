import type { VerificationReport, EvaluationResult } from "../lib/types";
import { computeRoi, INDUSTRY_CYCLE_TIME_LABEL } from "../lib/roi";

interface Props {
  report: VerificationReport | null;
  evaluations: Map<string, EvaluationResult>;
  elapsedMs: number | null;
}

export default function RoiTracker({ report, evaluations, elapsedMs }: Props) {
  const roi = computeRoi(report, evaluations, elapsedMs);
  if (!roi) return null;

  return (
    <section className="py-10 animate-in">
      <p className="section-label mb-2">Operational ROI tracker</p>
      <h2 className="font-display text-3xl font-normal mb-2">This run, in dollars.</h2>
      <p className="text-sm mb-6 max-w-xl" style={{ color: "var(--text-secondary)" }}>
        Derived from this run&apos;s actual verification results — not illustrative placeholders.
      </p>

      <div className="grid sm:grid-cols-3 gap-px" style={{ background: "var(--border-hairline)" }}>
        <RoiCard
          label="Materials saved"
          value={`$${roi.materialsSavedUsd.toLocaleString()}`}
          sub={roi.rescuedBatchCount > 0 ? `${roi.rescuedBatchCount} autologous batch${roi.rescuedBatchCount > 1 ? "es" : ""} rescued from automatic disposal` : "No batches required rescue this run"}
          color="var(--release-green)"
        />
        <RoiCard
          label="Investigation cycle time"
          value={roi.cycleTimeSeconds != null ? `${roi.cycleTimeSeconds}s` : "—"}
          sub={`Industry benchmark for manual cross-site investigation: ${INDUSTRY_CYCLE_TIME_LABEL}`}
          color="var(--accent-warm)"
        />
        <RoiCard
          label="Total active risk coverage"
          value={`$${roi.totalRiskCoverageUsd.toLocaleString()}`}
          sub={`Materials saved + ${roi.activeRiskBatchCount} batch${roi.activeRiskBatchCount !== 1 ? "es" : ""} under active drift watch`}
          color="var(--drift-purple)"
        />
      </div>
    </section>
  );
}

function RoiCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="p-6" style={{ background: "var(--bg-surface)" }}>
      <p className="font-mono text-3xl mb-2" style={{ color }}>{value}</p>
      <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>{label}</p>
      <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{sub}</p>
    </div>
  );
}
