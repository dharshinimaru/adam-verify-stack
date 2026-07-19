export default function RunProgress({ isRunning, hasRun, phase, batchesDone, totalBatches }: {
  isRunning: boolean; hasRun: boolean; phase: "idle" | "batches" | "cross_site" | "report" | "done";
  batchesDone: number; totalBatches: number;
}) {
  if (!hasRun && !isRunning) return null;

  const steps = [
    { id: "batches", label: "Evaluate batches", sub: `${batchesDone}/${totalBatches} reviewed` },
    { id: "cross_site", label: "Compare sites", sub: "Cross-site analysis" },
    { id: "report", label: "Generate report", sub: "Summary & actions" },
  ] as const;

  const idx = phase === "batches" ? 0 : phase === "cross_site" ? 1 : phase === "report" || phase === "done" ? 2 : 0;

  return (
    <div className="py-6 border-b animate-in" style={{ borderColor: "var(--border-hairline)" }}>
      <p className="section-label mb-4">{isRunning ? "Review in progress" : "Review complete"}</p>
      <div className="flex flex-col md:flex-row gap-4 md:gap-0">
        {steps.map((s, i) => {
          const active = i === idx && isRunning;
          const done = i < idx || (!isRunning && hasRun);
          return (
            <div key={s.id} className="flex-1 flex items-start gap-3 md:pr-8">
              <span className="font-mono text-xs mt-0.5 w-6 shrink-0" style={{ color: done ? "var(--release-green)" : active ? "var(--accent-warm)" : "var(--text-muted)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-sm font-medium" style={{ color: active || done ? "var(--text-primary)" : "var(--text-muted)" }}>{s.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.sub}</p>
              </div>
              {i < steps.length - 1 && <div className="hidden md:block flex-1 h-px mt-3 ml-4" style={{ background: done ? "var(--border-strong)" : "var(--border-hairline)" }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
