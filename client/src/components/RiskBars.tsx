export default function RiskBars({ factors }: { factors: { factor: string; severity: number }[] }) {
  return (
    <div className="space-y-2.5">
      {[...factors].sort((a, b) => b.severity - a.severity).map((f, i) => (
        <div key={i}>
          <div className="flex justify-between mb-1 text-xs">
            <span style={{ color: "var(--text-secondary)" }}>{f.factor}</span>
            <span className="font-mono" style={{ color: "var(--text-muted)" }}>{(f.severity * 100).toFixed(0)}%</span>
          </div>
          <div className="h-2 rounded-full" style={{ background: "var(--bg-primary)" }}>
            <div className="h-2 rounded-full" style={{ width: `${f.severity * 100}%`, background: f.severity > 0.7 ? "var(--reject-red)" : f.severity > 0.4 ? "var(--rescue-amber)" : "var(--release-green)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
