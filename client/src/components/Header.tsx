import type { ViewMode } from "../lib/types";

export default function Header({ isRunning, hasRun, onRun, valueProtected, batchesProcessed, totalBatches, viewMode, onViewModeChange }: {
  isRunning: boolean; hasRun: boolean; onRun: () => void; valueProtected: number;
  batchesProcessed: number; totalBatches: number; viewMode: ViewMode; onViewModeChange: (m: ViewMode) => void;
}) {
  return (
    <header className="flex items-center justify-between gap-6 py-5 border-b" style={{ borderColor: "var(--border-hairline)" }}>
      <div>
        <p className="section-label mb-1">Independent verification</p>
        <h1 className="font-display text-2xl md:text-3xl font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>
          Adam Verify
        </h1>
      </div>

      <div className="flex items-center gap-5 flex-wrap justify-end">
        <nav className="flex border" style={{ borderColor: "var(--border-hairline)" }}>
          {(["operations", "customer"] as ViewMode[]).map(m => (
            <button key={m} onClick={() => onViewModeChange(m)}
              className="px-4 py-2 text-xs tracking-wide transition-colors"
              style={{
                background: viewMode === m ? "var(--bg-elevated)" : "transparent",
                color: viewMode === m ? "var(--text-primary)" : "var(--text-muted)",
                borderRight: m === "operations" ? "1px solid var(--border-hairline)" : undefined,
              }}>
              {m === "customer" ? "Sponsor report" : "Operations"}
            </button>
          ))}
        </nav>

        {hasRun && !isRunning && (
          <div className="hidden md:flex gap-6 text-right">
            <div data-tour="value-protected">
              <p className="section-label">Value protected</p>
              <p className="font-mono text-lg" style={{ color: "var(--release-green)" }}>${valueProtected.toLocaleString()}</p>
            </div>
            <div>
              <p className="section-label">Batches reviewed</p>
              <p className="font-mono text-lg">{batchesProcessed}/{totalBatches}</p>
            </div>
          </div>
        )}

        <button onClick={onRun} disabled={isRunning}
          className="px-5 py-2.5 text-sm tracking-wide transition-opacity disabled:opacity-40"
          style={{ background: "var(--text-primary)", color: "var(--bg-primary)" }}>
          {isRunning ? "Review in progress…" : hasRun ? "Run again" : "Start review"}
        </button>
      </div>
    </header>
  );
}
