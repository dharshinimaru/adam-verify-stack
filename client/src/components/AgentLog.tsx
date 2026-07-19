import { useEffect, useRef } from "react";
import type { LogEntry } from "../lib/types";

const colors: Record<string, string> = {
  info: "var(--text-secondary)", success: "var(--release-green)", warning: "var(--rescue-amber)",
  error: "var(--reject-red)", drift: "var(--drift-purple)", action: "var(--accent-blue)", report: "var(--accent-blue)",
};

export default function AgentLog({ logs, isRunning }: { logs: LogEntry[]; isRunning: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-xs uppercase" style={{ color: "var(--text-muted)" }}>Agent Log</h2>
        {isRunning && <span className="text-xs" style={{ color: "var(--accent-blue)" }}>● Live</span>}
      </div>
      <div className="agent-log rounded-xl border p-4 overflow-y-auto font-mono text-[13px] leading-6" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)", height: 360 }}>
        {!logs.length && <div className="flex items-center justify-center h-full" style={{ color: "var(--text-muted)" }}>Click Run Verification</div>}
        {logs.map((log, i) => {
          const parts = log.message.split(" ⟡ Gemini");
          return (
            <div key={i} className="flex gap-3">
              <span className="shrink-0 tabular-nums" style={{ color: "var(--text-muted)" }}>{log.timestamp}</span>
              <span style={{ color: colors[log.type] || "var(--text-secondary)" }}>
                {parts[0]}{parts.length > 1 && <span style={{ color: "var(--accent-blue)" }}> ⟡ Gemini</span>}
              </span>
            </div>
          );
        })}
        <div ref={ref} />
      </div>
    </div>
  );
}
