import fs from "fs";
import path from "path";
import { Batch } from "./types";

const dataDir = path.join(__dirname, "../data");

export function loadBatches(): Batch[] {
  const siteA = JSON.parse(fs.readFileSync(path.join(dataDir, "siteA.json"), "utf-8"));
  const siteB = JSON.parse(fs.readFileSync(path.join(dataDir, "siteB.json"), "utf-8"));
  return [
    ...siteA.batches.map((b: Omit<Batch, "site">) => ({ ...b, site: "Site A" as const })),
    ...siteB.batches.map((b: Omit<Batch, "site">) => ({ ...b, site: "Site B" as const })),
  ];
}
