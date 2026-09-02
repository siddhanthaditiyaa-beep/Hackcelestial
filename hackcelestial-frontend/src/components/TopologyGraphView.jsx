import { useMemo } from "react";
import { motion } from "framer-motion";
import { TYPE_ICON, TYPE_LABEL, STATUS_STYLES } from "../utils/visuals";
import { ArrowRight, AlertTriangle, ShieldCheck, Clock } from "lucide-react";

export default function TopologyGraphView({
  bookings,
  atRiskIds,
  impact,
  selectedId,
  onSelect,
}) {
  const byId = useMemo(() => {
    return Object.fromEntries(bookings.map((b) => [b.id, b]));
  }, [bookings]);

  const cascadeOrder = impact
    ? [impact.directImpact, ...impact.downstreamImpacts]
    : [];

  return (
    <div className="space-y-6">
      <div className="bg-surface-sunk/60 border border-border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-dim">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-ink flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-teal" />
            DAG Dependency Topology
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-teal" /> On Track / Resolved
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber" /> Buffer Under Risk
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-pink" /> Disrupted Root
          </span>
        </div>
        <span className="text-[11px] text-ink-faint">
          Arrows indicate causal precedence & buffer margins
        </span>
      </div>

      <div className="relative py-4 flex flex-col items-center gap-6">
        {bookings.map((booking, idx) => {
          const Icon = TYPE_ICON[booking.type] || Clock;
          const status = STATUS_STYLES[booking.status];
          const isSelected = selectedId === booking.id;
          const isCascadeAffected = cascadeOrder.includes(booking.id);
          const isProactiveAtRisk = atRiskIds.includes(booking.id);
          const parentId = booking.dependsOn[0];
          const parent = parentId ? byId[parentId] : null;

          return (
            <div key={booking.id} className="w-full max-w-xl flex flex-col items-center">
              {/* Directed Edge / Dependency Connector from Parent */}
              {idx > 0 && (
                <div className="flex flex-col items-center my-1 w-full">
                  <div
                    className={`h-6 w-0.5 transition-colors duration-300 ${
                      isCascadeAffected
                        ? "bg-gradient-to-b from-pink to-amber"
                        : "bg-border-strong"
                    }`}
                  />
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border shadow-xs ${
                      booking.bufferMinutes !== null && booking.bufferMinutes <= 35
                        ? "bg-amber-dim border-amber/30 text-amber"
                        : "bg-surface border-border text-ink-dim"
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    {booking.bufferMinutes !== null ? (
                      <span>
                        Buffer: {booking.bufferMinutes}m
                        {parent ? ` after ${parent.title.split(" ")[0]}` : ""}
                      </span>
                    ) : (
                      <span>Root Departure</span>
                    )}
                  </div>
                  <div
                    className={`h-4 w-0.5 transition-colors duration-300 ${
                      isCascadeAffected ? "bg-amber" : "bg-border-strong"
                    }`}
                  />
                  <ArrowRight className="h-3.5 w-3.5 rotate-90 text-ink-faint -mt-1" />
                </div>
              )}

              {/* Node Card */}
              <motion.button
                onClick={() => onSelect?.(booking.id)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full text-left rounded-2xl border p-4.5 bg-surface transition-all shadow-sm relative overflow-hidden ${
                  isSelected
                    ? "border-coral ring-2 ring-coral/20 shadow-md"
                    : isCascadeAffected
                    ? "border-pink/50 bg-pink-dim/20"
                    : "border-border hover:border-border-strong"
                }`}
              >
                {/* Glow bar for cascade or at-risk */}
                <div
                  className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                    booking.status === "disrupted"
                      ? "bg-pink"
                      : booking.status === "at-risk"
                      ? "bg-amber"
                      : booking.status === "resolved"
                      ? "bg-teal"
                      : "bg-border"
                  }`}
                />

                <div className="flex items-start justify-between gap-3 pl-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                        booking.status === "disrupted"
                          ? "bg-pink-dim text-pink"
                          : booking.status === "at-risk"
                          ? "bg-amber-dim text-amber"
                          : booking.status === "resolved"
                          ? "bg-teal-dim text-teal"
                          : "bg-surface-sunk text-ink-dim"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">
                          {booking.day} · {TYPE_LABEL[booking.type]}
                        </span>
                        {isProactiveAtRisk && booking.status === "confirmed" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-dim text-amber">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            Tight Buffer ({booking.bufferMinutes}m)
                          </span>
                        )}
                      </div>
                      <h4 className="font-display font-semibold text-sm text-ink truncate mt-0.5">
                        {booking.title}
                      </h4>
                      <p className="text-xs text-ink-dim truncate mt-0.5">
                        {booking.subtitle} · {booking.vendor}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-ink tabular-nums">
                      {booking.startTime} – {booking.endTime}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${status.badgeBg} ${status.badgeText}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Policy preview pill */}
                {booking.cancellationPolicy && (
                  <div className="mt-3 pt-2.5 border-t border-border-light text-[11px] text-ink-faint flex items-center justify-between pl-2">
                    <span className="truncate pr-2">
                      Policy: {booking.cancellationPolicy.refundPct}% refund up to {booking.cancellationPolicy.windowHours}h prior
                    </span>
                    <span className="font-medium text-ink-dim shrink-0">
                      Cost: ₹{booking.cost?.toLocaleString() || "—"}
                    </span>
                  </div>
                )}
              </motion.button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
