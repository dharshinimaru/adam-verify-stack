import type { VerificationReport, EvaluationResult } from "./types";

export interface RoiSummary {
  rescuedBatchCount: number;
  materialsSavedUsd: number;
  activeRiskBatchCount: number;
  totalRiskCoverageUsd: number;
  cycleTimeSeconds: number | null;
}

/** Typical per-batch commercial value for an autologous cell/gene therapy lot — used to translate rescued/at-risk batch counts into dollar terms. */
export const PER_BATCH_VALUE_USD = 300_000;
/** Downstream value considered "at risk" per batch under an active, unresolved cross-site drift watch. */
export const PER_DRIFT_BATCH_RISK_USD = 100_000;
/** Industry-cited benchmark for a manual cross-site deviation investigation, used only as a comparison point — not derived from batch data. */
export const INDUSTRY_CYCLE_TIME_LABEL = "10–15 business days";

export function computeRoi(
  report: VerificationReport | null,
  evaluations: Map<string, EvaluationResult>,
  elapsedMs: number | null
): RoiSummary | null {
  if (!report) return null;

  const rescuedBatchCount = [...evaluations.values()].filter(
    e => e.is_likely_assay_noise && e.decision === "FLAGGED_FOR_RETEST"
  ).length;
  const materialsSavedUsd = rescuedBatchCount * PER_BATCH_VALUE_USD;

  const activeRiskBatchCount = report.site_drift_watch.length;
  const totalRiskCoverageUsd = materialsSavedUsd + activeRiskBatchCount * PER_DRIFT_BATCH_RISK_USD;

  return {
    rescuedBatchCount,
    materialsSavedUsd,
    activeRiskBatchCount,
    totalRiskCoverageUsd,
    cycleTimeSeconds: elapsedMs != null ? Math.max(1, Math.round(elapsedMs / 1000)) : null,
  };
}
