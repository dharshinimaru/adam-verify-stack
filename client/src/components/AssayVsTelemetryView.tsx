import type { Batch } from "../lib/types";
import { isTelemetryHealthy } from "../lib/sandbox";
import GoldenEnvelopeChart from "./GoldenEnvelopeChart";

export default function AssayVsTelemetryView({ batch }: { batch: Batch }) {
  const telemetryHealthy = isTelemetryHealthy(batch);
  const assayFailed = batch.potencyAssayResult.result === "fail";
  const discordant = assayFailed && telemetryHealthy;

  return (
    <div className="mt-4" data-tour="assay-telemetry">
      <GoldenEnvelopeChart batch={batch} />

      {discordant && (
        <div className="mt-3 border" style={{ borderColor: "var(--border-hairline)" }}>
          <div className="grid grid-cols-2">
            <div className="p-4 border-r" style={{ borderColor: "var(--border-hairline)" }}>
              <p className="section-label mb-2">Release assay</p>
              <p className="font-mono text-2xl" style={{ color: "var(--reject-red)" }}>{batch.potencyAssayResult.score}</p>
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Below threshold 50</p>
            </div>
            <div className="p-4" style={{ background: "var(--release-green-bg)" }}>
              <p className="section-label mb-2">Telemetry</p>
              <p className="font-mono text-lg" style={{ color: "var(--release-green)" }}>Healthy</p>
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Expansion {batch.expansionKinetics[5]}h</p>
            </div>
          </div>
          <div className="p-3 text-center text-xs font-medium" style={{ background: "var(--rescue-amber-bg)", color: "var(--rescue-amber)" }}>
            Discordant result → recommend confirmatory retest, not automatic disposal
          </div>
        </div>
      )}
    </div>
  );
}
