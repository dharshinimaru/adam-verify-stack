import type { EvaluationResult } from "../lib/types";
import BatchCard from "./BatchCard";

const SITE_COPY = {
  "Site A": "Reference site — stable expansion kinetics ~24h across all batches.",
  "Site B": "Comparison site — watch for progressive drift in B-203 and B-204.",
};

export default function SiteDashboard({ siteALabel, siteBLabel, siteABatchIds, siteBBatchIds, evaluations, processingId, selectedId, onSelect }: {
  siteALabel: string; siteBLabel: string; siteABatchIds: string[]; siteBBatchIds: string[];
  evaluations: Map<string, EvaluationResult>; processingId: string | null; selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const section = (label: string, ids: string[], color: string) => (
    <div className="panel p-6 md:p-8" data-tour={label === "Site B" ? "site-b-group" : undefined}>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-1 h-6 shrink-0" style={{ background: color }} />
          <h2 className="font-display text-xl">{label}</h2>
          <span className="section-label">{ids.length} batches</span>
        </div>
        <p className="text-sm max-w-lg" style={{ color: "var(--text-secondary)" }}>{SITE_COPY[label as keyof typeof SITE_COPY]}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ids.map(id => (
          <BatchCard key={id} batchId={id} evaluation={evaluations.get(id)} isProcessing={processingId === id}
            isSelected={selectedId === id} onClick={() => onSelect(selectedId === id ? null : id)} accentColor={color} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-px" style={{ background: "var(--border-hairline)" }}>
      {section(siteALabel, siteABatchIds, "var(--site-a-color)")}
      {section(siteBLabel, siteBBatchIds, "var(--site-b-color)")}
    </div>
  );
}
