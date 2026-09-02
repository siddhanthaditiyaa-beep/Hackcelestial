import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import RecoveryCard from "./RecoveryCard";

export default function RecoveryList({ options, onApply, applying, resolvedPlan, onDismiss }) {
  if (resolvedPlan) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="rounded-3xl border border-teal-dim bg-teal-dim/60 p-6 text-center"
      >
        <div className="relative h-12 w-12 mx-auto mb-3">
          <motion.span
            className="absolute inset-0 rounded-2xl bg-teal/30"
            animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
            transition={{ duration: 1.2, repeat: 2, ease: "easeOut" }}
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.1 }}
            className="relative h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm"
          >
            <CheckCircle2 className="h-6 w-6 text-teal" />
          </motion.div>
        </div>
        <h3 className="font-display font-semibold text-base text-ink mb-1">
          Itinerary updated
        </h3>
        <p className="text-sm text-ink-dim mb-5">
          Applied: <span className="text-ink font-medium">{resolvedPlan.label}</span>
        </p>
        <button
          onClick={onDismiss}
          className="text-sm font-semibold px-5 py-2.5 rounded-full bg-white text-ink hover:bg-surface-sunk transition-colors shadow-sm"
        >
          Simulate another disruption
        </button>
      </motion.div>
    );
  }

  if (!options.length) return null;

  return (
    <div>
      <h3 className="font-display font-semibold text-base text-ink mb-3">
        Recovery options
      </h3>
      <div className="grid sm:grid-cols-2 gap-3.5">
        <AnimatePresence>
          {options.map((plan) => (
            <RecoveryCard
              key={plan.id}
              plan={plan}
              onApply={onApply}
              applying={applying}
              disabled={applying}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
