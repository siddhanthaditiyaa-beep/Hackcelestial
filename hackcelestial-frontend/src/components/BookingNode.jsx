import { motion } from "framer-motion";
import { TYPE_ICON, TYPE_LABEL, STATUS_STYLES } from "../utils/visuals";
import { BOOKING_IMAGE } from "../utils/bookingImages";
import { CornerDownRight, AlertTriangle, ShieldCheck, ShieldOff } from "lucide-react";

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
  const Icon = TYPE_ICON[booking.type];
  const status = STATUS_STYLES[booking.status];
  const freeCancellation = booking.cancellationPolicy.refundPct >= 70;

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
          className={`w-full text-left rounded-3xl border bg-surface overflow-hidden transition-colors ${
            isSelected
              ? "border-coral shadow-[0_12px_28px_-10px_rgba(255,90,95,0.4)]"
              : "border-border hover:border-border-strong shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_14px_30px_-12px_rgba(0,0,0,0.18)]"
          }`}
        >
          {/* real photo banner, Airbnb-listing style */}
          <div className="relative h-36 sm:h-40 overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${BOOKING_IMAGE[booking.id]})` }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

            <div className="absolute top-3 left-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm">
              <Icon className="h-4.5 w-4.5 text-ink" strokeWidth={2} />
            </div>

            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              {isProactivelyAtRisk && booking.status === "confirmed" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-white/95 text-amber shadow-sm">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  tight connection
                </span>
              )}
            </div>

            <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
                  {TYPE_LABEL[booking.type]}
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

          {/* content strip below the photo */}
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-ink-dim truncate">{booking.subtitle}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.badgeBg} ${status.badgeText}`}>
                  {status.label}
                </span>
              </div>
            </div>

            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium shrink-0 ${
                freeCancellation ? "text-teal" : "text-ink-faint"
              }`}
            >
              {freeCancellation ? (
                <ShieldCheck className="h-3.5 w-3.5" />
              ) : (
                <ShieldOff className="h-3.5 w-3.5" />
              )}
              {freeCancellation ? "Flexible" : "Non-refundable"}
            </span>
          </div>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
