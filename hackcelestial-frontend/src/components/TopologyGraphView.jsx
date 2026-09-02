import { useMemo } from "react";
import { motion } from "framer-motion";
import { TYPE_ICON, TYPE_LABEL, STATUS_STYLES } from "../utils/visuals";
import { ArrowRight, AlertTriangle, ShieldCheck, Clock, Zap } from "lucide-react";

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
      <div className="glass-panel rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-dim relative overflow-hidden">
        {/* Subtle animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-dim/20 via-transparent to-pink-dim/20 opacity-30 animate-pulse pointer-events-none" />
        
        <div className="flex items-center gap-4 flex-wrap relative z-10">
          <span className="font-semibold text-ink flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-teal drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
            DAG Dependency Topology
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-teal shadow-[0_0_8px_rgba(0,240,255,0.8)]" /> On Track / Resolved
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber shadow-[0_0_8px_rgba(255,180,0,0.8)]" /> Buffer Under Risk
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-pink shadow-[0_0_8px_rgba(227,28,95,0.8)]" /> Disrupted Root
          </span>
        </div>
        <span className="text-[11px] text-ink-faint relative z-10">
          Interactive neural causal graph
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
            >
              {/* Directed Edge / Dependency Connector from Parent */}
              {idx > 0 && (
                <div className="flex flex-col items-center my-0 w-full relative z-0">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "24px" }}
                    transition={{ delay: idx * 0.1 + 0.2 }}
                    className={`w-0.5 transition-colors duration-500 shadow-sm ${
                      isCascadeAffected
                        ? "bg-gradient-to-b from-pink to-amber shadow-[0_0_10px_rgba(255,180,0,0.5)]"
                        : "bg-border-strong"
                    }`}
                  />
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-md shadow-lg z-10 ${
                      booking.bufferMinutes !== null && booking.bufferMinutes <= 35
                        ? "bg-amber-dim border-amber/50 text-amber shadow-[0_0_12px_rgba(255,180,0,0.3)]"
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
                    transition={{ delay: idx * 0.1 + 0.3 }}
                    className={`w-0.5 transition-colors duration-500 shadow-sm ${
                      isCascadeAffected ? "bg-amber shadow-[0_0_10px_rgba(255,180,0,0.5)]" : "bg-border-strong"
                    }`}
                  />
                  <ArrowRight className={`h-4 w-4 rotate-90 -mt-1.5 z-10 transition-colors ${isCascadeAffected ? "text-amber drop-shadow-[0_0_4px_rgba(255,180,0,0.8)]" : "text-border-strong"}`} />
                </div>
              )}

              {/* Node Card */}
              <motion.button
                onClick={() => onSelect?.(booking.id)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left rounded-2xl p-4.5 transition-all relative overflow-hidden z-10 glass-panel ${
                  isSelected
                    ? "border-teal ring-1 ring-teal/30 shadow-[0_0_20px_rgba(0,240,255,0.15)]"
                    : isCascadeAffected
                    ? "border-pink/40 bg-pink-dim/10 shadow-[0_0_20px_rgba(227,28,95,0.1)]"
                    : "hover:border-border-strong hover:bg-surface-sunk/30"
                }`}
              >
                {/* Glow bar for cascade or at-risk */}
                <div
                  className={`absolute top-0 left-0 bottom-0 w-1.5 transition-colors duration-500 ${
                    booking.status === "disrupted"
                      ? "bg-pink shadow-[0_0_12px_rgba(227,28,95,0.9)]"
                      : booking.status === "at-risk"
                      ? "bg-amber shadow-[0_0_12px_rgba(255,180,0,0.9)]"
                      : booking.status === "resolved"
                      ? "bg-teal shadow-[0_0_12px_rgba(0,240,255,0.9)]"
                      : "bg-border"
                  }`}
                />

                <div className="flex items-start justify-between gap-3 pl-3">
                  <div className="flex items-start gap-4 min-w-0">
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border backdrop-blur-md transition-colors ${
                        booking.status === "disrupted"
                          ? "bg-pink-dim/30 border-pink/30 text-pink drop-shadow-[0_0_8px_rgba(227,28,95,0.5)]"
                          : booking.status === "at-risk"
                          ? "bg-amber-dim/30 border-amber/30 text-amber drop-shadow-[0_0_8px_rgba(255,180,0,0.5)]"
                          : booking.status === "resolved"
                          ? "bg-teal-dim/30 border-teal/30 text-teal drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]"
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
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-dim/50 border border-amber/30 text-amber shadow-[0_0_8px_rgba(255,180,0,0.2)]">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            Tight Buffer ({booking.bufferMinutes}m)
                          </span>
                        )}
                      </div>
                      <h4 className="font-display font-semibold text-base text-ink truncate mt-1">
                        {booking.title}
                      </h4>
                      <p className="text-xs text-ink-dim truncate mt-0.5">
                        {booking.subtitle} <span className="mx-1 text-border-strong">•</span> {booking.vendor}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pt-0.5">
                    <div className="text-sm font-bold text-ink tabular-nums tracking-tight bg-surface-sunk/50 px-2 py-1 rounded-md border border-border/50">
                      {booking.startTime} – {booking.endTime}
                    </div>
                    <div className="mt-2.5 inline-flex items-center gap-1.5 justify-end w-full">
                      <span className={`h-2 w-2 rounded-full ${status.dot} ${
                         booking.status === "disrupted" ? "shadow-[0_0_6px_rgba(227,28,95,0.8)] animate-pulse" :
                         booking.status === "at-risk" ? "shadow-[0_0_6px_rgba(255,180,0,0.8)]" :
                         booking.status === "resolved" ? "shadow-[0_0_6px_rgba(0,240,255,0.8)]" : ""
                      }`} />
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

