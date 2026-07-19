import type { Decision, EvaluationResult } from "../lib/types";

const cfg: Record<Decision, { label: string; desc: string; color: string; bg: string }> = {
  PENDING: { label: "Awaiting review", desc: "Not yet evaluated", color: "var(--text-muted)", bg: "transparent" },
  CONFIRMED: { label: "Confirmed", desc: "Ready for release", color: "var(--release-green)", bg: "var(--release-green-bg)" },
  FLAGGED_FOR_RETEST: { label: "Retest recommended", desc: "Assay discordance", color: "var(--rescue-amber)", bg: "var(--rescue-amber-bg)" },
  SITE_DRIFT_WATCH: { label: "Drift watch", desc: "Cross-site trend", color: "var(--drift-purple)", bg: "var(--drift-purple-bg)" },
};

export default function BatchCard({ batchId, evaluation, isProcessing, isSelected, onClick, accentColor }: {
  batchId: string; evaluation?: EvaluationResult; isProcessing: boolean; isSelected: boolean;
  onClick: () => void; accentColor: string;
}) {
  const d = evaluation?.decision || "PENDING";
  const c = cfg[d];

  return (
    <button onClick={onClick} data-tour={`batch-${batchId}`}
      className={`text-left p-4 border transition-all w-full ${isProcessing ? "processing" : ""} ${isSelected ? "outline outline-1" : "hover:border-[var(--border-strong)]"}`}
      style={{
        background: isSelected ? "var(--bg-elevated)" : "var(--bg-surface)",
        borderColor: isSelected ? accentColor : "var(--border-hairline)",
        outlineColor: accentColor,
      }}>
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-sm tracking-tight">{batchId}</span>
        <div className="flex items-center gap-1.5">
          {evaluation?.source === "sandbox" && (
            <span className="text-[9px] uppercase tracking-widest px-1 py-0.5" style={{ background: "var(--drift-purple-bg)", color: "var(--drift-purple)" }}>Sim</span>
          )}
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: accentColor }} />
        </div>
      </div>

      <div className="inline-block px-2 py-1 text-[10px] uppercase tracking-widest mb-3" style={{ background: c.bg, color: c.color }}>
        {c.label}
      </div>

      {evaluation ? (
        <>
          <p className="font-mono text-2xl tabular-nums mb-1" style={{ color: "var(--text-primary)" }}>
            {(evaluation.validity_score * 100).toFixed(0)}<span className="text-sm ml-1" style={{ color: "var(--text-muted)" }}>/100</span>
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{c.desc}</p>
        </>
      ) : (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>—</p>
      )}

      {evaluation?.is_likely_assay_noise && (
        <p className="mt-3 text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--rescue-amber)" }}>
          Assay noise suspected
        </p>
      )}
    </button>
  );
}
