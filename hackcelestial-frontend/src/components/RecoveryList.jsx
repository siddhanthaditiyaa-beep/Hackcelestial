import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Table,
  LayoutGrid,
  Sparkles,
} from "lucide-react";
import RecoveryCard from "./RecoveryCard";
import { formatCurrency, formatMinutes } from "../utils/visuals";

export default function RecoveryList({
  options,
  onApply,
  applying,
  resolvedPlan,
  onDismiss,
  appliedDiffs = [],
  financialSummary = null,
  currency = "INR",
  onOpenCopilot,
}) {
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "matrix"

  if (resolvedPlan) {
    const currSym = currency === "INR" ? "₹" : currency === "EUR" ? "€" : currency === "JPY" ? "¥" : "$";

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border border-teal-dim bg-teal-dim/60 p-6 text-center space-y-4"
      >
        <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="h-6 w-6 text-teal" />
        </div>

        <div>
          <h3 className="font-display font-semibold text-base text-ink mb-1">
            Itinerary Reconstituted & Secured
          </h3>
          <p className="text-xs text-ink-dim leading-relaxed">
            Applied: <span className="text-ink font-semibold">{resolvedPlan.label}</span>
          </p>
        </div>

        {/* Financial & Schedule Reconstitution Summary */}
        {financialSummary && (
          <div className="bg-white/80 p-3.5 rounded-2xl border border-border-light text-xs text-ink-dim grid grid-cols-2 gap-2 text-left">
            <div>
              <span className="text-[10px] text-ink-faint font-semibold uppercase block">
                Recovered Refunds
              </span>
              <span className="font-bold text-teal font-mono">
                {currSym}{financialSummary.refundTotal.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-ink-faint font-semibold uppercase block">
                Net Expense Delta
              </span>
              <span className="font-bold text-ink font-mono">
                {currSym}{financialSummary.costDeltaTotal.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Realigned Bookings List */}
        {appliedDiffs.length > 0 && (
          <div className="text-left bg-white/60 p-3 rounded-2xl border border-border-light text-[11px] space-y-1.5">
            <span className="font-bold text-ink block mb-1">
              Synchronized Schedule Adjustments:
            </span>
            {appliedDiffs.map((diff, i) => (
              <div key={i} className="flex items-center gap-1.5 text-ink-dim">
                <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                <span className="font-medium text-ink">{diff.title}:</span>
                <span className="truncate">{diff.details}</span>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          {onOpenCopilot && (
            <button
              onClick={onOpenCopilot}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl bg-coral text-white hover:brightness-105 transition-colors shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              View AI Concierge Brief
            </button>
          )}
          <button
            onClick={onDismiss}
            className="w-full sm:w-auto text-xs font-semibold px-4 py-2.5 rounded-xl bg-white text-ink hover:bg-surface-sunk transition-colors shadow-xs"
          >
            Simulate Another Disruption
          </button>
        </div>
      </motion.div>
    );
  }

  if (!options.length) return null;

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display font-semibold text-base text-ink">
          Generated Recovery Options
        </h3>
        {/* Toggle between Grid and Comparison Matrix Table */}
        <div className="flex items-center gap-1 bg-surface-sunk p-1 rounded-xl border border-border">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === "grid"
                ? "bg-surface text-ink shadow-xs"
                : "text-ink-faint hover:text-ink"
            }`}
            title="Card Grid View"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode("matrix")}
            className={`p-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === "matrix"
                ? "bg-surface text-ink shadow-xs"
                : "text-ink-faint hover:text-ink"
            }`}
            title="Comparison Matrix Table"
          >
            <Table className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid gap-3.5">
          <AnimatePresence>
            {options.map((plan) => (
              <RecoveryCard
                key={plan.id}
                plan={plan}
                onApply={onApply}
                applying={applying}
                disabled={applying}
                currency={currency}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Side-by-Side Trade-off Comparison Matrix Table */
        <div className="rounded-3xl border border-border bg-surface overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-sunk border-b border-border text-ink-faint font-semibold">
                <tr>
                  <th className="p-3">Plan Option</th>
                  <th className="p-3">Cost Delta</th>
                  <th className="p-3">Schedule</th>
                  <th className="p-3">Cascade %</th>
                  <th className="p-3">Convenience</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {options.map((plan) => (
                  <tr
                    key={plan.id}
                    className={`hover:bg-surface-sunk/50 transition ${
                      plan.recommended ? "bg-coral-dim/20" : ""
                    }`}
                  >
                    <td className="p-3">
                      <div className="font-semibold text-ink flex items-center gap-1.5">
                        {plan.label}
                        {plan.recommended && (
                          <span className="px-1.5 py-0.5 rounded-md bg-coral text-white text-[9px] font-bold">
                            Top Pick
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-ink-faint truncate max-w-[180px]">
                        {plan.vendor}
                      </div>
                    </td>
                    <td className="p-3 font-mono font-semibold">
                      <span
                        className={
                          plan.costDelta > 0
                            ? "text-pink"
                            : plan.costDelta < 0
                            ? "text-teal"
                            : "text-ink-dim"
                        }
                      >
                        {formatCurrency(plan.costDelta, currency)}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-semibold">
                      <span
                        className={
                          plan.timeDeltaMinutes > 0 ? "text-amber" : "text-teal"
                        }
                      >
                        {formatMinutes(plan.timeDeltaMinutes)}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-ink">
                      {plan.itineraryAffectedPct}%
                    </td>
                    <td className="p-3 font-bold text-teal">
                      {plan.convenienceScore}/100
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onApply(plan.id)}
                        disabled={applying}
                        className="px-3 py-1.5 rounded-xl bg-coral text-white text-[11px] font-semibold hover:brightness-105 transition disabled:opacity-40"
                      >
                        Apply
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
