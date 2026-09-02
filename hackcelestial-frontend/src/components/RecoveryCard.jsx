import { motion } from "framer-motion";
import { Sparkles, Loader2, Check, Tag } from "lucide-react";
import { formatCurrency, formatMinutes } from "../utils/visuals";

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
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      transition={{ duration: 0.3 }}
      className={`relative rounded-3xl p-5 flex flex-col justify-between glass-panel transition-all overflow-hidden ${
        plan.recommended ? "border-coral ring-1 ring-coral/40 shadow-[0_0_30px_rgba(255,79,94,0.15)]" : "border-border/50 hover:border-border-strong hover:bg-surface-sunk/30"
      }`}
    >
      {/* Dynamic Background Glow for Recommended */}
      {plan.recommended && (
        <div className="absolute inset-0 bg-gradient-to-br from-coral-dim/30 to-transparent pointer-events-none z-0" />
      )}

      <div className="relative z-10">
        {plan.recommended && (
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute -top-3 left-4 inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-coral text-white shadow-[0_0_15px_rgba(255,79,94,0.6)]"
          >
            <Sparkles className="h-3 w-3 fill-white" />
            AI Top Pick
          </motion.span>
        )}

        <div className="flex items-start justify-between gap-3 pt-2">
          <div>
            <h4 className="font-display font-semibold text-lg text-ink leading-tight drop-shadow-sm">
              {plan.label}
            </h4>
            {plan.subtitle && (
              <p className="text-xs text-ink-dim mt-1.5 leading-relaxed">
                {plan.subtitle}
              </p>
            )}
          </div>
          {plan.badge && (
            <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-teal-dim/40 border border-teal/30 text-teal shadow-[0_0_10px_rgba(0,240,255,0.2)]">
              <Tag className="h-2.5 w-2.5" />
              {plan.badge}
            </span>
          )}
        </div>

        {/* 3 Metrics Chips */}
        <div className="grid grid-cols-3 gap-3 text-center mt-5">
          <div className="rounded-2xl bg-surface-sunk/50 border border-border/30 py-2.5 backdrop-blur-sm">
            <div
              className={`text-sm font-bold tabular-nums font-mono tracking-tight ${
                plan.costDelta > 0
                  ? "text-pink drop-shadow-[0_0_4px_rgba(227,28,95,0.4)]"
                  : plan.costDelta < 0
                  ? "text-teal drop-shadow-[0_0_4px_rgba(0,240,255,0.4)]"
                  : "text-ink-dim"
              }`}
            >
              {formatCurrency(plan.costDelta, currency)}
            </div>
            <div className="text-[10px] text-ink-faint font-semibold uppercase tracking-wider mt-0.5">net cost</div>
          </div>

          <div className="rounded-2xl bg-surface-sunk/50 border border-border/30 py-2.5 backdrop-blur-sm">
            <div
              className={`text-sm font-bold tabular-nums font-mono tracking-tight ${
                plan.timeDeltaMinutes > 0 ? "text-amber drop-shadow-[0_0_4px_rgba(255,180,0,0.4)]" : "text-teal drop-shadow-[0_0_4px_rgba(0,240,255,0.4)]"
              }`}
            >
              {formatMinutes(plan.timeDeltaMinutes)}
            </div>
            <div className="text-[10px] text-ink-faint font-semibold uppercase tracking-wider mt-0.5">schedule</div>
          </div>

          <div className="rounded-2xl bg-surface-sunk/50 border border-border/30 py-2.5 backdrop-blur-sm">
            <div className="text-sm font-bold tabular-nums font-mono text-ink tracking-tight">
              {plan.itineraryAffectedPct}%
            </div>
            <div className="text-[10px] text-ink-faint font-semibold uppercase tracking-wider mt-0.5">cascade</div>
          </div>
        </div>

        {/* Mitigations List */}
        {plan.mitigations && plan.mitigations.length > 0 && (
          <div className="mt-5 space-y-2 border-t border-border/30 pt-4 text-xs text-ink-dim/90">
            {plan.mitigations.slice(0, 2).map((m, i) => (
              <div key={i} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-teal shrink-0 drop-shadow-[0_0_2px_rgba(0,240,255,0.5)]" />
                <span className="line-clamp-2 leading-snug">{m}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-border/30 space-y-4 relative z-10">
        {/* Convenience Score */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-ink-faint mb-2 font-semibold uppercase tracking-wider">
            <span>Resilience Score</span>
            <span className="text-ink font-bold text-sm tracking-tight">{plan.convenienceScore}/100</span>
          </div>
          <div className="h-2 rounded-full bg-surface-sunk/80 overflow-hidden border border-border/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${plan.convenienceScore}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-teal-dim via-teal to-blue shadow-[0_0_10px_rgba(0,240,255,0.8)]"
            />
          </div>
        </div>

        <button
          onClick={() => onApply(plan.id)}
          disabled={disabled}
          className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl text-xs font-bold py-3.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
            plan.recommended
              ? "bg-coral text-white hover:brightness-110 shadow-[0_4px_15px_rgba(255,79,94,0.4)]"
              : "bg-surface-sunk border border-border/50 text-ink hover:bg-border/60 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          }`}
        >
          {disabled ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : "Apply This Plan"}
        </button>
      </div>
    </motion.div>
  );
}
