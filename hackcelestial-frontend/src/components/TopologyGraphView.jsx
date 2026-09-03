import { useMemo } from "react";
import { motion } from "framer-motion";
import { TYPE_ICON, TYPE_LABEL, STATUS_STYLES } from "../utils/visuals";
import { ArrowRight, AlertTriangle, Clock, Zap } from "lucide-react";

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
      <div className="bg-surface border border-border rounded-md p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-dim shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-ink flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-brand" />
            DAG Dependency Topology
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-status-resolved" /> On Track / Resolved
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-status-risk" /> Buffer Under Risk
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-status-disrupted" /> Disrupted Root
          </span>
        </div>
        <span className="text-[11px] text-ink-faint">
          Interactive dependency graph
        </span>
      </div>

      <div className="relative py-4 flex flex-col items-center gap-2">
        {bookings.map((booking, idx) => {
          const Icon = TYPE_ICON[booking.type] || Clock;
          const status = STATUS_STYLES[booking.status];
          const isSelected = selectedId === booking.id;
          const isCascadeAffected = cascadeOrder.includes(booking.id);
          const isProactiveAtRisk = atRiskIds.includes(booking.id);
          const parentId = booking.dependsOn[0];
          const parent = parentId ? byId[parentId] : null;

          return (
            <motion.div
              key={booking.id}
              className="w-full max-w-xl flex flex-col items-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
            >
              {/* Directed Edge / Dependency Connector from Parent */}
              {idx > 0 && (
                <div className="flex flex-col items-center my-0 w-full relative z-0">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "24px" }}
                    transition={{ delay: idx * 0.08 + 0.15 }}
                    className={`w-0.5 transition-colors duration-500 ${
                      isCascadeAffected ? "bg-status-disrupted" : "bg-border-strong"
                    }`}
                  />
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border shadow-sm z-10 ${
                      booking.bufferMinutes !== null && booking.bufferMinutes <= 35
                        ? "bg-status-risk-dim border-status-risk/40 text-status-risk"
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
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "16px" }}
                    transition={{ delay: idx * 0.08 + 0.25 }}
                    className={`w-0.5 transition-colors duration-500 ${
                      isCascadeAffected ? "bg-status-risk" : "bg-border-strong"
                    }`}
                  />
                  <ArrowRight className={`h-4 w-4 rotate-90 -mt-1.5 z-10 transition-colors ${isCascadeAffected ? "text-status-risk" : "text-border-strong"}`} />
                </div>
              )}

              {/* Node Card */}
              <motion.button
                onClick={() => onSelect?.(booking.id)}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className={`w-full text-left rounded-md p-4.5 transition-all relative overflow-hidden z-10 bg-surface border shadow-sm hover:shadow-md ${
                  isSelected
                    ? "border-brand ring-1 ring-brand/25"
                    : isCascadeAffected
                    ? "border-status-disrupted/40 bg-status-disrupted-dim/40"
                    : "border-border hover:border-border-strong"
                }`}
              >
                {/* Status bar */}
                <div
                  className={`absolute top-0 left-0 bottom-0 w-1.5 transition-colors duration-500 ${
                    booking.status === "disrupted"
                      ? "bg-status-disrupted"
                      : booking.status === "at-risk"
                      ? "bg-status-risk"
                      : booking.status === "resolved"
                      ? "bg-status-resolved"
                      : "bg-border"
                  }`}
                />

                <div className="flex items-start justify-between gap-3 pl-3">
                  <div className="flex items-start gap-4 min-w-0">
                    <div
                      className={`h-12 w-12 rounded-sm flex items-center justify-center shrink-0 border transition-colors ${
                        booking.status === "disrupted"
                          ? "bg-status-disrupted-dim border-status-disrupted/30 text-status-disrupted"
                          : booking.status === "at-risk"
                          ? "bg-status-risk-dim border-status-risk/30 text-status-risk"
                          : booking.status === "resolved"
                          ? "bg-status-resolved-dim border-status-resolved/30 text-status-resolved"
                          : "bg-surface-sunk border-border/50 text-ink-dim"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <div className="min-w-0 pt-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-dim/80">
                          {booking.day} · {TYPE_LABEL[booking.type]}
                        </span>
                        {isProactiveAtRisk && booking.status === "confirmed" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-status-risk-dim border border-status-risk/30 text-status-risk">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            Tight Buffer ({booking.bufferMinutes}m)
                          </span>
                        )}
                      </div>
                      <h4 className="font-display font-medium text-base text-ink truncate mt-1">
                        {booking.title}
                      </h4>
                      <p className="text-xs text-ink-dim truncate mt-0.5">
                        {booking.subtitle} <span className="mx-1 text-border-strong">•</span> {booking.vendor}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pt-0.5">
                    <div className="text-sm font-bold text-ink tabular-nums tracking-tight bg-surface-sunk px-2 py-1 rounded-sm border border-border/50">
                      {booking.startTime} – {booking.endTime}
                    </div>
                    <div className="mt-2.5 inline-flex items-center gap-1.5 justify-end w-full">
                      <span className={`h-2 w-2 rounded-full ${status.dot} ${booking.status === "disrupted" ? "animate-pulse" : ""}`} />
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${status.badgeBg} ${status.badgeText}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Policy preview pill */}
                {booking.cancellationPolicy && (
                  <div className="mt-4 pt-3 border-t border-border/30 text-[11px] text-ink-dim flex items-center justify-between pl-3 relative z-10">
                    <span className="truncate pr-2">
                      <span className="text-ink-faint">Policy:</span> {booking.cancellationPolicy.refundPct}% refund up to {booking.cancellationPolicy.windowHours}h prior
                    </span>
                    <span className="font-semibold text-ink shrink-0">
                      Cost: ₹{booking.cost?.toLocaleString() || "—"}
                    </span>
                  </div>
                )}
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
