import type { EvaluationResult, VerificationReport } from "../lib/types";

export default function CustomerReport({ report, evaluations, batchIds }: {
  report: VerificationReport | null; evaluations: Map<string, EvaluationResult>; batchIds: string[];
}) {
  if (!report) return <div className="mt-8 p-8 rounded-xl border text-center" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>Run verification first.</div>;
  const confirmed = batchIds.filter(id => evaluations.get(id)?.decision === "CONFIRMED");
  return (
    <div className="mt-8 max-w-2xl mx-auto p-8 rounded-xl border" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
      <div className="text-center mb-6 pb-6 border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="text-xs uppercase mb-2" style={{ color: "var(--text-muted)" }}>Adam Verify</div>
        <h1 className="text-xl font-bold">Cross-Site Verification Report</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{report.report_id}</p>
      </div>
      <div className="text-center mb-6">
        <div className="text-4xl font-bold font-mono" style={{ color: "var(--release-green)" }}>{confirmed.length}/{batchIds.length}</div>
        <div className="text-sm" style={{ color: "var(--text-muted)" }}>batches confirmed</div>
      </div>
      <p className="text-sm text-center mb-4" style={{ color: "var(--text-secondary)" }}>{report.summary}</p>
      <p className="text-xs text-center italic" style={{ color: "var(--text-muted)" }}>
        Decision support only — final release decisions require human QA review.
      </p>
    </div>
  );
}
