export interface TourStep {
  targetSelector: string;
  title: string;
  text: string;
  onEnter?: () => void;
}

export type StoryId = "rescue" | "drift";

export const STORY_LABELS: Record<StoryId, string> = {
  rescue: "Story 1 — Save Batch A-104 (The Rescue)",
  drift: "Story 2 — Detect Process Drift (Cross-Site)",
};

export function buildStorySteps(selectBatch: (id: string | null) => void): Record<StoryId, TourStep[]> {
  return {
    rescue: [
      {
        targetSelector: '[data-tour="batch-A-104"]',
        title: "The problem",
        text: "A-104's potency assay failed at 44 — below the release threshold of 50. Under a standard protocol, this batch would be discarded automatically, no questions asked.",
        onEnter: () => selectBatch("A-104"),
      },
      {
        targetSelector: '[data-tour="assay-telemetry"]',
        title: "Check the process trajectory",
        text: "The 6-day expansion kinetics and metabolic trajectories are identical to confirmed batches A-101–A-103 — right inside the golden envelope. Only the assay reading is off.",
      },
      {
        targetSelector: '[data-tour="rationale"]',
        title: "The agent's call",
        text: "Adam Verify flags this as likely assay noise, not a genuine failure, and recommends a confirmatory retest instead of automatic disposal.",
      },
      {
        targetSelector: '[data-tour="confirmatory-action"]',
        title: "The rescue",
        text: "Instead of discarding an irreplaceable, patient-specific batch, the agent recommends a fresh-aliquot retest — preserving roughly $300K of value pending confirmation.",
      },
      {
        targetSelector: '[data-tour="value-protected"]',
        title: "Commercial impact",
        text: "That single catch shows up directly in the value-protected metric in the header — real dollars, tied to a real batch decision, not a demo trick.",
      },
    ],
    drift: [
      {
        targetSelector: '[data-tour="site-b-group"]',
        title: "Nothing looks wrong… yet",
        text: "Individually, every Site B batch passes its own internal spec (< 30h expansion). Site B's own QC system sees no problem with any single batch.",
        onEnter: () => selectBatch(null),
      },
      {
        targetSelector: '[data-tour="cross-site-chart"]',
        title: "Compare both sites",
        text: "Plotted against Site A's flat ~24h baseline, B-203's 6-day expansion kinetics climb progressively from 25.5h to 28.6h — a drift Site A never shows.",
      },
      {
        targetSelector: '[data-tour="batch-B-204"]',
        title: "The furthest point",
        text: "By B-204, harvest-day expansion has reached 29.5h and metabolic stability has fallen to 0.68 — still under Site B's own 30h spec, but far outside Site A's baseline.",
        onEnter: () => selectBatch("B-204"),
      },
      {
        targetSelector: '[data-tour="site-drift-stat"]',
        title: "Escalation",
        text: "Adam Verify flags these batches as Drift watch and recommends a process investigation before the trend becomes a genuine batch failure — a finding neither site could have made alone.",
      },
    ],
  };
}
