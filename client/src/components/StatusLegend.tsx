export default function StatusLegend() {
  const items = [
    { label: "Confirmed", color: "var(--release-green)" },
    { label: "Retest recommended", color: "var(--rescue-amber)" },
    { label: "Drift watch", color: "var(--drift-purple)" },
  ];
  return (
    <div className="flex flex-wrap gap-6 py-4">
      {items.map(i => (
        <div key={i.label} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: i.color }} />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{i.label}</span>
        </div>
      ))}
    </div>
  );
}
