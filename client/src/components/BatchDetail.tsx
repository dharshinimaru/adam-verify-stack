import type { Batch, EvaluationResult } from "../lib/types";
import type { AnomalyKind } from "../lib/sandbox";
import RiskBars from "./RiskBars";
import AssayVsTelemetryView from "./AssayVsTelemetryView";
import SandboxPanel from "./SandboxPanel";

interface Props {
  evaluation: EvaluationResult; batch: Batch; onClose: () => void;
  isMutated: boolean; onInject: (kind: AnomalyKind) => void; onReset: () => void;
}

export default function BatchDetail({ evaluation, batch, onClose, isMutated, onInject, onReset }: Props) {
  return (
    <aside className="panel p-6 md:p-8 sticky top-6 animate-in">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="section-label">{batch.site}</p>
          <h3 className="font-mono text-2xl mt-1 flex items-center gap-2">
            {evaluation.batch_id}
            {evaluation.source === "sandbox" && (
              <span className="text-[10px] font-sans uppercase tracking-widest px-1.5 py-0.5" style={{ background: "var(--drift-purple-bg)", color: "var(--drift-purple)" }}>Sandbox</span>
            )}
          </h3>
        </div>
        <button onClick={onClose} className="text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>Close</button>
      </div>

      <div className="mb-6 pb-6 border-b" style={{ borderColor: "var(--border-hairline)" }}>
        <p className="section-label mb-1">Validity score</p>
        <p className="font-mono text-4xl">{(evaluation.validity_score * 100).toFixed(0)}<span className="text-lg ml-1" style={{ color: "var(--text-muted)" }}>/100</span></p>
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Confidence {(evaluation.confidence * 100).toFixed(0)}%</p>
      </div>

      {evaluation.key_risk_factors?.length > 0 && (
        <div className="mb-6">
          <p className="section-label mb-3">Risk factors</p>
          <RiskBars factors={evaluation.key_risk_factors} />
        </div>
      )}

      <div className="mb-4" data-tour="rationale">
        <p className="section-label mb-2">Reasoning</p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{evaluation.rationale}</p>
      </div>

      <AssayVsTelemetryView batch={batch} />

      {evaluation.confirmatory_action && (
        <div className="mt-4 p-4 border" style={{ borderColor: "var(--border-hairline)", background: "var(--rescue-amber-bg)" }} data-tour="confirmatory-action">
          <p className="section-label mb-2" style={{ color: "var(--rescue-amber)" }}>Recommended action</p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{evaluation.confirmatory_action}</p>
        </div>
      )}

      <SandboxPanel batchId={batch.batchId} isMutated={isMutated} onInject={onInject} onReset={onReset} />
    </aside>
  );
}
