import type { VerificationReport } from "../lib/types";

export default function VerificationReportView({ report }: { report: VerificationReport }) {
  return (
    <section className="py-10 animate-in">
      <p className="section-label mb-2">Verification report</p>
      <h2 className="font-display text-3xl font-normal mb-6">{report.overall_decision.replace(/_/g, " ").toLowerCase()}</h2>

      <div className="panel p-8">
        <p className="font-mono text-xs mb-4" style={{ color: "var(--text-muted)" }}>{report.report_id}</p>
        <p className="text-base leading-relaxed mb-8 max-w-2xl" style={{ color: "var(--text-secondary)" }}>{report.summary}</p>

        <div className="grid grid-cols-3 gap-px mb-8" style={{ background: "var(--border-hairline)" }}>
          {[
            ["Confirmed", report.confirmed.length, "var(--release-green)"],
            ["Retest", report.flagged_for_retest.length, "var(--rescue-amber)"],
            ["Drift watch", report.site_drift_watch.length, "var(--drift-purple)"],
          ].map(([l, v, c]) => (
            <div key={l as string} className="p-4 text-center" style={{ background: "var(--bg-surface)" }} data-tour={l === "Drift watch" ? "site-drift-stat" : undefined}>
              <p className="font-mono text-2xl" style={{ color: c as string }}>{v as number}</p>
              <p className="section-label mt-1">{l as string}</p>
            </div>
          ))}
        </div>

        {report.value_protected_usd > 0 && (
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            Estimated value protected: <span className="font-mono" style={{ color: "var(--release-green)" }}>${report.value_protected_usd.toLocaleString()}</span>
          </p>
        )}

        <ol className="space-y-2">
          {report.recommended_actions.map((a, i) => (
            <li key={i} className="flex gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              <span className="font-mono text-xs shrink-0" style={{ color: "var(--text-muted)" }}>{String(i + 1).padStart(2, "0")}</span>
              {a}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
