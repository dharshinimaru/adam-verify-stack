import type { Batch } from "../lib/types";

interface Props { batch: Batch; }

// Nominal band derived from Site A's confirmed-healthy batches (A-101–A-103 span ~23.7–24.4h).
const ENVELOPE_MIN = 23;
const ENVELOPE_MAX = 25.5;
const POTENCY_THRESHOLD = 50;

const LEFT = 48;
const RIGHT = 352;
const TOP = 14;
const BOTTOM = 128;

export default function GoldenEnvelopeChart({ batch }: Props) {
  const days = batch.expansionKinetics;
  const n = days.length;

  const leftMin = Math.min(ENVELOPE_MIN - 1, ...days) - 0.5;
  const leftMax = Math.max(ENVELOPE_MAX + 1, ...days) + 0.5;
  const leftRange = leftMax - leftMin;

  const toX = (i: number) => LEFT + (i * (RIGHT - LEFT)) / (n - 1);
  const toYLeft = (v: number) => BOTTOM - ((v - leftMin) / leftRange) * (BOTTOM - TOP);
  const toYRight = (v: number) => BOTTOM - (v / 100) * (BOTTOM - TOP);

  const bandTop = toYLeft(ENVELOPE_MAX);
  const bandBottom = toYLeft(ENVELOPE_MIN);

  const linePoints = days.map((v, i) => `${toX(i)},${toYLeft(v)}`).join(" ");
  const potencyX = toX(n - 1) + 26;
  const potencyY = toYRight(batch.potencyAssayResult.score);
  const potencyFail = batch.potencyAssayResult.result === "fail";

  return (
    <div className="border" style={{ borderColor: "var(--border-hairline)" }}>
      <div className="flex items-center justify-between px-4 pt-4 flex-wrap gap-2">
        <p className="section-label">Process correlation — telemetry vs. release assay</p>
        <div className="flex gap-4 text-[11px]">
          <span className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            <span className="inline-block w-3 h-2" style={{ background: "rgba(201,146,74,0.14)", border: "1px solid var(--accent-warm)" }} />
            Golden envelope
          </span>
          <span className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: "var(--accent-warm)" }} />
            Expansion kinetics
          </span>
          <span className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: potencyFail ? "var(--reject-red)" : "var(--release-green)" }} />
            Potency assay
          </span>
        </div>
      </div>

      <svg viewBox="0 0 400 148" className="w-full h-44 mt-2">
        <rect x={LEFT} y={bandTop} width={RIGHT - LEFT} height={bandBottom - bandTop} fill="var(--accent-warm)" opacity={0.12} />
        <line x1={LEFT} x2={RIGHT} y1={bandTop} y2={bandTop} stroke="var(--accent-warm)" strokeOpacity={0.35} strokeDasharray="2 3" />
        <line x1={LEFT} x2={RIGHT} y1={bandBottom} y2={bandBottom} stroke="var(--accent-warm)" strokeOpacity={0.35} strokeDasharray="2 3" />

        <line x1={LEFT} x2={potencyX + 8} y1={toYRight(POTENCY_THRESHOLD)} y2={toYRight(POTENCY_THRESHOLD)} stroke="var(--reject-red)" strokeOpacity={0.45} strokeDasharray="4 3" />
        <text x={potencyX + 10} y={toYRight(POTENCY_THRESHOLD) + 3} fontSize="8" fill="var(--reject-red)" fontFamily="JetBrains Mono" opacity={0.75}>50</text>

        <polyline points={linePoints} fill="none" stroke="var(--accent-warm)" strokeWidth="2" />
        {days.map((v, i) => (
          <circle key={i} cx={toX(i)} cy={toYLeft(v)} r="3" fill="var(--accent-warm)" />
        ))}

        <line x1={toX(n - 1)} x2={potencyX} y1={toYLeft(days[n - 1])} y2={potencyY} stroke="var(--border-strong)" strokeDasharray="3 3" />
        <circle cx={potencyX} cy={potencyY} r="4.5" fill={potencyFail ? "var(--reject-red)" : "var(--release-green)"} />
        <text x={potencyX} y={potencyY - 10} fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle" fill={potencyFail ? "var(--reject-red)" : "var(--release-green)"}>{batch.potencyAssayResult.score}</text>

        {days.map((_, i) => (
          <text key={`d${i}`} x={toX(i)} y={BOTTOM + 14} fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle" fill="var(--text-muted)">D{i + 1}</text>
        ))}
        <text x={potencyX} y={BOTTOM + 14} fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle" fill="var(--text-muted)">Assay</text>
      </svg>

      <p className="text-[11px] px-4 pb-4 italic" style={{ color: "var(--text-muted)" }}>
        Expansion kinetics (left axis, solid) tracked against the golden envelope across all 6 culture days. The release assay (right axis, 0–100) is a single harvest-day reading — watch it break below the red threshold while telemetry stays flat.
      </p>
    </div>
  );
}
