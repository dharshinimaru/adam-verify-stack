# Adam Verify — Google AI Studio Import Guide

Use this repo with **Google AI Studio → Build → Import from GitHub**.

- **Repo:** `dharshinimaru/adam-verify-stack`
- **Branch:** `cursor/interactive-demo-enhancements` (or `main` after merge)
- **Local dev:** `npm run dev` → UI at `http://localhost:5173`, API at `:3002`

## Import steps

1. Open [Google AI Studio](https://aistudio.google.com) → **Build**
2. Click **+** → **Import from GitHub**
3. Select `dharshinimaru/adam-verify-stack`
4. Choose branch `cursor/interactive-demo-enhancements`
5. Wait for conversion, then open **Preview** and **Code** tabs

## After import — paste these prompts if preview breaks

### Fix API routing + SSE streaming

```
This is a full-stack Adam Verify demo. The Express server streams verification events via SSE from POST /api/verify. The React client fetches /api/verify and reads the event stream.

Ensure:
1. Server-side route POST /api/verify exists and returns text/event-stream
2. Client fetch calls /api/verify (not localhost:3002 directly)
3. GEMINI_API_KEY is read server-side only from environment variable
4. Static batch data from server/data/siteA.json and siteB.json loads correctly

Do not remove the deterministic fallback logic in server/src/fallbacks.ts — the demo must work offline.
```

### Fix monorepo layout (client + server)

```
This repo has client/ (Vite React) and server/ (Express). Merge into AI Studio's full-stack runtime format:
- React UI serves the dashboard
- Express handles /api/verify SSE endpoint
- Proxy /api/* from frontend to backend in preview

Keep all components: DemoGuide, StoryGuide, SandboxPanel, GoldenEnvelopeChart, RoiTracker, KeyFindings, RunProgress.
```

### Verify demo stories still work

```
After fixing routing, confirm the agent run produces both demo stories:
1. A-104 flagged for retest (assay noise) — potency 44, telemetry healthy
2. B-203/B-204 site drift watch — cross-site expansion kinetics drift

Run verification and check Key Findings, batch cards, and verification report appear.
Set FORCE_FALLBACK=1 if Gemini API is unavailable.
```

## Publish to Cloud Run

1. Click **Publish** in Build mode
2. Use **Starter Tier** (free) or link a Google Cloud project
3. Share the public Cloud Run URL for demos

## Sync loop (Cursor ↔ AI Studio)

| Edit in | Action |
|---------|--------|
| Cursor | `git push` → re-import or sync in AI Studio |
| AI Studio | Push to GitHub → `git pull` in Cursor |

## Environment variables

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Google Gemini API (server-side only) |
| `FORCE_FALLBACK=1` | Skip Gemini, use deterministic demo data |
| `BATCH_PACE_MS` | Delay between batch evaluations (default 1800) |
| `PORT` | API port (default 3002) |

## Demo checklist

- [ ] Start review completes in ~15–30s
- [ ] A-104 shows "Retest recommended" + assay noise
- [ ] Cross-site chart shows Site A vs B-203 drift
- [ ] Story Mode walkthrough works (both stories)
- [ ] Sandbox inject buttons recalculate scores on batch detail
- [ ] ROI tracker shows value protected after report
