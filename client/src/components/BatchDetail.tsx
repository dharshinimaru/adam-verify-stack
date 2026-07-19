import type { Batch, EvaluationResult } from "../lib/types";
import RiskBars from "./RiskBars";
import AssayVsTelemetryView from "./AssayVsTelemetryView";

export default function BatchDetail({ evaluation, batch, onClose }: { evaluation: EvaluationResult; batch: Batch; onClose: () => void }) {
  const scoreColor = evaluation.validity_score >= 0.8 ? "var(--release-green)" : evaluation.validity_score >= 0.6 ? "var(--rescue-amber)" : "var(--reject-red)";
  const decColor = evaluation.decision === "CONFIRMED" ? "var(--release-green)" : evaluation.decision === "FLAGGED_FOR_RETEST" ? "var(--rescue-amber)" : "var(--drift-purple)";
  return (
    <div className="rounded-xl border p-6" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
      <div className="flex justify-between mb-4">
        <div>
          <span className="font-mono text-lg font-bold">{evaluation.batch_id}</span>
          <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded" style={{ background: "var(--bg-surface-elevated)", color: "var(--text-secondary)" }}>{batch.site}</span>
          <span className="ml-3 text-xs uppercase" style={{ color: decColor }}>{evaluation.decision.replace(/_/g, " ")}</span>
        </div>
        <button onClick={onClose} className="text-sm px-2 py-1 rounded" style={{ color: "var(--text-muted)" }}>✕</button>
      </div>
      <div className="mb-6 flex items-end gap-3">
        <span className="text-5xl font-bold font-mono tabular-nums" style={{ color: scoreColor }}>{evaluation.validity_score.toFixed(2)}</span>
        <span className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>confidence {(evaluation.confidence * 100).toFixed(0)}%</span>
      </div>
      {evaluation.key_risk_factors?.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs uppercase mb-3" style={{ color: "var(--text-muted)" }}>Risk Factors</h3>
          <RiskBars factors={evaluation.key_risk_factors} />
        </div>
      )}
      <h3 className="text-xs uppercase mb-2" style={{ color: "var(--text-muted)" }}>Agent Reasoning</h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{evaluation.rationale}</p>
      <AssayVsTelemetryView batch={batch} />
      {evaluation.confirmatory_action && (
        <div className="mt-4 p-4 rounded-lg" style={{ background: "var(--bg-surface-elevated)" }}>
          <h3 className="text-xs uppercase mb-2" style={{ color: "var(--rescue-amber)" }}>Confirmatory Action</h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{evaluation.confirmatory_action}</p>
        </div>
      )}
    </div>
  );
}
