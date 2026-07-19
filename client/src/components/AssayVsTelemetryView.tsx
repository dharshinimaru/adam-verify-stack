import type { Batch } from "../lib/types";

export default function AssayVsTelemetryView({ batch }: { batch: Batch }) {
  if (batch.potencyAssayResult.result !== "fail") return null;
  const healthy = batch.expansionKinetics[5] < 26 && batch.metabolicMarkers[5] > 0.75;
  if (!healthy) return null;
  return (
    <div className="mt-4 rounded-lg overflow-hidden border" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="grid grid-cols-2">
        <div className="p-4" style={{ background: "var(--reject-red-dim)" }}>
          <div className="text-xs uppercase mb-2" style={{ color: "var(--text-muted)" }}>Release Assay</div>
          <div className="text-2xl font-bold font-mono" style={{ color: "var(--reject-red)" }}>{batch.potencyAssayResult.score}</div>
          <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Below threshold 50</div>
        </div>
        <div className="p-4" style={{ background: "var(--release-green-dim)" }}>
          <div className="text-xs uppercase mb-2" style={{ color: "var(--text-muted)" }}>Process Telemetry</div>
          <div className="text-2xl font-bold font-mono" style={{ color: "var(--release-green)" }}>Healthy</div>
          <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Expansion {batch.expansionKinetics[5]}h — matches passing batches</div>
        </div>
      </div>
      <div className="p-3 text-center text-xs font-medium" style={{ background: "var(--bg-surface-elevated)", color: "var(--rescue-amber)" }}>
        Discordant → confirmatory retest, not disposal
      </div>
    </div>
  );
}
