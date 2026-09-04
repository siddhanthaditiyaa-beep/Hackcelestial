import { motion } from "framer-motion";
import { Star, Plane, Train, Building, Tent, Compass, Zap, X as CancelIcon, CheckCircle2, Sparkles } from "lucide-react";
import StatusBadge from "./ui/StatusBadge";

const CATEGORY_ICON = { flights: Plane, trains: Train, hotels: Building, hostels: Tent, activities: Compass };

// Tiny, intentionally narrow markdown renderer — just enough to turn a
// model's stray **bold** into real emphasis without pulling in a full
// markdown/remark stack. Structured data (search hits, bookings, recovery
// options) renders as real cards below instead of the model trying to draw
// tables in prose, so this only ever needs to handle inline bold.
export function RichText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-bold text-ink">{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function CardShell({ children }) {
  return <div className="rounded-md border border-border bg-surface overflow-hidden shadow-sm">{children}</div>;
}

export function SearchResultCards({ results, onBook, disabled }) {
  const shown = results.slice(0, 4);
  return (
    <div className="space-y-2 pl-9">
      {shown.map((r) => (
        <CardShell key={`${r.category}:${r.id}`}>
          <div className="flex gap-3 p-2.5">
            {r.img ? (
              <img src={r.img} alt={r.title} className="h-14 w-16 rounded-sm object-cover shrink-0" />
            ) : (
              <div className="h-14 w-16 rounded-sm bg-surface-sunk flex items-center justify-center shrink-0 text-ink-faint">
                {(() => { const Icon = CATEGORY_ICON[r.category] || Compass; return <Icon className="h-5 w-5" />; })()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-ink truncate">{r.title}</div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-sm font-bold text-ink">{r.price}</span>
                {r.rating && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] text-status-risk font-semibold">
                    <Star className="h-3 w-3 fill-status-risk" />{r.rating}
                  </span>
                )}
                {r.duration && <span className="text-[11px] text-ink-faint">{r.duration}</span>}
              </div>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={disabled}
            onClick={() => onBook(r)}
            className="w-full py-2 text-xs font-bold text-brand-ink bg-brand hover:brightness-105 transition disabled:opacity-50"
          >
            Book this
          </motion.button>
        </CardShell>
      ))}
      {results.length > shown.length && (
        <p className="text-[11px] text-ink-faint px-1">+{results.length - shown.length} more — ask to see more options.</p>
      )}
    </div>
  );
}

export function BookingCards({ bookings, onSimulate, onCancel, disabled }) {
  const shown = bookings.slice(0, 5);
  return (
    <div className="space-y-2 pl-9">
      {shown.map((b) => {
        const Icon = CATEGORY_ICON[b.category] || Compass;
        const canAct = b.status !== "disrupted" && b.status !== "at-risk";
        return (
          <CardShell key={b.id}>
            <div className="flex items-center gap-3 p-2.5">
              {b.img ? (
                <img src={b.img} alt={b.itemName} className="h-11 w-11 rounded-sm object-cover shrink-0" />
              ) : (
                <div className="h-11 w-11 rounded-sm bg-surface-sunk flex items-center justify-center shrink-0 text-ink-faint">
                  <Icon className="h-4.5 w-4.5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-ink truncate">{b.itemName}</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <StatusBadge status={b.status} />
                  <span className="text-xs font-bold text-ink">₹{b.totalPrice?.toLocaleString()}</span>
                </div>
              </div>
            </div>
            {canAct && (onSimulate || onCancel) && (
              <div className="flex border-t border-border">
                {onSimulate && (
                  <button
                    disabled={disabled}
                    onClick={() => onSimulate(b)}
                    className="flex-1 py-1.5 text-[11px] font-semibold text-status-risk hover:bg-status-risk-dim transition inline-flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <Zap className="h-3 w-3" /> Simulate disruption
                  </button>
                )}
                {onCancel && (
                  <button
                    disabled={disabled}
                    onClick={() => onCancel(b)}
                    className="flex-1 py-1.5 text-[11px] font-semibold text-ink-faint hover:text-status-disrupted hover:bg-surface-sunk transition inline-flex items-center justify-center gap-1 border-l border-border disabled:opacity-50"
                  >
                    <CancelIcon className="h-3 w-3" /> Cancel
                  </button>
                )}
              </div>
            )}
          </CardShell>
        );
      })}
      {bookings.length > shown.length && (
        <p className="text-[11px] text-ink-faint px-1">+{bookings.length - shown.length} more booking(s).</p>
      )}
    </div>
  );
}

export function RecoveryOptionCards({ options, onApply, disabled }) {
  return (
    <div className="space-y-2 pl-9">
      {options.map((o) => (
        <CardShell key={o.planId}>
          <div className="p-3 space-y-1.5">
            {o.recommended && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand uppercase tracking-wide">
                <Sparkles className="h-3 w-3" /> AI Top Pick
              </span>
            )}
            <div className="text-xs font-semibold text-ink">{o.label}</div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-faint">
              <span>
                Cost: <span className="font-semibold text-ink">{o.costDeltaINR >= 0 ? "+" : "−"}₹{Math.abs(o.costDeltaINR || 0).toLocaleString()}</span>
              </span>
              {o.refundEstimatedINR > 0 && (
                <span>
                  Refund: <span className="font-semibold text-status-resolved">₹{o.refundEstimatedINR.toLocaleString()}</span>
                </span>
              )}
              <span>Schedule: {o.scheduleImpactMinutes > 0 ? `+${o.scheduleImpactMinutes}m` : "no change"}</span>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={disabled}
            onClick={() => onApply(o)}
            className="w-full py-2 text-xs font-bold text-brand-ink bg-brand hover:brightness-105 transition inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Apply this plan
          </motion.button>
        </CardShell>
      ))}
    </div>
  );
}
