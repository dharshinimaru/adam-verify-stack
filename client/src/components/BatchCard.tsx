import type { Decision, EvaluationResult } from "../lib/types";

const cfg: Record<Decision, { color: string; label: string; icon: string; ring?: string }> = {
  PENDING: { color: "var(--text-muted)", label: "Pending", icon: "○" },
  CONFIRMED: { color: "var(--release-green)", label: "Confirmed", icon: "✓" },
  FLAGGED_FOR_RETEST: { color: "var(--rescue-amber)", label: "RETEST", icon: "⚡", ring: "2px solid var(--rescue-amber)" },
  SITE_DRIFT_WATCH: { color: "var(--drift-purple)", label: "Drift Watch", icon: "◈" },
};

export default function BatchCard({ batchId, evaluation, isProcessing, isSelected, onClick, accentColor }: {
  batchId: string; evaluation?: EvaluationResult; isProcessing: boolean; isSelected: boolean;
  onClick: () => void; accentColor: string;
}) {
  const d = evaluation?.decision || "PENDING";
  const c = cfg[d];
  return (
    <button onClick={onClick} className={`relative text-left p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${isProcessing ? "processing" : ""} ${evaluation?.is_likely_assay_noise ? "animate-pulse" : ""}`}
      style={{ background: isSelected ? "var(--bg-surface-elevated)" : evaluation?.is_likely_assay_noise ? "var(--rescue-amber-dim)" : "var(--bg-surface)", borderColor: evaluation?.is_likely_assay_noise ? "var(--rescue-amber)" : isSelected ? c.color : "var(--border-subtle)", borderTopColor: accentColor, borderTopWidth: 4, boxShadow: evaluation?.is_likely_assay_noise ? "0 0 16px rgba(245,158,11,0.35)" : undefined }}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-sm font-semibold">{batchId}</span>
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
      </div>
      <div className="mb-2 text-3xl font-bold font-mono tabular-nums" style={{ color: evaluation ? c.color : "var(--text-muted)" }}>
        {evaluation ? evaluation.validity_score.toFixed(2) : "—"}
      </div>
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider" style={{ color: c.color }}>
        <span>{c.icon}</span><span>{c.label}</span>
      </div>
      {evaluation?.is_likely_assay_noise && (
        <div className="mt-2 text-xs font-bold font-mono px-2 py-1.5 rounded border" style={{ background: "var(--rescue-amber)", color: "#000", borderColor: "#fff" }}>⚡ ASSAY NOISE — RETEST</div>
      )}
    </button>
  );
}
