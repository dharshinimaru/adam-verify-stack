import type { Batch, EvaluationResult, LogEntry } from "./types";

export type AnomalyKind = "ph-anomaly" | "assay-defect";

export const ANOMALY_LABELS: Record<AnomalyKind, string> = {
  "ph-anomaly": "Bioreactor pH Anomaly",
  "assay-defect": "Assay Plate Defect",
};

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function timestamp(): string {
  return new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// Progressive divergence starting mid-culture (day 3), matching the shape of a real reactor excursion.
const PH_EXPANSION_DELTA = [0, 0.2, 1.2, 2.6, 4.0, 5.2];
const PH_METABOLIC_DELTA = [0, -0.02, -0.08, -0.16, -0.24, -0.3];

/** Mutates a batch's telemetry/assay trajectory to simulate a live process interruption. Pure — returns a new Batch. */
export function applyAnomaly(batch: Batch, kind: AnomalyKind): Batch {
  if (kind === "ph-anomaly") {
    return {
      ...batch,
      expansionKinetics: batch.expansionKinetics.map((v, i) => +(v + PH_EXPANSION_DELTA[i]).toFixed(1)),
      metabolicMarkers: batch.metabolicMarkers.map((v, i) => +clamp(v + PH_METABOLIC_DELTA[i], 0.15, 1).toFixed(2)),
      viableCellDensityTrajectory: batch.viableCellDensityTrajectory.map((v, i) => +(v * (1 - i * 0.03)).toFixed(2)),
    };
  }
  // assay-defect: telemetry trajectory is untouched, only the release assay reading is corrupted
  return {
    ...batch,
    potencyAssayResult: { result: "fail", score: 36 },
  };
}

const TELEMETRY_HEALTHY_THRESHOLDS = { expansion: 26, metabolic: 0.75 };

export function isTelemetryHealthy(batch: Batch): boolean {
  return batch.expansionKinetics[5] < TELEMETRY_HEALTHY_THRESHOLDS.expansion && batch.metabolicMarkers[5] > TELEMETRY_HEALTHY_THRESHOLDS.metabolic;
}

function calculateScore(batch: Batch): number {
  const exp = batch.expansionKinetics[5];
  const meta = batch.metabolicMarkers[5];
  const pot = batch.potencyAssayResult.score;
  let score = 1.0;
  if (exp > 28) score -= 0.25; else if (exp > 26) score -= 0.12;
  if (meta < 0.65) score -= 0.25; else if (meta < 0.75) score -= 0.12;
  if (pot < 50) score -= 0.35;
  return Math.max(0, Math.min(1, score));
}

/** Client-side re-scoring, mirroring the server's deterministic fallback logic, so the UI reacts instantly without a round trip. */
export function computeSandboxEvaluation(batch: Batch): EvaluationResult {
  const score = calculateScore(batch);
  const exp = batch.expansionKinetics[5];
  const meta = batch.metabolicMarkers[5];
  const telemetryHealthy = isTelemetryHealthy(batch);
  const assayFailed = batch.potencyAssayResult.result === "fail";
  const isLikelyAssayNoise = assayFailed && telemetryHealthy;

  let decision: EvaluationResult["decision"];
  let rationale: string;
  let confirmatoryAction: string | undefined;

  if (isLikelyAssayNoise) {
    decision = "FLAGGED_FOR_RETEST";
    rationale = `[SANDBOX SIMULATION] Assay plate defect injected — potency reading of ${batch.potencyAssayResult.score} falls below the release threshold of 50. The 6-day expansion and metabolic trajectories are unaffected and remain healthy (harvest expansion ${exp}h, metabolic stability ${meta}). This is the same discordant pattern as A-104 — likely a measurement artifact, not a genuine batch failure. Recommend confirmatory retest before disposal.`;
    confirmatoryAction = "Recommend confirmatory potency retest using a fresh assay aliquot before disposal decision. If retest confirms failure, escalate to root-cause investigation. If retest passes, release with an annotated batch record noting the initial discordant result.";
  } else if (assayFailed) {
    decision = "FLAGGED_FOR_RETEST";
    rationale = `[SANDBOX SIMULATION] Potency assay failed at ${batch.potencyAssayResult.score} (threshold 50) and process telemetry is also degraded (harvest expansion ${exp}h, metabolic stability ${meta}). Unlike the assay-noise pattern, telemetry corroborates the failing assay here — this looks like a genuine process issue, not measurement noise.`;
  } else if (score < 0.65) {
    decision = "FLAGGED_FOR_RETEST";
    rationale = `[SANDBOX SIMULATION] Bioreactor pH anomaly injected — potency assay still passes (${batch.potencyAssayResult.score}), but the expansion kinetics trajectory has diverged sharply from the golden envelope by harvest: ${exp}h (was healthy), metabolic stability down to ${meta}. Adam Verify flags this on telemetry alone, ahead of any assay signal — a purely reactive, physical-process-driven catch.`;
  } else {
    decision = "CONFIRMED";
    rationale = "[SANDBOX SIMULATION] Telemetry and assay remain within healthy range after the injected perturbation. No action required.";
  }

  const keyRiskFactors = [
    { factor: "Potency assay result", severity: assayFailed ? 0.65 : 0.1 },
    { factor: "Metabolic stability", severity: clamp((0.92 - meta) * 1.4, 0.03, 0.95) },
    { factor: "Expansion kinetics", severity: clamp((exp - 24) / 10, 0.03, 0.95) },
  ];

  return {
    batch_id: batch.batchId,
    validity_score: score,
    decision,
    confidence: 0.75,
    rationale,
    key_risk_factors: keyRiskFactors,
    is_likely_assay_noise: isLikelyAssayNoise,
    confirmatory_action: confirmatoryAction,
    source: "sandbox",
  };
}

export function buildSandboxLogEntries(batch: Batch, kind: AnomalyKind, evaluation: EvaluationResult): LogEntry[] {
  return [
    {
      timestamp: timestamp(),
      type: "action",
      message: `🧪 [SANDBOX] Injected ${ANOMALY_LABELS[kind]} on ${batch.batchId} — recalculating validity score and risk flags live...`,
      batch_id: batch.batchId,
    },
    {
      timestamp: timestamp(),
      type: evaluation.decision === "CONFIRMED" ? "success" : "warning",
      message: `${evaluation.decision === "CONFIRMED" ? "✓" : "⚠"} [SANDBOX] ${batch.batchId} recalculated: ${evaluation.decision} (score: ${evaluation.validity_score.toFixed(2)})`,
      batch_id: batch.batchId,
    },
  ];
}

export function buildResetLogEntry(batchId: string): LogEntry {
  return {
    timestamp: timestamp(),
    type: "info",
    message: `↺ [SANDBOX] ${batchId} restored to original baseline telemetry and assay values.`,
    batch_id: batchId,
  };
}
