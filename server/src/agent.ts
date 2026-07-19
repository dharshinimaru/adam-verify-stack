import { Batch, LogEntry, EvaluationResult, CrossSiteResult, VerificationReport, AgentEvent } from "./types";
import { evaluateBatch, recommendConfirmatoryAction, compareCrossSite, generateVerificationReport } from "./gemini";
import { FALLBACK_EVALUATIONS, FALLBACK_CONFIRMATORY_ACTION, FALLBACK_CROSS_SITE, FALLBACK_REPORT, calculateFallbackScore, calculateValueProtected } from "./fallbacks";

const ts = () => new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
const BATCH_PACE = Number(process.env.BATCH_PACE_MS) || 1800;
const SECTION_PACE = Number(process.env.SECTION_PACE_MS) || 800;

async function withFallback<T>(fn: () => Promise<T>, fb: T, ms = 4000): Promise<{ result: T; source: "gemini" | "fallback" }> {
  if (process.env.FORCE_FALLBACK === "1") return { result: fb, source: "fallback" };
  try {
    const result = await Promise.race([fn(), new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
    return { result, source: "gemini" };
  } catch {
    return { result: fb, source: "fallback" };
  }
}

export async function* runVerification(batches: Batch[]): AsyncGenerator<AgentEvent> {
  const results: { batch: Batch; evaluation: EvaluationResult }[] = [];

  yield { type: "log", data: { timestamp: ts(), type: "info", message: `Starting verification — ${batches.length} batches across 2 sites` } };
  yield { type: "log", data: { timestamp: ts(), type: "info", message: "Report ID: VER-2026-0719 | Agent: Adam Verify v1.0" } };
  await delay(SECTION_PACE);

  const siteA = batches.filter(b => b.site === "Site A");
  const siteB = batches.filter(b => b.site === "Site B");

  for (const batch of [...siteA, ...siteB]) {
    yield { type: "log", data: { timestamp: ts(), type: "info", message: `[${batch.site}] Evaluating ${batch.batchId}...`, batch_id: batch.batchId } };

    const ctx = results.filter(r => r.batch.site === batch.site)
      .map(r => `${r.batch.batchId}: score=${r.evaluation.validity_score}, exp=${r.batch.expansionKinetics[5]}h`)
      .join("\n");

    const fb = FALLBACK_EVALUATIONS[batch.batchId] || {
      batch_id: batch.batchId,
      validity_score: calculateFallbackScore(batch),
      decision: batch.potencyAssayResult.result === "fail" ? "FLAGGED_FOR_RETEST" as const : "CONFIRMED" as const,
      confidence: 0.8,
      rationale: "Threshold-based evaluation.",
      key_risk_factors: [{ factor: "Metabolic stability", severity: batch.metabolicMarkers[5] < 0.75 ? 0.6 : 0.2 }],
      is_likely_assay_noise: batch.potencyAssayResult.result === "fail",
    };

    const { result: ev, source } = await withFallback(() => evaluateBatch(batch, ctx), fb);
    const evaluation: EvaluationResult = {
      batch_id: batch.batchId,
      validity_score: ev.validity_score as number,
      decision: ev.decision as EvaluationResult["decision"],
      confidence: ev.confidence as number,
      rationale: ev.rationale as string,
      key_risk_factors: (ev.key_risk_factors as EvaluationResult["key_risk_factors"]) || [],
      is_likely_assay_noise: ev.is_likely_assay_noise as boolean | undefined,
      source,
    };

    const tag = source === "gemini" ? " ⟡ Gemini" : "";
    const icon = evaluation.decision === "CONFIRMED" ? "✓" : "⚠";
    yield { type: "log", data: { timestamp: ts(), type: evaluation.decision === "CONFIRMED" ? "success" : "warning", message: `${icon} [${batch.site}] ${batch.batchId}: ${evaluation.decision} (${evaluation.validity_score.toFixed(2)})${tag}`, batch_id: batch.batchId } };

    if (evaluation.is_likely_assay_noise) {
      yield { type: "log", data: { timestamp: ts(), type: "action", message: `→ Potency FAILED (${batch.potencyAssayResult.score}) but trajectories healthy — likely assay noise`, batch_id: batch.batchId } };
      const { result: action, source: asrc } = await withFallback(() => recommendConfirmatoryAction(batch.batchId, evaluation.rationale, evaluation.key_risk_factors), FALLBACK_CONFIRMATORY_ACTION);
      evaluation.confirmatory_action = action.confirmatory_action as string;
      yield { type: "log", data: { timestamp: ts(), type: "success", message: `→ Recommended: ${evaluation.confirmatory_action}${asrc === "gemini" ? " ⟡ Gemini" : ""}`, batch_id: batch.batchId } };
      await delay(500);
    }

    yield { type: "evaluation", data: evaluation };
    results.push({ batch, evaluation });
    await delay(BATCH_PACE);
  }

  yield { type: "log", data: { timestamp: ts(), type: "info", message: "Running cross-site comparison (Site A vs Site B)..." } };
  await delay(SECTION_PACE);

  const siteAAvg = [0, 1, 2, 3, 4, 5].map(d =>
    siteA.filter(b => b.potencyAssayResult.result === "pass").reduce((s, b) => s + b.expansionKinetics[d], 0) /
    siteA.filter(b => b.potencyAssayResult.result === "pass").length
  );
  const b203 = siteB.find(b => b.batchId === "B-203")!;

  const crossFb: CrossSiteResult = {
    ...FALLBACK_CROSS_SITE,
    site_a_baseline: siteAAvg,
    site_b_trend: b203.expansionKinetics,
  };

  const { result: cs, source: cssrc } = await withFallback(() => compareCrossSite(siteA, siteB), crossFb);
  const crossSite: CrossSiteResult = {
    drift_detected: cs.drift_detected as boolean,
    description: cs.description as string,
    affected_batches: (cs.affected_batches as string[]) || [],
    affected_parameter: (cs.affected_parameter as string) || "",
    recommended_action: cs.recommended_action as string,
    severity: (cs.severity as CrossSiteResult["severity"]) || "low",
    site_a_baseline: crossFb.site_a_baseline,
    site_b_trend: crossFb.site_b_trend,
  };

  if (crossSite.drift_detected) {
    yield { type: "log", data: { timestamp: ts(), type: "drift", message: `⚠ CROSS-SITE DRIFT: ${crossSite.description}${cssrc === "gemini" ? " ⟡ Gemini" : ""}` } };
    yield { type: "log", data: { timestamp: ts(), type: "drift", message: "→ Only visible by comparing both sites." } };
    yield { type: "cross_site", data: crossSite };
    for (const r of results) {
      if (crossSite.affected_batches.includes(r.batch.batchId) && r.evaluation.decision === "CONFIRMED") {
        r.evaluation.decision = "SITE_DRIFT_WATCH";
        yield { type: "evaluation", data: r.evaluation };
      }
    }
  }

  await delay(SECTION_PACE);
  yield { type: "log", data: { timestamp: ts(), type: "info", message: "Generating verification report..." } };

  const confirmed = results.filter(r => r.evaluation.decision === "CONFIRMED").map(r => r.batch.batchId);
  const flagged = results.filter(r => r.evaluation.decision === "FLAGGED_FOR_RETEST").map(r => r.batch.batchId);
  const driftWatch = results.filter(r => r.evaluation.decision === "SITE_DRIFT_WATCH").map(r => r.batch.batchId);
  const valueProtected = calculateValueProtected(flagged, driftWatch);

  const localFb: VerificationReport = {
    ...FALLBACK_REPORT,
    confirmed, flagged_for_retest: flagged, site_drift_watch: driftWatch,
    cross_site_drift_detected: crossSite.drift_detected,
    value_protected_usd: valueProtected,
    overall_decision: driftWatch.length > 0 ? "SITE_INVESTIGATION_NEEDED" : flagged.length > 0 ? "RETEST_RECOMMENDED" : "ALL_CONFIRMED",
  };

  const { result: rd, source: rsrc } = await withFallback(
    () => generateVerificationReport(results.map(r => ({ batchId: r.batch.batchId, site: r.batch.site, ...r.evaluation })), crossSite),
    localFb
  );

  const report: VerificationReport = {
    report_id: (rd.report_id as string) || "VER-2026-0719",
    overall_decision: rd.overall_decision as VerificationReport["overall_decision"],
    total_batches: batches.length,
    confirmed: (rd.confirmed as string[]) || [],
    flagged_for_retest: (rd.flagged_for_retest as string[]) || [],
    site_drift_watch: (rd.site_drift_watch as string[]) || [],
    cross_site_drift_detected: (rd.cross_site_drift_detected as boolean) ?? crossSite.drift_detected,
    cross_site_summary: rd.cross_site_summary as string | undefined,
    value_protected_usd: (rd.value_protected_usd as number) || valueProtected,
    summary: rd.summary as string,
    recommended_actions: (rd.recommended_actions as string[]) || [],
  };

  yield { type: "report", data: report };
  yield { type: "log", data: { timestamp: ts(), type: "report", message: `REPORT: ${report.overall_decision} — ${report.summary}${rsrc === "gemini" ? " ⟡ Gemini" : ""}` } };
  yield { type: "log", data: { timestamp: ts(), type: "report", message: `Value protected: $${report.value_protected_usd.toLocaleString()}` } };
  yield { type: "complete", data: { timestamp: ts(), type: "info", message: "Complete." } as LogEntry };
}
