import type { StoryId } from "../lib/storySteps";

interface Props {
  isRunning: boolean;
  activeStory: StoryId | null;
  pendingStory: StoryId | null;
  onStart: (story: StoryId) => void;
}

export default function DemoGuide({ isRunning, activeStory, pendingStory, onStart }: Props) {
  return (
    <div className="panel px-6 py-5 mt-6 flex items-center justify-between flex-wrap gap-4 animate-in" style={{ borderColor: "var(--accent-warm)" }}>
      <div>
        <p className="section-label mb-1" style={{ color: "var(--accent-warm)" }}>Interactive demo guide</p>
        <p className="text-sm max-w-md" style={{ color: "var(--text-secondary)" }}>Click a story for a guided walkthrough of what Adam found, and why it matters.</p>
      </div>
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => onStart("rescue")}
          disabled={activeStory !== null}
          className="px-4 py-2.5 text-xs tracking-wide border transition-opacity disabled:opacity-40"
          style={{
            background: activeStory === "rescue" ? "var(--accent-warm)" : "transparent",
            color: activeStory === "rescue" ? "var(--bg-primary)" : "var(--text-primary)",
            borderColor: "var(--accent-warm)",
          }}
        >
          {pendingStory === "rescue" && isRunning ? "Running review…" : "👉 Story 1 — Save Batch A-104"}
        </button>
        <button
          onClick={() => onStart("drift")}
          disabled={activeStory !== null}
          className="px-4 py-2.5 text-xs tracking-wide border transition-opacity disabled:opacity-40"
          style={{
            background: activeStory === "drift" ? "var(--accent-warm)" : "transparent",
            color: activeStory === "drift" ? "var(--bg-primary)" : "var(--text-primary)",
            borderColor: "var(--accent-warm)",
          }}
        >
          {pendingStory === "drift" && isRunning ? "Running review…" : "👉 Story 2 — Detect Process Drift"}
        </button>
      </div>
    </div>
  );
}
