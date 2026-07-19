export interface Batch {
  batchId: string;
  site: "Site A" | "Site B";
  viableCellDensityTrajectory: number[];
  expansionKinetics: number[];
  metabolicMarkers: number[];
  potencyAssayResult: { result: "pass" | "fail"; score: number };
}

export type Decision = "PENDING" | "CONFIRMED" | "FLAGGED_FOR_RETEST" | "SITE_DRIFT_WATCH";

export interface EvaluationResult {
  batch_id: string;
  validity_score: number;
  decision: Decision;
  confidence: number;
  rationale: string;
  key_risk_factors: { factor: string; severity: number }[];
  is_likely_assay_noise?: boolean;
  confirmatory_action?: string;
  source?: "gemini" | "fallback";
}

export interface CrossSiteResult {
  drift_detected: boolean;
  description: string;
  affected_batches: string[];
  affected_parameter: string;
  recommended_action: string;
  severity: "low" | "medium" | "high" | "critical";
  site_a_baseline?: number[];
  site_b_trend?: number[];
}

export interface VerificationReport {
  report_id: string;
  overall_decision: "ALL_CONFIRMED" | "RETEST_RECOMMENDED" | "SITE_INVESTIGATION_NEEDED";
  total_batches: number;
  confirmed: string[];
  flagged_for_retest: string[];
  site_drift_watch: string[];
  cross_site_drift_detected: boolean;
  cross_site_summary?: string;
  value_protected_usd: number;
  summary: string;
  recommended_actions: string[];
}

export interface LogEntry {
  timestamp: string;
  type: "info" | "success" | "warning" | "error" | "drift" | "action" | "report";
  message: string;
  batch_id?: string;
}

export interface AgentEvent {
  type: "log" | "evaluation" | "cross_site" | "report" | "complete";
  data: LogEntry | EvaluationResult | CrossSiteResult | VerificationReport;
}

export type ViewMode = "operations" | "customer";
