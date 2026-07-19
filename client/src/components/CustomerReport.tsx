import type { EvaluationResult, VerificationReport } from "../lib/types";

export default function CustomerReport({ report, evaluations, batchIds }: {
  report: VerificationReport | null; evaluations: Map<string, EvaluationResult>; batchIds: string[];
}) {
  if (!report) {
    return (
      <section className="py-24 text-center panel">
        <p className="font-display text-2xl mb-2">No report yet</p>
        <p style={{ color: "var(--text-secondary)" }}>Run a verification pass to generate the sponsor-facing summary.</p>
      </section>
    );
  }

  const confirmed = batchIds.filter(id => evaluations.get(id)?.decision === "CONFIRMED");

  return (
    <section className="py-12 max-w-2xl mx-auto animate-in">
      <p className="section-label text-center mb-4">Sponsor report</p>
      <h1 className="font-display text-4xl text-center mb-2">Cross-site verification</h1>
      <p className="text-center font-mono text-sm mb-12" style={{ color: "var(--text-muted)" }}>{report.report_id}</p>

      <div className="panel p-10 text-center mb-8">
        <p className="font-mono text-5xl mb-2" style={{ color: "var(--release-green)" }}>{confirmed.length}<span className="text-2xl" style={{ color: "var(--text-muted)" }}>/{batchIds.length}</span></p>
        <p className="section-label">Batches confirmed</p>
      </div>

      <p className="text-center leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>{report.summary}</p>
      <p className="text-center text-xs italic" style={{ color: "var(--text-muted)" }}>
        Decision support only — final release decisions require human QA review.
      </p>
    </section>
  );
}
