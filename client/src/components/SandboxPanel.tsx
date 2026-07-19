import { useState } from "react";
import type { AnomalyKind } from "../lib/sandbox";

interface Props {
  batchId: string;
  isMutated: boolean;
  onInject: (kind: AnomalyKind) => void;
  onReset: () => void;
}

export default function SandboxPanel({ batchId, isMutated, onInject, onReset }: Props) {
  const [pending, setPending] = useState<AnomalyKind | "reset" | null>(null);

  function handle(kind: AnomalyKind) {
    setPending(kind);
    onInject(kind);
    window.setTimeout(() => setPending(null), 400);
  }
  function handleReset() {
    setPending("reset");
    onReset();
    window.setTimeout(() => setPending(null), 400);
  }

  return (
    <div className="mt-6 p-4 border" style={{ borderColor: "var(--border-strong)", background: "var(--bg-inset)" }} data-tour="sandbox-panel">
      <p className="section-label mb-1" style={{ color: "var(--drift-purple)" }}>Simulate process interruption — {batchId}</p>
      <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
        Live sandbox — mutates this batch&apos;s telemetry/assay in place and re-runs the agent&apos;s scoring instantly. Not part of the recorded report.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handle("ph-anomaly")}
          disabled={pending !== null}
          className="px-3 py-2 text-xs tracking-wide border transition-opacity disabled:opacity-40"
          style={{ color: "var(--rescue-amber)", borderColor: "var(--rescue-amber)" }}
        >
          {pending === "ph-anomaly" ? "Injecting…" : "⚡ Inject Bioreactor pH Anomaly"}
        </button>
        <button
          onClick={() => handle("assay-defect")}
          disabled={pending !== null}
          className="px-3 py-2 text-xs tracking-wide border transition-opacity disabled:opacity-40"
          style={{ color: "var(--reject-red)", borderColor: "var(--reject-red)" }}
        >
          {pending === "assay-defect" ? "Injecting…" : "🧪 Simulate Assay Plate Defect"}
        </button>
        {isMutated && (
          <button
            onClick={handleReset}
            disabled={pending !== null}
            className="px-3 py-2 text-xs tracking-wide border transition-opacity disabled:opacity-40"
            style={{ color: "var(--text-secondary)", borderColor: "var(--border-strong)" }}
          >
            {pending === "reset" ? "Resetting…" : "↺ Reset to Baseline"}
          </button>
        )}
      </div>
    </div>
  );
}
