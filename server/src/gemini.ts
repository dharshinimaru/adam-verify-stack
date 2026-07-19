import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are Adam Verify, an autonomous verification agent for cell/gene therapy manufacturing. Compare batches across sites. Flag assay noise when potency fails but trajectories match healthy batches. Flag cross-site drift when one site trends away from another's baseline even if each batch passes its own site spec. Respond ONLY with valid JSON.`;

function cleanJson(text: string): string {
  return text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
}

export async function evaluateBatch(batch: unknown, siteContext: string): Promise<Record<string, unknown>> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: SYSTEM_PROMPT });
  const b = batch as { batchId: string };
  const prompt = `EVALUATE batch. JSON only.\nBATCH:\n${JSON.stringify(batch, null, 2)}\nCONTEXT:\n${siteContext}\nSchema: {"batch_id":"${b.batchId}","validity_score":0-1,"decision":"CONFIRMED|FLAGGED_FOR_RETEST","confidence":0-1,"rationale":"","key_risk_factors":[{"factor":"","severity":0-1}],"is_likely_assay_noise":boolean}`;
  const result = await model.generateContent(prompt);
  return JSON.parse(cleanJson(result.response.text()));
}

export async function recommendConfirmatoryAction(batchId: string, finding: string, riskFactors: unknown[]): Promise<Record<string, unknown>> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: SYSTEM_PROMPT });
  const prompt = `CONFIRMATORY ACTION for ${batchId}. JSON only.\nFINDING: ${finding}\nRISKS: ${JSON.stringify(riskFactors)}\nSchema: {"batch_id":"${batchId}","confirmatory_action":"","target_finding":"","rescue_feasible":boolean,"explanation":""}`;
  const result = await model.generateContent(prompt);
  return JSON.parse(cleanJson(result.response.text()));
}

export async function compareCrossSite(siteA: unknown[], siteB: unknown[]): Promise<Record<string, unknown>> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: SYSTEM_PROMPT });
  const prompt = `COMPARE sites. JSON only.\nSITE A:\n${JSON.stringify(siteA, null, 2)}\nSITE B:\n${JSON.stringify(siteB, null, 2)}\nSchema: {"drift_detected":boolean,"severity":"low|medium|high|critical","affected_batches":[],"affected_parameter":"","description":"","recommended_action":""}`;
  const result = await model.generateContent(prompt);
  return JSON.parse(cleanJson(result.response.text()));
}

export async function generateVerificationReport(results: unknown[], crossSite: unknown): Promise<Record<string, unknown>> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: SYSTEM_PROMPT });
  const prompt = `VERIFICATION REPORT. JSON only.\nRESULTS:\n${JSON.stringify(results, null, 2)}\nCROSS-SITE:\n${JSON.stringify(crossSite, null, 2)}\nSchema: {"report_id":"VER-2026-0719","overall_decision":"ALL_CONFIRMED|RETEST_RECOMMENDED|SITE_INVESTIGATION_NEEDED","total_batches":${(results as unknown[]).length},"confirmed":[],"flagged_for_retest":[],"site_drift_watch":[],"cross_site_drift_detected":boolean,"cross_site_summary":"","value_protected_usd":number,"summary":"","recommended_actions":[]}`;
  const result = await model.generateContent(prompt);
  return JSON.parse(cleanJson(result.response.text()));
}
