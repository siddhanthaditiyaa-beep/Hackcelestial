import { motion } from "framer-motion";
import { Sparkles, Loader2, Check, Tag } from "lucide-react";
import { formatCurrency, formatMinutes } from "../utils/visuals";
import StatTile from "./ui/StatTile";

export default function RecoveryCard({
  plan,
  onApply,
  disabled,
  currency = "INR",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!disabled ? { y: -2 } : {}}
      transition={{ duration: 0.25 }}
      className={`relative rounded-lg p-5 flex flex-col justify-between bg-surface border transition-all overflow-hidden ${
        plan.recommended ? "border-brand ring-1 ring-brand/30 shadow-md" : "border-border hover:border-border-strong shadow-sm hover:shadow-md"
      }`}
    >
      <div className="relative z-10">
        {plan.recommended && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute -top-3 left-4 inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-brand text-brand-ink shadow-sm"
          >
            <Sparkles className="h-3 w-3" />
            AI Top Pick
          </motion.span>
        )}

        <div className="flex items-start justify-between gap-3 pt-2">
          <div>
            <h4 className="font-display font-medium text-lg text-ink leading-tight">
              {plan.label}
            </h4>
            {plan.subtitle && (
              <p className="text-xs text-ink-dim mt-1.5 leading-relaxed">
                {plan.subtitle}
              </p>
            )}
          </div>
          {plan.badge && (
            <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-sm bg-status-resolved-dim border border-status-resolved/30 text-status-resolved">
              <Tag className="h-2.5 w-2.5" />
              {plan.badge}
            </span>
          )}
        </div>

        {/* 3 Metrics Chips */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <StatTile
            label="net cost"
            numericValue={plan.costDelta}
            format={(n) => formatCurrency(n, currency)}
            tone={plan.costDelta > 0 ? "negative" : plan.costDelta < 0 ? "positive" : "neutral"}
          />
          <StatTile
            label="schedule"
            numericValue={plan.timeDeltaMinutes}
            format={(n) => formatMinutes(n)}
            tone={plan.timeDeltaMinutes > 0 ? "warning" : "positive"}
          />
          <StatTile
            label="cascade"
            value={`${plan.itineraryAffectedPct}%`}
            tone="neutral"
          />
        </div>

        {/* Mitigations List */}
        {plan.mitigations && plan.mitigations.length > 0 && (
          <div className="mt-5 space-y-2 border-t border-border pt-4 text-xs text-ink-dim">
            {plan.mitigations.slice(0, 2).map((m, i) => (
              <div key={i} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-status-resolved shrink-0" />
                <span className="line-clamp-2 leading-snug">{m}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-border space-y-4 relative z-10">
        {/* Convenience Score */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-ink-faint mb-2 font-semibold uppercase tracking-wider">
            <span>Resilience Score</span>
            <span className="text-ink font-bold text-sm tracking-tight">{plan.convenienceScore}/100</span>
          </div>
          <div className="h-2 rounded-full bg-surface-sunk overflow-hidden border border-border/40">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${plan.convenienceScore}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-status-resolved"
            />
          </div>
        </div>

        <button
          onClick={() => onApply(plan.id)}
          disabled={disabled}
          className={`w-full inline-flex items-center justify-center gap-2 rounded-sm text-xs font-bold py-3.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
            plan.recommended
              ? "bg-brand text-brand-ink hover:brightness-105 shadow-sm"
              : "bg-surface-sunk border border-border text-ink hover:bg-border/60"
          }`}
        >
          {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply This Plan"}
        </button>
      </div>
    </motion.div>
  );
}
