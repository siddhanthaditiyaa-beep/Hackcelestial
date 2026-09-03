import AnimatedNumber from "../AnimatedNumber";

const TONES = {
  neutral: "text-ink",
  positive: "text-status-resolved",
  negative: "text-status-disrupted",
  warning: "text-status-risk",
  brand: "text-brand",
};

export default function StatTile({ label, value, numericValue, format, tone = "neutral", className = "" }) {
  return (
    <div className={`rounded-sm bg-surface-sunk border border-border/60 py-2.5 px-2 text-center ${className}`}>
      <div className={`text-sm font-bold tabular-nums font-mono tracking-tight ${TONES[tone]}`}>
        {typeof numericValue === "number" ? (
          <AnimatedNumber value={numericValue} format={format} />
        ) : (
          value
        )}
      </div>
      <div className="text-[10px] text-ink-faint font-semibold uppercase tracking-wider mt-0.5">
        {label}
      </div>
    </div>
  );
}
