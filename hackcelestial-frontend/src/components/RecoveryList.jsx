import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Table,
  LayoutGrid,
  Sparkles,
} from "lucide-react";
import RecoveryCard from "./RecoveryCard";
import StatTile from "./ui/StatTile";
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
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-lg border border-status-resolved/40 bg-status-resolved-dim p-8 text-center space-y-5"
      >
        <div className="h-14 w-14 rounded-sm bg-status-resolved-dim border border-status-resolved/40 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-7 w-7 text-status-resolved" />
        </div>

        <div>
          <h3 className="font-display font-medium text-xl text-ink mb-1.5">
            Itinerary Reconstituted & Secured
          </h3>
          <p className="text-[13px] text-ink-dim leading-relaxed font-medium">
            Applied: <span className="text-status-resolved font-bold tracking-wide">{resolvedPlan.label}</span>
          </p>
        </div>

        {/* Financial & Schedule Reconstitution Summary */}
        {financialSummary && (
          <div className="grid grid-cols-2 gap-3 text-left">
            <StatTile
              label="Recovered Refunds"
              numericValue={financialSummary.refundTotal}
              format={(n) => formatCurrency(n, currency).replace(/^[+−]/, "")}
              tone="positive"
              className="py-3"
            />
            <StatTile
              label="Net Expense Delta"
              numericValue={financialSummary.costDeltaTotal}
              format={(n) => formatCurrency(n, currency)}
              tone="neutral"
              className="py-3"
            />
          </div>
        )}

        {/* Realigned Bookings List */}
        {appliedDiffs.length > 0 && (
          <div className="text-left bg-surface-sunk p-4 rounded-sm border border-border text-[11px] space-y-2">
            <span className="font-bold text-ink uppercase tracking-wider text-[10px] block mb-2">
              Synchronized Schedule Adjustments:
            </span>
            {appliedDiffs.map((diff, i) => (
              <div key={i} className="flex items-start gap-2 text-ink-dim">
                <span className="h-2 w-2 rounded-full bg-status-resolved mt-1 shrink-0" />
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-bold px-5 py-3.5 rounded-sm bg-brand text-brand-ink hover:brightness-105 transition-all shadow-sm cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              View AI Concierge Brief
            </button>
          )}
          <button
            onClick={onDismiss}
            className="w-full sm:w-auto text-xs font-bold px-5 py-3.5 rounded-sm bg-surface border border-border text-ink hover:bg-surface-sunk transition-all cursor-pointer"
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
        <h3 className="font-display font-medium text-lg text-ink">
          Generated Recovery Options
        </h3>
        {/* Toggle between Grid and Comparison Matrix Table */}
        <div className="flex items-center gap-1 bg-surface-sunk p-1 rounded-sm border border-border">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-sm text-xs font-bold transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-surface text-ink shadow-sm border border-border/40"
                : "text-ink-faint hover:text-ink hover:bg-surface-sunk"
            }`}
            title="Card Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("matrix")}
            className={`p-2 rounded-sm text-xs font-bold transition-all cursor-pointer ${
              viewMode === "matrix"
                ? "bg-surface text-ink shadow-sm border border-border/40"
                : "text-ink-faint hover:text-ink hover:bg-surface-sunk"
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
        <div className="rounded-md border border-border bg-surface overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-sunk border-b border-border text-ink-faint font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Plan Option</th>
                  <th className="p-4">Cost Delta</th>
                  <th className="p-4">Schedule</th>
                  <th className="p-4">Cascade %</th>
                  <th className="p-4">Resilience</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {options.map((plan) => (
                  <tr
                    key={plan.id}
                    className={`hover:bg-surface-sunk transition-colors ${
                      plan.recommended ? "bg-brand-dim/40" : ""
                    }`}
                  >
                    <td className={`p-4 pl-5 ${plan.recommended ? "border-l-2 border-l-brand" : ""}`}>
                      <div className="font-bold text-ink flex items-center gap-2">
                        {plan.label}
                        {plan.recommended && (
                          <span className="px-2 py-0.5 rounded-sm bg-brand text-brand-ink text-[9px] font-extrabold uppercase tracking-widest">
                            Top Pick
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-ink-dim mt-1 truncate max-w-[180px] font-medium">
                        {plan.vendor}
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold">
                      <span
                        className={
                          plan.costDelta > 0
                            ? "text-status-disrupted"
                            : plan.costDelta < 0
                            ? "text-status-resolved"
                            : "text-ink-dim"
                        }
                      >
                        {formatCurrency(plan.costDelta, currency)}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold">
                      <span
                        className={
                          plan.timeDeltaMinutes > 0 ? "text-status-risk" : "text-status-resolved"
                        }
                      >
                        {formatMinutes(plan.timeDeltaMinutes)}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-ink font-semibold">
                      {plan.itineraryAffectedPct}%
                    </td>
                    <td className="p-4 font-extrabold text-status-resolved">
                      {plan.convenienceScore}/100
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onApply(plan.id)}
                        disabled={applying}
                        className={`px-4 py-2 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer ${
                          plan.recommended
                            ? "bg-brand text-brand-ink hover:brightness-105"
                            : "bg-surface-sunk border border-border text-ink hover:bg-border/60"
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
