import { motion } from "framer-motion";
import { AlertOctagon } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";

function severityLabel(score) {
  if (score >= 70) return { text: "Severe", color: "text-pink" };
  if (score >= 40) return { text: "Moderate", color: "text-amber" };
  return { text: "Minor", color: "text-blue" };
}

export default function ImpactPanel({ disruption, impact, bookingsById, disruptionTypeLabel }) {
  if (!disruption || !impact) return null;

  const sev = severityLabel(impact.severityScore);
  const directTitle = bookingsById[impact.directImpact]?.title;
  const downstreamTitles = impact.downstreamImpacts.map((id) => bookingsById[id]?.title);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl border border-pink-dim bg-pink-dim/60 p-6 mb-5"
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
          <AlertOctagon className="h-5 w-5 text-pink" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="font-display font-semibold text-sm text-ink">
              {disruptionTypeLabel} — {directTitle}
            </h3>
            <span className={`text-xs font-bold ${sev.color}`}>
              {sev.text} · <AnimatedNumber value={impact.severityScore} />/100
            </span>
          </div>

          <div className="h-2 rounded-full bg-white mt-3 overflow-hidden">
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

          {downstreamTitles.length > 0 && (
            <p className="text-sm text-ink-dim mt-3 leading-relaxed">
              Ripple effect: {downstreamTitles.length} more booking
              {downstreamTitles.length > 1 ? "s are" : " is"} now at risk —{" "}
              <span className="text-ink font-medium">{downstreamTitles.join(", ")}</span>.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
