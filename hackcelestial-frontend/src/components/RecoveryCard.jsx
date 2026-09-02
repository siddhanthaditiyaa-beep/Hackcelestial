import { motion } from "framer-motion";
import { Sparkle, Loader2, Check, Tag } from "lucide-react";
import { formatCurrency, formatMinutes } from "../utils/visuals";

export default function RecoveryCard({
  plan,
  onApply,
  disabled,
  currency = "INR",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-3xl border-2 p-5 flex flex-col justify-between bg-surface shadow-xs transition-all ${
        plan.recommended ? "border-coral ring-2 ring-coral/10" : "border-border"
      }`}
    >
      <div>
        {plan.recommended && (
          <span className="absolute -top-3 left-5 inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-coral text-white shadow-sm">
            <Sparkle className="h-3 w-3 fill-white" />
            Recommended Resilience Pick
          </span>
        )}

        <div className="flex items-start justify-between gap-2 pt-1">
          <div>
            <h4 className="font-display font-semibold text-sm text-ink leading-snug">
              {plan.label}
            </h4>
            {plan.subtitle && (
              <p className="text-xs text-ink-dim mt-0.5 leading-relaxed">
                {plan.subtitle}
              </p>
            )}
          </div>
          {plan.badge && (
            <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-dim text-teal">
              <Tag className="h-2.5 w-2.5" />
              {plan.badge}
            </span>
          )}
        </div>

        {/* 3 Metrics Chips */}
        <div className="grid grid-cols-3 gap-2 text-center mt-3.5">
          <div className="rounded-2xl bg-surface-sunk py-2">
            <div
              className={`text-xs font-bold tabular-nums font-mono ${
                plan.costDelta > 0
                  ? "text-pink"
                  : plan.costDelta < 0
                  ? "text-teal"
                  : "text-ink-dim"
              }`}
            >
              {formatCurrency(plan.costDelta, currency)}
            </div>
            <div className="text-[10px] text-ink-faint font-medium">net cost</div>
          </div>

          <div className="rounded-2xl bg-surface-sunk py-2">
            <div
              className={`text-xs font-bold tabular-nums font-mono ${
                plan.timeDeltaMinutes > 0 ? "text-amber" : "text-teal"
              }`}
            >
              {formatMinutes(plan.timeDeltaMinutes)}
            </div>
            <div className="text-[10px] text-ink-faint font-medium">schedule</div>
          </div>

          <div className="rounded-2xl bg-surface-sunk py-2">
            <div className="text-xs font-bold tabular-nums font-mono text-ink">
              {plan.itineraryAffectedPct}%
            </div>
            <div className="text-[10px] text-ink-faint font-medium">cascade</div>
          </div>
        </div>

        {/* Mitigations List */}
        {plan.mitigations && plan.mitigations.length > 0 && (
          <div className="mt-3.5 space-y-1.5 border-t border-border-light pt-2.5 text-[11px] text-ink-dim">
            {plan.mitigations.slice(0, 2).map((m, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <Check className="h-3.5 w-3.5 text-teal shrink-0 mt-0.5" />
                <span className="line-clamp-1">{m}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border-light space-y-3">
        {/* Convenience Score */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-ink-faint mb-1 font-semibold">
            <span>Convenience & Resilience Score</span>
            <span className="text-ink font-bold">{plan.convenienceScore}/100</span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-sunk overflow-hidden">
            <div
              className="h-full bg-teal rounded-full transition-all duration-500"
              style={{ width: `${plan.convenienceScore}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => onApply(plan.id)}
          disabled={disabled}
          className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl text-xs font-semibold py-3 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
            plan.recommended
              ? "bg-coral text-white hover:brightness-105 shadow-xs"
              : "bg-surface-sunk text-ink hover:bg-border"
          }`}
        >
          {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply This Plan"}
        </button>
      </div>
    </motion.div>
  );
}
