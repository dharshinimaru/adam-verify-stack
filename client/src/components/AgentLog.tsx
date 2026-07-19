import { useEffect, useRef, useState } from "react";
import type { LogEntry } from "../lib/types";

const colors: Record<string, string> = {
  info: "var(--text-secondary)", success: "var(--release-green)", warning: "var(--rescue-amber)",
  error: "var(--reject-red)", drift: "var(--drift-purple)", action: "var(--accent-warm)", report: "var(--text-primary)",
};

export default function AgentLog({ logs, isRunning }: { logs: LogEntry[]; isRunning: boolean }) {
  const [open, setOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs, open]);

  return (
    <section className="panel mt-px">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between p-5 text-left">
        <div>
          <p className="section-label">Agent reasoning</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {isRunning ? "Live evaluation log" : logs.length ? `${logs.length} entries` : "Starts when you run verification"}
          </p>
        </div>
        <span className="text-xs tracking-widest" style={{ color: "var(--text-muted)" }}>{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <div className="agent-log border-t px-5 py-4 overflow-y-auto font-mono text-xs leading-6 max-h-72" style={{ borderColor: "var(--border-hairline)" }}>
          {!logs.length && (
            <p style={{ color: "var(--text-muted)" }}>The agent will stream its evaluation steps here.</p>
          )}
          {logs.map((log, i) => (
            <div key={i} className="flex gap-4 py-0.5">
              <span className="shrink-0 tabular-nums w-16" style={{ color: "var(--text-muted)" }}>{log.timestamp}</span>
              <span style={{ color: colors[log.type] || "var(--text-secondary)" }}>{log.message}</span>
            </div>
          ))}
          {isRunning && <span className="inline-block animate-pulse mt-2" style={{ color: "var(--accent-warm)" }}>▊</span>}
          <div ref={bottomRef} />
        </div>
      )}
    </section>
  );
}
