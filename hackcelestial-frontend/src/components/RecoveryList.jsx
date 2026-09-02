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
        className="rounded-3xl border border-teal-dim/50 bg-teal-dim/10 p-8 text-center space-y-5 relative overflow-hidden backdrop-blur-md shadow-[0_0_30px_rgba(0,240,255,0.1)]"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-teal-dim/20 to-transparent pointer-events-none -z-10" />
        
        <div className="h-14 w-14 rounded-2xl bg-teal-dim/30 border border-teal/40 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(0,240,255,0.3)] backdrop-blur-md">
          <CheckCircle2 className="h-7 w-7 text-teal drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" />
        </div>

        <div>
          <h3 className="font-display font-bold text-xl text-ink mb-1.5 drop-shadow-sm">
            Itinerary Reconstituted & Secured
          </h3>
          <p className="text-[13px] text-ink-dim leading-relaxed font-medium">
            Applied: <span className="text-teal font-bold tracking-wide">{resolvedPlan.label}</span>
          </p>
        </div>

        {/* Financial & Schedule Reconstitution Summary */}
        {financialSummary && (
          <div className="bg-surface-sunk/40 p-4 rounded-2xl border border-border/40 text-xs text-ink-dim grid grid-cols-2 gap-3 text-left backdrop-blur-sm">
            <div>
              <span className="text-[10px] text-ink-faint font-bold uppercase tracking-wider block mb-1">
                Recovered Refunds
              </span>
              <span className="font-bold text-teal font-mono text-sm drop-shadow-[0_0_4px_rgba(0,240,255,0.4)]">
                {currSym}{financialSummary.refundTotal.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-ink-faint font-bold uppercase tracking-wider block mb-1">
                Net Expense Delta
              </span>
              <span className="font-bold text-ink font-mono text-sm">
                {currSym}{financialSummary.costDeltaTotal.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Realigned Bookings List */}
        {appliedDiffs.length > 0 && (
          <div className="text-left bg-surface-sunk/30 p-4 rounded-2xl border border-border/30 text-[11px] space-y-2 backdrop-blur-sm">
            <span className="font-bold text-ink uppercase tracking-wider text-[10px] block mb-2 opacity-80">
              Synchronized Schedule Adjustments:
            </span>
            {appliedDiffs.map((diff, i) => (
              <div key={i} className="flex items-start gap-2 text-ink-dim">
                <span className="h-2 w-2 rounded-full bg-teal mt-1 shadow-[0_0_5px_rgba(0,240,255,0.8)] shrink-0" />
                <div>
                  <span className="font-bold text-ink">{diff.title}:</span>{" "}
                  <span className="font-medium">{diff.details}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          {onOpenCopilot && (
            <button
              onClick={onOpenCopilot}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-bold px-5 py-3.5 rounded-xl bg-coral text-white hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(255,79,94,0.4)] cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              View AI Concierge Brief
            </button>
          )}
          <button
            onClick={onDismiss}
            className="w-full sm:w-auto text-xs font-bold px-5 py-3.5 rounded-xl bg-surface-sunk/50 border border-border/50 text-ink hover:bg-surface-sunk/80 hover:border-border transition-all cursor-pointer"
          >
            Simulate Another Disruption
          </button>
        </div>
      </motion.div>
    );
  }

  if (!options.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 px-1">
        <h3 className="font-display font-bold text-lg text-ink drop-shadow-sm">
          Generated Recovery Options
        </h3>
        {/* Toggle between Grid and Comparison Matrix Table */}
        <div className="flex items-center gap-1 bg-surface-sunk/50 p-1 rounded-xl border border-border/50 backdrop-blur-sm">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-surface text-ink shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-border/30"
                : "text-ink-faint hover:text-ink hover:bg-surface-sunk/60"
            }`}
            title="Card Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("matrix")}
            className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "matrix"
                ? "bg-surface text-ink shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-border/30"
                : "text-ink-faint hover:text-ink hover:bg-surface-sunk/60"
            }`}
            title="Comparison Matrix Table"
          >
            <Table className="h-4 w-4" />
          </button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid gap-4">
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
        <div className="rounded-2xl border border-border/50 bg-surface/80 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.2)] backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-sunk/60 border-b border-border/40 text-ink-faint font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Plan Option</th>
                  <th className="p-4">Cost Delta</th>
                  <th className="p-4">Schedule</th>
                  <th className="p-4">Cascade %</th>
                  <th className="p-4">Resilience</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {options.map((plan) => (
                  <tr
                    key={plan.id}
                    className={`hover:bg-surface-sunk/40 transition-colors ${
                      plan.recommended ? "bg-coral-dim/10 relative" : ""
                    }`}
                  >
                    {plan.recommended && (
                      <div className="absolute inset-y-0 left-0 w-1 bg-coral shadow-[0_0_10px_rgba(255,79,94,0.8)]" />
                    )}
                    <td className="p-4 pl-5">
                      <div className="font-bold text-ink flex items-center gap-2">
                        {plan.label}
                        {plan.recommended && (
                          <span className="px-2 py-0.5 rounded-md bg-coral text-white text-[9px] font-extrabold uppercase tracking-widest shadow-[0_0_10px_rgba(255,79,94,0.4)]">
                            Top Pick
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-ink-dim/80 mt-1 truncate max-w-[180px] font-medium">
                        {plan.vendor}
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold">
                      <span
                        className={
                          plan.costDelta > 0
                            ? "text-pink drop-shadow-[0_0_3px_rgba(227,28,95,0.4)]"
                            : plan.costDelta < 0
                            ? "text-teal drop-shadow-[0_0_3px_rgba(0,240,255,0.4)]"
                            : "text-ink-dim"
                        }
                      >
                        {formatCurrency(plan.costDelta, currency)}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold">
                      <span
                        className={
                          plan.timeDeltaMinutes > 0 ? "text-amber drop-shadow-[0_0_3px_rgba(255,180,0,0.4)]" : "text-teal drop-shadow-[0_0_3px_rgba(0,240,255,0.4)]"
                        }
                      >
                        {formatMinutes(plan.timeDeltaMinutes)}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-ink font-semibold">
                      {plan.itineraryAffectedPct}%
                    </td>
                    <td className="p-4 font-extrabold text-teal drop-shadow-[0_0_4px_rgba(0,240,255,0.3)]">
                      {plan.convenienceScore}/100
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onApply(plan.id)}
                        disabled={applying}
                        className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer ${
                          plan.recommended 
                            ? "bg-coral text-white shadow-[0_0_10px_rgba(255,79,94,0.4)] hover:brightness-110" 
                            : "bg-surface-sunk border border-border/50 text-ink hover:bg-border/60"
                        }`}
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
