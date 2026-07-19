export default function IntroHero({ onRun, isRunning }: { onRun: () => void; isRunning: boolean }) {
  return (
    <section className="py-16 md:py-24 animate-in">
      <p className="section-label mb-6">Cell & gene therapy · Cross-site QC</p>
      <h2 className="font-display text-4xl md:text-6xl font-normal leading-[1.1] max-w-3xl mb-6" style={{ color: "var(--text-primary)" }}>
        Verify manufacturing batches across two CDMO sites.
      </h2>
      <p className="text-lg max-w-xl mb-12 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        Adam reviews process telemetry and release assays together — catching problems no single site can see alone.
      </p>

      <div className="grid md:grid-cols-2 gap-px max-w-4xl mb-12" style={{ background: "var(--border-hairline)" }}>
        <div className="p-8 md:p-10" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)" }}>
          <span className="section-label">01 · The rescue</span>
          <h3 className="font-display text-2xl mt-3 mb-3">Assay noise, not batch failure</h3>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Batch A-104 fails its potency assay — but every process signal matches healthy batches. The agent recommends a confirmatory retest instead of disposal.
          </p>
        </div>
        <div className="p-8 md:p-10" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)" }}>
          <span className="section-label">02 · The cross-site catch</span>
          <h3 className="font-display text-2xl mt-3 mb-3">Drift invisible to either site</h3>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Site B batches B-203 and B-204 pass their own specs — but expansion kinetics drift away from Site A's stable baseline when compared directly.
          </p>
        </div>
      </div>

      <button onClick={onRun} disabled={isRunning}
        className="px-8 py-3 text-sm tracking-widest uppercase disabled:opacity-40"
        style={{ background: "var(--text-primary)", color: "var(--bg-primary)" }}>
        {isRunning ? "Running…" : "Start verification →"}
      </button>
    </section>
  );
}
