import { motion } from "framer-motion";
import { TYPE_ICON, TYPE_LABEL, STATUS_STYLES } from "../utils/visuals";
import { getBookingImage } from "../utils/bookingImages";
import { CornerDownRight, AlertTriangle, ShieldCheck, ShieldOff, Clock, Sparkles } from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export default function BookingNode({
  booking,
  parentTitle,
  isBranch,
  isProactivelyAtRisk,
  cascadeDelay,
  isSelected,
  onSelect,
}) {
  const Icon = TYPE_ICON[booking.type] || Clock;
  const status = STATUS_STYLES[booking.status] || STATUS_STYLES.confirmed;
  const refundPct = booking.cancellationPolicy?.refundPct ?? 0;
  const freeCancellation = refundPct >= 70;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <motion.div
        animate={
          booking.status === "disrupted" || booking.status === "at-risk"
            ? { x: [0, -2, 2, -1, 0] }
            : { x: 0 }
        }
        transition={{ duration: 0.4, delay: cascadeDelay }}
      >
        {isBranch && (
          <div className="flex items-center gap-1.5 mb-2 ml-1 text-xs font-medium text-ink-faint">
            <CornerDownRight className="h-3.5 w-3.5" />
            requires {parentTitle}
          </div>
        )}

        <motion.button
          onClick={() => onSelect?.(booking.id)}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.995 }}
          className={`w-full text-left rounded-lg border bg-surface overflow-hidden transition-all cursor-pointer ${
            isSelected
              ? "border-brand shadow-md ring-2 ring-brand/20"
              : "border-border hover:border-border-strong shadow-sm hover:shadow-md"
          }`}
        >
          {/* Destination photo banner */}
          <div className="relative h-36 sm:h-40 overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${getBookingImage(booking)})` }}
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

            <div className="absolute top-3 left-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm">
              <Icon className="h-4.5 w-4.5 text-ink" strokeWidth={2} />
            </div>

            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              {isProactivelyAtRisk && booking.status === "confirmed" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-white/95 text-status-risk shadow-sm">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  tight buffer ({booking.bufferMinutes}m)
                </span>
              )}
              {booking.recoveryPlanApplied && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-status-resolved text-white shadow-sm">
                  <Sparkles className="h-2.5 w-2.5" />
                  Recovered
                </span>
              )}
            </div>

            <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
                  {booking.day} · {TYPE_LABEL[booking.type] || booking.type}
                </span>
                <h3 className="font-display font-semibold text-base text-white leading-tight drop-shadow">
                  {booking.title}
                </h3>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-semibold text-white tabular-nums drop-shadow">
                  {booking.startTime}
                </div>
                <div className="text-xs text-white/80 tabular-nums drop-shadow">
                  {booking.endTime}
                </div>
              </div>
            </div>
          </div>

          {/* Content strip below the photo */}
          <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="text-sm text-ink-dim truncate">
                {booking.subtitle} · {booking.vendor}
              </p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.badgeBg} ${status.badgeText}`}>
                    {status.label}
                  </span>
                </div>
                {booking.bufferMinutes !== null && (
                  <span className="text-[11px] text-ink-faint font-medium">
                    Buffer: {booking.bufferMinutes}m
                  </span>
                )}
              </div>
            </div>

            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium shrink-0 ${
                freeCancellation ? "text-status-resolved" : "text-ink-faint"
              }`}
            >
              {freeCancellation ? (
                <ShieldCheck className="h-3.5 w-3.5" />
              ) : (
                <ShieldOff className="h-3.5 w-3.5" />
              )}
              {refundPct > 0 ? `${refundPct}% Refund Policy` : "Non-refundable"}
            </span>
          </div>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
