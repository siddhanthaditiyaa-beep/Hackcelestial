import { motion } from "framer-motion";
import { Sparkle, Loader2 } from "lucide-react";
import { formatINR, formatMinutes } from "../utils/visuals";
import AnimatedNumber from "./AnimatedNumber";

export default function RecoveryCard({ plan, onApply, applying, disabled }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-3xl border-2 p-5 flex flex-col gap-4 bg-surface ${
        plan.recommended ? "border-coral" : "border-border"
      }`}
    >
      {plan.recommended && (
        <span className="absolute -top-3 left-5 inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-coral text-white shadow-sm">
          <Sparkle className="h-3 w-3 fill-white" />
          Best pick
        </span>
      )}

      <h4 className="font-display font-semibold text-sm text-ink leading-snug pr-2 pt-1">
        {plan.label}
      </h4>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-surface-sunk py-2.5">
          <div
            className={`text-sm font-bold tabular-nums ${
              plan.costDelta > 0 ? "text-pink" : plan.costDelta < 0 ? "text-teal" : "text-ink-dim"
            }`}
          >
            {formatINR(plan.costDelta)}
          </div>
          <div className="text-[10px] text-ink-faint font-medium mt-0.5">cost</div>
        </div>
        <div className="rounded-2xl bg-surface-sunk py-2.5">
          <div
            className={`text-sm font-bold tabular-nums ${
              plan.timeDeltaMinutes > 0 ? "text-amber" : "text-teal"
            }`}
          >
            {formatMinutes(plan.timeDeltaMinutes)}
          </div>
          <div className="text-[10px] text-ink-faint font-medium mt-0.5">time</div>
        </div>
        <div className="rounded-2xl bg-surface-sunk py-2.5">
          <div className="text-sm font-bold tabular-nums text-ink">
            {plan.itineraryAffectedPct}%
          </div>
          <div className="text-[10px] text-ink-faint font-medium mt-0.5">affected</div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-[11px] text-ink-faint mb-1.5 font-semibold">
          <span>Convenience</span>
          <span><AnimatedNumber value={plan.convenienceScore} />/100</span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-sunk overflow-hidden">
          <motion.div
            className="h-full bg-teal rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${plan.convenienceScore}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onApply(plan.id)}
        disabled={disabled}
        className={`mt-1 inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold py-3 transition disabled:opacity-40 disabled:cursor-not-allowed ${
          plan.recommended
            ? "bg-coral text-white hover:brightness-105"
            : "bg-surface-sunk text-ink hover:bg-border"
        }`}
      >
        {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply this plan"}
      </motion.button>
    </motion.div>
  );
}
