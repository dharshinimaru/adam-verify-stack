import { useState, useCallback } from "react";
import type { AgentEvent, CrossSiteResult, EvaluationResult, LogEntry, VerificationReport, ViewMode } from "./lib/types";
import { allBatches } from "./data/batches";
import Header from "./components/Header";
import SiteDashboard from "./components/SiteDashboard";
import BatchDetail from "./components/BatchDetail";
import AgentLog from "./components/AgentLog";
import CrossSiteAlert from "./components/CrossSiteAlert";
import CrossSiteChart from "./components/CrossSiteChart";
import VerificationReportView from "./components/VerificationReport";
import CustomerReport from "./components/CustomerReport";
import Disclaimer from "./components/Disclaimer";

export default function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [evaluations, setEvaluations] = useState<Map<string, EvaluationResult>>(new Map());
  const [crossSite, setCrossSite] = useState<CrossSiteResult | null>(null);
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [valueProtected, setValueProtected] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("operations");

  const siteA = allBatches.filter(b => b.site === "Site A").map(b => b.batchId);
  const siteB = allBatches.filter(b => b.site === "Site B").map(b => b.batchId);

  const run = useCallback(async () => {
    setIsRunning(true); setHasRun(true);
    setLogs([]); setEvaluations(new Map()); setCrossSite(null); setReport(null);
    setSelectedBatch(null); setValueProtected(0);
    try {
      const res = await fetch("/api/verify", { method: "POST" });
      const reader = res.body?.getReader();
      if (!reader) return;
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") { setIsRunning(false); setProcessingId(null); continue; }
          try {
            const ev: AgentEvent = JSON.parse(data);
            if (ev.type === "log") {
              const l = ev.data as LogEntry;
              setLogs(p => [...p, l]);
              if (l.batch_id) setProcessingId(l.batch_id);
            } else if (ev.type === "evaluation") {
              const e = ev.data as EvaluationResult;
              setEvaluations(p => new Map(p).set(e.batch_id, e));
            } else if (ev.type === "cross_site") setCrossSite(ev.data as CrossSiteResult);
            else if (ev.type === "report") {
              const r = ev.data as VerificationReport;
              setReport(r);
              if (r.value_protected_usd) setValueProtected(r.value_protected_usd);
            } else if (ev.type === "complete") { setIsRunning(false); setProcessingId(null); }
          } catch { /* skip */ }
        }
      }
    } catch (e) {
      setLogs(p => [...p, { timestamp: new Date().toLocaleTimeString(), type: "error", message: String(e) }]);
    }
    setIsRunning(false); setProcessingId(null);
  }, []);

  const selEval = selectedBatch ? evaluations.get(selectedBatch) : null;
  const selBatch = selectedBatch ? allBatches.find(b => b.batchId === selectedBatch) : null;

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-[1320px] mx-auto px-6 py-6">
        <Header isRunning={isRunning} hasRun={hasRun} onRun={run} valueProtected={valueProtected}
          batchesProcessed={evaluations.size} totalBatches={allBatches.length} viewMode={viewMode} onViewModeChange={setViewMode} />
        {viewMode === "operations" ? (
          <>
            {crossSite && <CrossSiteAlert crossSite={crossSite} />}
            {crossSite && <CrossSiteChart crossSite={crossSite} />}
            <div className="flex gap-6 mt-6">
              <div className={`flex-1 ${selectedBatch ? "max-w-[60%]" : ""}`}>
                <SiteDashboard siteALabel="Site A" siteBLabel="Site B" siteABatchIds={siteA} siteBBatchIds={siteB}
                  evaluations={evaluations} processingId={processingId} selectedId={selectedBatch} onSelect={setSelectedBatch} />
                {report && <VerificationReportView report={report} />}
                <AgentLog logs={logs} isRunning={isRunning} />
                <Disclaimer />
              </div>
              {selectedBatch && selEval && selBatch && (
                <div className="w-[40%] sticky top-6 self-start">
                  <BatchDetail evaluation={selEval} batch={selBatch} onClose={() => setSelectedBatch(null)} />
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <CustomerReport report={report} evaluations={evaluations} batchIds={allBatches.map(b => b.batchId)} />
            <Disclaimer />
          </>
        )}
      </div>
    </main>
  );
}
