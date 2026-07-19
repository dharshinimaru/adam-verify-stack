import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AgentEvent, Batch, CrossSiteResult, EvaluationResult, LogEntry, VerificationReport, ViewMode } from "./lib/types";
import { allBatches as originalBatches } from "./data/batches";
import { applyAnomaly, buildResetLogEntry, buildSandboxLogEntries, computeSandboxEvaluation, type AnomalyKind } from "./lib/sandbox";
import { buildStorySteps, STORY_LABELS, type StoryId } from "./lib/storySteps";
import Header from "./components/Header";
import IntroHero from "./components/IntroHero";
import RunProgress from "./components/RunProgress";
import KeyFindings from "./components/KeyFindings";
import SiteDashboard from "./components/SiteDashboard";
import BatchDetail from "./components/BatchDetail";
import AgentLog from "./components/AgentLog";
import VerificationReportView from "./components/VerificationReport";
import RoiTracker from "./components/RoiTracker";
import CustomerReport from "./components/CustomerReport";
import Disclaimer from "./components/Disclaimer";
import StatusLegend from "./components/StatusLegend";
import DemoGuide from "./components/DemoGuide";
import StoryGuide from "./components/StoryGuide";

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
  const [phase, setPhase] = useState<"idle" | "batches" | "cross_site" | "report" | "done">("idle");
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  const [batches, setBatches] = useState<Batch[]>(() => originalBatches);
  const originalBatchesRef = useRef<Map<string, Batch>>(new Map(originalBatches.map(b => [b.batchId, b])));
  const preSandboxEvalRef = useRef<Map<string, EvaluationResult | undefined>>(new Map());
  const runStartRef = useRef<number | null>(null);

  const [activeStory, setActiveStory] = useState<StoryId | null>(null);
  const [pendingStory, setPendingStory] = useState<StoryId | null>(null);

  const siteA = useMemo(() => batches.filter(b => b.site === "Site A").map(b => b.batchId), [batches]);
  const siteB = useMemo(() => batches.filter(b => b.site === "Site B").map(b => b.batchId), [batches]);

  const run = useCallback(async () => {
    setIsRunning(true); setHasRun(true); setPhase("batches");
    setLogs([]); setEvaluations(new Map()); setCrossSite(null); setReport(null);
    setSelectedBatch(null); setValueProtected(0); setElapsedMs(null);
    preSandboxEvalRef.current.clear();
    setBatches([...originalBatchesRef.current.values()]);
    runStartRef.current = Date.now();
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
          if (data === "[DONE]") { setIsRunning(false); setProcessingId(null); setPhase("done"); continue; }
          try {
            const ev: AgentEvent = JSON.parse(data);
            if (ev.type === "log") {
              const l = ev.data as LogEntry;
              setLogs(p => [...p, l]);
              if (l.batch_id) setProcessingId(l.batch_id);
              if (l.message.includes("cross-site")) setPhase("cross_site");
              if (l.message.includes("verification report")) setPhase("report");
            } else if (ev.type === "evaluation") {
              const e = ev.data as EvaluationResult;
              setEvaluations(p => new Map(p).set(e.batch_id, e));
            } else if (ev.type === "cross_site") {
              setCrossSite(ev.data as CrossSiteResult);
              setPhase("cross_site");
            } else if (ev.type === "report") {
              const r = ev.data as VerificationReport;
              setReport(r);
              if (r.value_protected_usd) setValueProtected(r.value_protected_usd);
              setPhase("report");
            } else if (ev.type === "complete") {
              setIsRunning(false); setProcessingId(null); setPhase("done");
              if (runStartRef.current) setElapsedMs(Date.now() - runStartRef.current);
            }
          } catch { /* skip */ }
        }
      }
    } catch (e) {
      setLogs(p => [...p, { timestamp: new Date().toLocaleTimeString(), type: "error", message: String(e) }]);
    }
    setIsRunning(false); setProcessingId(null);
    if (runStartRef.current) setElapsedMs(Date.now() - runStartRef.current);
  }, []);

  const injectAnomaly = useCallback((batchId: string, kind: AnomalyKind) => {
    const current = batches.find(b => b.batchId === batchId);
    if (!current) return;
    if (!preSandboxEvalRef.current.has(batchId)) {
      preSandboxEvalRef.current.set(batchId, evaluations.get(batchId));
    }
    const mutated = applyAnomaly(current, kind);
    const evaluation = computeSandboxEvaluation(mutated);
    setBatches(prev => prev.map(b => (b.batchId === batchId ? mutated : b)));
    setEvaluations(prev => new Map(prev).set(batchId, evaluation));
    setLogs(prev => [...prev, ...buildSandboxLogEntries(mutated, kind, evaluation)]);
  }, [batches, evaluations]);

  const resetBatch = useCallback((batchId: string) => {
    const original = originalBatchesRef.current.get(batchId);
    if (!original) return;
    setBatches(prev => prev.map(b => (b.batchId === batchId ? original : b)));
    const priorEval = preSandboxEvalRef.current.get(batchId);
    setEvaluations(prev => {
      const next = new Map(prev);
      if (priorEval) next.set(batchId, priorEval); else next.delete(batchId);
      return next;
    });
    preSandboxEvalRef.current.delete(batchId);
    setLogs(prev => [...prev, buildResetLogEntry(batchId)]);
  }, []);

  const startStory = useCallback((story: StoryId) => {
    setViewMode("operations");
    if (isRunning || !hasRun) {
      setPendingStory(story);
      if (!isRunning) run();
      return;
    }
    setActiveStory(story);
  }, [isRunning, hasRun, run]);

  useEffect(() => {
    if (pendingStory && !isRunning && report) {
      setActiveStory(pendingStory);
      setPendingStory(null);
    }
  }, [pendingStory, isRunning, report]);

  const storySteps = useMemo(() => buildStorySteps(setSelectedBatch), []);

  const selEval = selectedBatch ? evaluations.get(selectedBatch) : null;
  const selBatch = selectedBatch ? batches.find(b => b.batchId === selectedBatch) : null;
  const isSelectedMutated = !!(selBatch && originalBatchesRef.current.get(selBatch.batchId) !== selBatch);
  const a104 = evaluations.get("A-104");

  const showDashboard = hasRun || isRunning;

  return (
    <div className="min-h-screen grid-bg">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Header isRunning={isRunning} hasRun={hasRun} onRun={run} valueProtected={valueProtected}
          batchesProcessed={evaluations.size} totalBatches={batches.length} viewMode={viewMode} onViewModeChange={setViewMode} />

        {viewMode === "operations" && (
          <DemoGuide isRunning={isRunning} activeStory={activeStory} pendingStory={pendingStory} onStart={startStory} />
        )}

        {viewMode === "operations" ? (
          <>
            {!showDashboard && <IntroHero onRun={run} isRunning={isRunning} />}

            {showDashboard && (
              <>
                <RunProgress isRunning={isRunning} hasRun={hasRun} phase={phase}
                  batchesDone={evaluations.size} totalBatches={batches.length} />

                <KeyFindings a104={a104} crossSite={crossSite} onSelectBatch={setSelectedBatch} />

                <section className="py-10">
                  <p className="section-label mb-2">Batch overview</p>
                  <h2 className="font-display text-3xl font-normal mb-2">All manufacturing batches.</h2>
                  <p className="text-sm mb-4 max-w-xl" style={{ color: "var(--text-secondary)" }}>
                    Click any batch for full agent reasoning. Status updates live during the review.
                  </p>
                  <StatusLegend />

                  <div className={`grid gap-8 mt-4 ${selectedBatch ? "lg:grid-cols-[1fr_340px]" : ""}`}>
                    <SiteDashboard siteALabel="Site A" siteBLabel="Site B" siteABatchIds={siteA} siteBBatchIds={siteB}
                      evaluations={evaluations} processingId={processingId} selectedId={selectedBatch} onSelect={setSelectedBatch} />
                    {selectedBatch && selEval && selBatch && (
                      <BatchDetail
                        evaluation={selEval}
                        batch={selBatch}
                        onClose={() => setSelectedBatch(null)}
                        isMutated={isSelectedMutated}
                        onInject={kind => injectAnomaly(selBatch.batchId, kind)}
                        onReset={() => resetBatch(selBatch.batchId)}
                      />
                    )}
                  </div>
                </section>

                {report && <VerificationReportView report={report} />}
                {report && <RoiTracker report={report} evaluations={evaluations} elapsedMs={elapsedMs} />}
                <AgentLog logs={logs} isRunning={isRunning} />
              </>
            )}
            <Disclaimer />
          </>
        ) : (
          <>
            <CustomerReport report={report} evaluations={evaluations} batchIds={batches.map(b => b.batchId)} />
            <Disclaimer />
          </>
        )}
      </div>

      {activeStory && (
        <StoryGuide
          key={activeStory}
          steps={storySteps[activeStory]}
          storyLabel={STORY_LABELS[activeStory]}
          onExit={() => setActiveStory(null)}
        />
      )}
    </div>
  );
}
