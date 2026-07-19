import siteA from "@data/siteA.json";
import siteB from "@data/siteB.json";
import type { Batch } from "../lib/types";

export const allBatches: Batch[] = [
  ...siteA.batches.map(b => ({ ...b, site: "Site A" as const, potencyAssayResult: { ...b.potencyAssayResult, result: b.potencyAssayResult.result as "pass" | "fail" } })),
  ...siteB.batches.map(b => ({ ...b, site: "Site B" as const, potencyAssayResult: { ...b.potencyAssayResult, result: b.potencyAssayResult.result as "pass" | "fail" } })),
];
