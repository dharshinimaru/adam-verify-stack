/** Run agent once and print key outcomes. Usage: FORCE_FALLBACK=1 npx tsx server/scripts/smoke-test.ts */
import "dotenv/config";
import { loadBatches } from "../src/data";
import { runVerification } from "../src/agent";

const forceFallback = process.env.FORCE_FALLBACK === "1";
if (forceFallback) process.env.GEMINI_API_KEY = "INVALID_FORCE_FALLBACK";

async function runOnce(label: string) {
  const t0 = Date.now();
  let a104: Record<string, unknown> | null = null;
  let crossSite: Record<string, unknown> | null = null;
  let report: Record<string, unknown> | null = null;
  const evals: Record<string, Record<string, unknown>> = {};

  for await (const ev of runVerification(loadBatches())) {
    if (ev.type === "evaluation") {
      const e = ev.data as Record<string, unknown>;
      evals[e.batch_id as string] = e;
      if (e.batch_id === "A-104") a104 = e;
    }
    if (ev.type === "cross_site") crossSite = ev.data as Record<string, unknown>;
    if (ev.type === "report") report = ev.data as Record<string, unknown>;
  }
  const ms = Date.now() - t0;
  console.log(`\n--- ${label} (${(ms / 1000).toFixed(1)}s) ---`);
  console.log("A-104 decision:", a104?.decision, "| assay_noise:", a104?.is_likely_assay_noise);
  console.log("A-104 confirmatory:", a104?.confirmatory_action ? "YES" : "NO");
  console.log("Cross-site drift:", crossSite?.drift_detected, "| affected:", (crossSite?.affected_batches as string[])?.join(", "));
  console.log("Drift watch:", (report?.site_drift_watch as string[])?.join(", "));
  console.log("Report decision:", report?.overall_decision, "| value:", report?.value_protected_usd);
  return { ms, a104, crossSite, report, evals };
}

async function main() {
  const runs = [];
  for (let i = 1; i <= 3; i++) runs.push(await runOnce(`Run ${i}`));
  const same = runs.every(r =>
    r.a104?.decision === runs[0].a104?.decision &&
    JSON.stringify(r.report?.site_drift_watch) === JSON.stringify(runs[0].report?.site_drift_watch)
  );
  console.log("\n3-run identical:", same);
  console.log("Avg time:", (runs.reduce((s, r) => s + r.ms, 0) / runs.length / 1000).toFixed(1) + "s");
}

main().catch(console.error);
