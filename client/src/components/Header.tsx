import type { ViewMode } from "../lib/types";

export default function Header({ isRunning, hasRun, onRun, valueProtected, batchesProcessed, totalBatches, viewMode, onViewModeChange }: {
  isRunning: boolean; hasRun: boolean; onRun: () => void; valueProtected: number;
  batchesProcessed: number; totalBatches: number; viewMode: ViewMode; onViewModeChange: (m: ViewMode) => void;
}) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 className="text-2xl font-bold">Adam Verify</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Cross-site cell & gene therapy QC</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--border-subtle)" }}>
          {(["operations", "customer"] as ViewMode[]).map(m => (
            <button key={m} onClick={() => onViewModeChange(m)} className="px-4 py-1.5 text-xs font-medium capitalize"
              style={{ background: viewMode === m ? "var(--accent-blue)" : "var(--bg-surface)", color: viewMode === m ? "#000" : "var(--text-muted)" }}>
              {m === "customer" ? "Sponsor Report" : "Operations"}
            </button>
          ))}
        </div>
        {hasRun && (
          <>
            <div className="text-right">
              <div className="text-xs uppercase" style={{ color: "var(--text-muted)" }}>Value protected</div>
              <div className="text-2xl font-bold font-mono" style={{ color: "var(--release-green)" }}>${valueProtected.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase" style={{ color: "var(--text-muted)" }}>Processed</div>
              <div className="text-2xl font-bold font-mono">{batchesProcessed}/{totalBatches}</div>
            </div>
          </>
        )}
        <button onClick={onRun} disabled={isRunning} className="px-6 py-3 rounded-lg text-sm font-semibold disabled:opacity-50"
          style={{ background: isRunning ? "var(--bg-surface-elevated)" : "var(--accent-blue)", color: isRunning ? "var(--text-muted)" : "#000" }}>
          {isRunning ? "Running..." : hasRun ? "Re-run" : "Run Verification"}
        </button>
      </div>
    </div>
  );
}
