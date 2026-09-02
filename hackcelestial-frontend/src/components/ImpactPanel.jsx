import { motion } from "framer-motion";
import { AlertOctagon, ArrowRight, ShieldAlert } from "lucide-react";

function severityLabel(score) {
  if (score >= 70) return { text: "Severe Cascade", color: "text-pink" };
  if (score >= 40) return { text: "Moderate Impact", color: "text-amber" };
  return { text: "Minor Contained", color: "text-blue" };
}

export default function ImpactPanel({
  disruption,
  impact,
  bookingsById,
  disruptionTypeLabel,
  currency = "INR",
}) {
  if (!disruption || !impact) return null;

  const sev = severityLabel(impact.severityScore);
  const directBooking = bookingsById[impact.directImpact];
  const directTitle = directBooking?.title || impact.directImpact;
  const downstreamTitles = (impact.downstreamImpacts || []).map(
    (id) => bookingsById[id]?.title || id
  );

  const currSym = currency === "INR" ? "₹" : currency === "EUR" ? "€" : currency === "JPY" ? "¥" : "$";
  const fm = impact.financialMetrics;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl border border-pink-dim bg-pink-dim/50 p-6 mb-5 space-y-4"
    >
      <div className="flex items-start gap-3.5">
        <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
          <AlertOctagon className="h-5 w-5 text-pink" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="font-display font-semibold text-sm text-ink truncate">
              {disruptionTypeLabel || "Disruption"} — {directTitle}
            </h3>
            <span className={`text-xs font-bold ${sev.color}`}>
              {sev.text} · {impact.severityScore}/100
            </span>
          </div>

          {/* Severity Progress Bar */}
          <div className="h-2 rounded-full bg-white/80 mt-2.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${impact.severityScore}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`h-full rounded-full ${
                impact.severityScore >= 70
                  ? "bg-pink"
                  : impact.severityScore >= 40
                  ? "bg-amber"
                  : "bg-blue"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Ripple Domino Chain */}
      {downstreamTitles.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-white/70 border border-border-light text-xs text-ink-dim space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-ink">
            <ShieldAlert className="h-3.5 w-3.5 text-pink" />
            Cascading Ripple Path ({downstreamTitles.length + 1} bookings affected):
          </div>
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-medium text-ink">
            <span className="px-2 py-0.5 rounded-md bg-pink text-white">
              {directTitle.split(" ")[0]}
            </span>
            {downstreamTitles.map((title, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ArrowRight className="h-3 w-3 text-pink" />
                <span className="px-2 py-0.5 rounded-md bg-amber-dim text-amber border border-amber/30">
                  {title.split(" ")[0]}
                </span>
              </span>
            ))}
          </div>
          <p className="text-[11px] text-ink-faint leading-relaxed mt-1">
            Inbound delay propagates downstream, collapsing connection buffers and threatening subsequent reservations.
          </p>
        </div>
      )}

      {/* Financial Exposure Readout */}
      {fm && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-2xl bg-white/80 border border-border-light">
            <span className="text-[10px] text-ink-faint font-semibold uppercase tracking-wider block">
              Total Booking Value at Risk
            </span>
            <span className="text-sm font-bold text-ink font-mono mt-0.5 block">
              {currSym}{fm.totalExposedCost.toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-white/80 border border-border-light">
            <span className="text-[10px] text-ink-faint font-semibold uppercase tracking-wider block">
              Recoverable via Policy
            </span>
            <span className="text-sm font-bold text-teal font-mono mt-0.5 block">
              {currSym}{fm.recoverableRefund.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
