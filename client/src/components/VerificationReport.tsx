import type { VerificationReport } from "../lib/types";

export default function VerificationReportView({ report }: { report: VerificationReport }) {
  const dc = report.overall_decision === "ALL_CONFIRMED" ? "var(--release-green)" : report.overall_decision === "RETEST_RECOMMENDED" ? "var(--rescue-amber)" : "var(--drift-purple)";
  return (
    <div className="mt-6 p-5 rounded-xl border" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
      <div className="flex justify-between mb-4">
        <div>
          <h2 className="text-xs uppercase" style={{ color: "var(--text-muted)" }}>Verification Report</h2>
          <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{report.report_id}</p>
        </div>
        <span className="text-sm font-bold font-mono px-3 py-1 rounded" style={{ background: dc + "22", color: dc }}>{report.overall_decision.replace(/_/g, " ")}</span>
      </div>
      <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>{report.summary}</p>
      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
        {([["Confirmed", report.confirmed.length, "var(--release-green)"], ["Retest", report.flagged_for_retest.length, "var(--rescue-amber)"], ["Drift watch", report.site_drift_watch.length, "var(--drift-purple)"]] as const).map(([l, v, c]) => (
          <div key={l} className="p-2 rounded-lg" style={{ background: "var(--bg-surface-elevated)" }}>
            <div className="text-2xl font-bold font-mono" style={{ color: c }}>{v}</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>{l}</div>
          </div>
        ))}
      </div>
      {report.value_protected_usd > 0 && (
        <div className="p-3 rounded-lg mb-4" style={{ background: "var(--release-green-dim)" }}>
          <span className="text-xs uppercase" style={{ color: "var(--text-muted)" }}>Value protected </span>
          <span className="font-mono font-bold text-lg" style={{ color: "var(--release-green)" }}>${report.value_protected_usd.toLocaleString()}</span>
        </div>
      )}
      <ol className="space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
        {report.recommended_actions.map((a, i) => <li key={i}><span style={{ color: "var(--accent-blue)" }}>{i + 1}.</span> {a}</li>)}
      </ol>
    </div>
  );
}
