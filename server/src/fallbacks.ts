import { EvaluationResult, CrossSiteResult, VerificationReport, Batch } from "./types";

export const FALLBACK_EVALUATIONS: Record<string, Omit<EvaluationResult, "source">> = {
  "A-101": { batch_id: "A-101", validity_score: 0.95, decision: "CONFIRMED", confidence: 0.96, rationale: "6-day trajectories stable. Harvest expansion kinetics 24.0h, metabolic stability 0.89. Potency passed at 68.", key_risk_factors: [{ factor: "Metabolic stability", severity: 0.08 }, { factor: "Expansion kinetics", severity: 0.06 }], is_likely_assay_noise: false },
  "A-102": { batch_id: "A-102", validity_score: 0.92, decision: "CONFIRMED", confidence: 0.94, rationale: "Consistent with Site A baseline. Harvest expansion 24.1h, metabolic 0.88. Potency 64.", key_risk_factors: [{ factor: "Metabolic stability", severity: 0.12 }, { factor: "Expansion kinetics", severity: 0.10 }], is_likely_assay_noise: false },
  "A-103": { batch_id: "A-103", validity_score: 0.96, decision: "CONFIRMED", confidence: 0.97, rationale: "Strongest batch. Harvest expansion 23.8h, metabolic 0.90. Potency 71.", key_risk_factors: [{ factor: "Metabolic stability", severity: 0.05 }, { factor: "Expansion kinetics", severity: 0.04 }], is_likely_assay_noise: false },
  "A-104": { batch_id: "A-104", validity_score: 0.58, decision: "FLAGGED_FOR_RETEST", confidence: 0.87, rationale: "LIKELY ASSAY NOISE. Potency failed at 44 (threshold 50) but viableCellDensityTrajectory and expansionKinetics are identical to healthy A-101. Harvest expansion 24.0h, metabolic 0.89 — indistinguishable from confirmed batches. Recommend confirmatory retest.", key_risk_factors: [{ factor: "Potency assay (44, below threshold)", severity: 0.60 }, { factor: "Process telemetry deviation", severity: 0.05 }], is_likely_assay_noise: true, confirmatory_action: "Recommend confirmatory potency retest using a fresh assay aliquot before disposal decision." },
  "B-201": { batch_id: "B-201", validity_score: 0.81, decision: "CONFIRMED", confidence: 0.85, rationale: "Within Site B spec. Harvest expansion 25.2h, potency 58. Modestly below Site A baseline.", key_risk_factors: [{ factor: "Expansion vs Site A baseline", severity: 0.30 }], is_likely_assay_noise: false },
  "B-202": { batch_id: "B-202", validity_score: 0.75, decision: "CONFIRMED", confidence: 0.82, rationale: "Within Site B spec. Harvest expansion 25.6h, potency 55.", key_risk_factors: [{ factor: "Expansion vs Site A baseline", severity: 0.38 }], is_likely_assay_noise: false },
  "B-203": { batch_id: "B-203", validity_score: 0.68, decision: "CONFIRMED", confidence: 0.80, rationale: "Passes Site B spec (potency 53) but 6-day expansionKinetics trend 25.5→28.6h diverges from Site A ~24h flat baseline.", key_risk_factors: [{ factor: "Expansion drift vs Site A", severity: 0.58 }], is_likely_assay_noise: false },
  "B-204": { batch_id: "B-204", validity_score: 0.59, decision: "CONFIRMED", confidence: 0.78, rationale: "Still passes Site B spec (potency 51, expansion <30h) but harvest expansion 29.5h — furthest from Site A baseline.", key_risk_factors: [{ factor: "Expansion drift vs Site A", severity: 0.72 }], is_likely_assay_noise: false },
};

export const FALLBACK_CONFIRMATORY_ACTION = {
  confirmatory_action: "Recommend confirmatory potency retest using a fresh assay aliquot before disposal decision.",
  target_finding: "Potency assay inconsistent with healthy process telemetry",
  rescue_feasible: true,
  explanation: "Healthy trajectories with a single failing assay value is consistent with measurement artifact.",
};

export const FALLBACK_CROSS_SITE: CrossSiteResult = {
  drift_detected: true,
  severity: "high",
  affected_batches: ["B-203", "B-204"],
  affected_parameter: "Expansion kinetics (6-day trajectory)",
  description: "Site B batches B-203 and B-204 show progressive 6-day expansion kinetics drift (25.5→28.6h and 27.0→29.5h) while Site A stays flat ~24h. All values remain within Site B's <30h spec — invisible to single-site QC.",
  recommended_action: "Open process investigation at Site B — compare media lot, incubator calibration, and procedures against Site A.",
  site_a_baseline: [24.1, 24.0, 23.9, 24.2, 24.1, 24.0],
  site_b_trend: [25.5, 26.2, 26.8, 27.4, 28.0, 28.6],
};

export const FALLBACK_REPORT: VerificationReport = {
  report_id: "VER-2026-0719",
  overall_decision: "SITE_INVESTIGATION_NEEDED",
  total_batches: 8,
  confirmed: ["A-101", "A-102", "A-103", "B-201", "B-202", "B-203", "B-204"],
  flagged_for_retest: ["A-104"],
  site_drift_watch: ["B-203", "B-204"],
  cross_site_drift_detected: true,
  cross_site_summary: "Site B progressive expansion kinetics drift, only visible cross-site.",
  value_protected_usd: 350000,
  summary: "7 of 8 batches confirmed. A-104 flagged for retest (likely assay noise). Cross-site drift detected at Site B.",
  recommended_actions: [
    "Run confirmatory potency retest on A-104",
    "Open process investigation at Site B",
    "Continue cross-site monitoring on Site B batches",
  ],
};

export function calculateValueProtected(flaggedForRetest: string[], driftWatch: string[]): number {
  let total = 0;
  if (flaggedForRetest.length > 0) total += 300_000;
  total += driftWatch.length * 25_000;
  return total;
}

export function calculateFallbackScore(batch: Batch): number {
  const exp = batch.expansionKinetics[5];
  const meta = batch.metabolicMarkers[5];
  const pot = batch.potencyAssayResult.score;
  let score = 1.0;
  if (exp > 28) score -= 0.25; else if (exp > 26) score -= 0.12;
  if (meta < 0.65) score -= 0.25; else if (meta < 0.75) score -= 0.12;
  if (pot < 50) score -= 0.35;
  return Math.max(0, Math.min(1, score));
}
