import type { EvaluationResult } from "../lib/types";
import BatchCard from "./BatchCard";

export default function SiteDashboard({ siteALabel, siteBLabel, siteABatchIds, siteBBatchIds, evaluations, processingId, selectedId, onSelect }: {
  siteALabel: string; siteBLabel: string; siteABatchIds: string[]; siteBBatchIds: string[];
  evaluations: Map<string, EvaluationResult>; processingId: string | null; selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const section = (label: string, ids: string[], color: string) => (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
        <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</h2>
        <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: "var(--bg-surface-elevated)", color: "var(--text-secondary)" }}>{ids.length} batches</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ids.map(id => (
          <BatchCard key={id} batchId={id} evaluation={evaluations.get(id)} isProcessing={processingId === id}
            isSelected={selectedId === id} onClick={() => onSelect(selectedId === id ? null : id)} accentColor={color} />
        ))}
      </div>
    </div>
  );
  return (
    <div className="space-y-6">
      {section(siteALabel, siteABatchIds, "var(--site-a-color)")}
      {section(siteBLabel, siteBBatchIds, "var(--site-b-color)")}
    </div>
  );
}
