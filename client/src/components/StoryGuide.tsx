import { useEffect, useRef, useState } from "react";
import type { TourStep } from "../lib/storySteps";

interface Props {
  steps: TourStep[];
  storyLabel: string;
  onExit: () => void;
}

export default function StoryGuide({ steps, storyLabel, onExit }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);
  const step = steps[stepIndex];

  useEffect(() => {
    setRect(null);
    step?.onEnter?.();
    let attempts = 0;

    function tryLocate() {
      const el = step ? document.querySelector(step.targetSelector) : null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        window.setTimeout(() => setRect(el.getBoundingClientRect()), 280);
      } else if (attempts < 30) {
        attempts += 1;
        rafRef.current = window.requestAnimationFrame(tryLocate);
      }
    }
    tryLocate();
    return () => { if (rafRef.current) window.cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, step]);

  useEffect(() => {
    function reposition() {
      if (!step) return;
      const el = document.querySelector(step.targetSelector);
      if (el) setRect(el.getBoundingClientRect());
    }
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [step]);

  if (!step) return null;

  const pad = 10;
  const hasRect = !!rect;
  const boxStyle: React.CSSProperties = hasRect
    ? {
        position: "fixed", top: rect!.top - pad, left: rect!.left - pad, width: rect!.width + pad * 2, height: rect!.height + pad * 2,
        border: "1.5px solid var(--accent-warm)", boxShadow: "0 0 0 2000px rgba(8,8,8,0.82)",
        pointerEvents: "none", transition: "top 0.25s ease, left 0.25s ease, width 0.25s ease, height 0.25s ease", zIndex: 60,
      }
    : { position: "fixed", inset: 0, background: "rgba(8,8,8,0.82)", zIndex: 60 };

  const viewportW = typeof window !== "undefined" ? window.innerWidth : 1200;
  const viewportH = typeof window !== "undefined" ? window.innerHeight : 800;
  const cardWidth = 340;
  const cardTop = hasRect ? Math.min(viewportH - 210, Math.max(16, rect!.bottom + 16)) : viewportH / 2 - 110;
  const cardLeft = hasRect ? Math.min(Math.max(16, rect!.left), viewportW - cardWidth - 16) : viewportW / 2 - cardWidth / 2;

  return (
    <>
      <div style={boxStyle} />
      <div
        className="panel p-5 animate-in"
        style={{ position: "fixed", top: cardTop, left: cardLeft, width: cardWidth, zIndex: 61, background: "var(--bg-elevated)", borderColor: "var(--accent-warm)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="section-label" style={{ color: "var(--accent-warm)" }}>{storyLabel}</span>
          <button onClick={onExit} className="text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>Exit</button>
        </div>
        <h3 className="font-display text-xl mb-2" style={{ color: "var(--text-primary)" }}>{step.title}</h3>
        <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-secondary)" }}>{step.text}</p>
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>Step {stepIndex + 1} / {steps.length}</span>
          <div className="flex gap-2">
            {stepIndex > 0 && (
              <button onClick={() => setStepIndex(i => Math.max(0, i - 1))} className="px-3 py-1.5 text-xs tracking-wide border" style={{ borderColor: "var(--border-hairline)", color: "var(--text-secondary)" }}>Back</button>
            )}
            {stepIndex < steps.length - 1 ? (
              <button onClick={() => setStepIndex(i => Math.min(steps.length - 1, i + 1))} className="px-3 py-1.5 text-xs tracking-wide" style={{ background: "var(--accent-warm)", color: "var(--bg-primary)" }}>Next</button>
            ) : (
              <button onClick={onExit} className="px-3 py-1.5 text-xs tracking-wide" style={{ background: "var(--accent-warm)", color: "var(--bg-primary)" }}>Done</button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
