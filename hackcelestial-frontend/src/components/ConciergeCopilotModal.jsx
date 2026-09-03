import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Copy,
  Check,
  Building,
  Car,
  FileText,
  ShieldCheck,
  Download,
} from "lucide-react";

export default function ConciergeCopilotModal({
  isOpen,
  onClose,
  aiBrief,
  resolvedPlan,
  trip,
}) {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isOpen) return null;

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = () => {
    const content = `RECOUP TRAVEL RESILIENCE INCIDENT REPORT
Trip: ${trip?.tripName || "Trip"}
Traveler: ${trip?.traveler?.name || "Traveler"}
Date: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY:
${aiBrief?.executiveSummary || "Disruption resolved."}

INCIDENT CASCADE:
${aiBrief?.chainReactionExplained?.join("\n") || "Contained"}

APPLIED PLAN:
${resolvedPlan?.label || "Alternative Plan"}
Convenience Score: ${resolvedPlan?.convenienceScore || 90}/100
Net Financial Delta: ₹${resolvedPlan?.costDelta || 0}
`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Recoup-Recovery-Report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="bg-surface rounded-3xl border border-border shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between bg-surface-sunk/40">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-coral-dim flex items-center justify-center text-coral">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-base text-ink">
                  Recoup AI Concierge & Incident Copilot
                </h3>
                <p className="text-xs text-ink-dim">
                  Autonomous agentic reasoning & automated supplier communications
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-border flex items-center justify-center text-ink-dim transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-sm">
            {/* Executive Reasoning Card */}
            <div className="p-4.5 rounded-2xl bg-coral-dim/30 border border-coral/20">
              <div className="flex items-center gap-2 text-xs font-bold text-coral mb-2">
                <ShieldCheck className="h-4 w-4" />
                {aiBrief?.headline || "Autonomous Disruption Recovery"}
              </div>
              <p className="text-xs text-ink-dim leading-relaxed">
                {aiBrief?.executiveSummary ||
                  "The disruption engine has analyzed the dependency topology and isolated downstream booking hazards. All connected itineraries have been adjusted to eliminate cascading cancellations."}
              </p>
            </div>

            {/* Chain Reaction Explained */}
            {aiBrief?.chainReactionExplained && (
              <div>
                <h4 className="font-display font-semibold text-xs text-ink mb-2.5 uppercase tracking-wider">
                  Ripple Effect Analysis
                </h4>
                <div className="space-y-2">
                  {aiBrief.chainReactionExplained.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-surface-sunk border border-border/80 text-xs text-ink-dim flex items-start gap-2.5"
                    >
                      <span className="h-4 w-4 rounded-full bg-border flex items-center justify-center text-[10px] font-bold text-ink shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Auto-Drafted Supplier Communications */}
            {aiBrief?.vendorDrafts && (
              <div>
                <h4 className="font-display font-semibold text-xs text-ink mb-2.5 uppercase tracking-wider">
                  Automated Concierge Communications
                </h4>
                <div className="space-y-3">
                  {/* Hotel Draft */}
                  {aiBrief.vendorDrafts.hotelNotification && (
                    <div className="p-4 rounded-2xl border border-border bg-surface-sunk">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-semibold text-xs text-ink flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-coral" />
                          {aiBrief.vendorDrafts.hotelNotification.recipient}
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(
                              "hotel",
                              aiBrief.vendorDrafts.hotelNotification.message
                            )
                          }
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-coral hover:underline"
                        >
                          {copiedKey === "hotel" ? (
                            <>
                              <Check className="h-3 w-3" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" /> Copy Message
                            </>
                          )}
                        </button>
                      </div>
                      <div className="text-[11px] text-ink-faint font-medium mb-1">
                        Subject: {aiBrief.vendorDrafts.hotelNotification.subject}
                      </div>
                      <pre className="text-xs text-ink-dim font-sans whitespace-pre-wrap bg-surface p-3 rounded-xl border border-border/60">
                        {aiBrief.vendorDrafts.hotelNotification.message}
                      </pre>
                    </div>
                  )}

                  {/* Driver Draft */}
                  {aiBrief.vendorDrafts.driverNotification && (
                    <div className="p-4 rounded-2xl border border-border bg-surface-sunk">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-semibold text-xs text-ink flex items-center gap-1.5">
                          <Car className="h-3.5 w-3.5 text-teal" />
                          {aiBrief.vendorDrafts.driverNotification.recipient}
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(
                              "driver",
                              aiBrief.vendorDrafts.driverNotification.message
                            )
                          }
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-coral hover:underline"
                        >
                          {copiedKey === "driver" ? (
                            <>
                              <Check className="h-3 w-3" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" /> Copy Message
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="text-xs text-ink-dim font-sans whitespace-pre-wrap bg-surface p-3 rounded-xl border border-border/60">
                        {aiBrief.vendorDrafts.driverNotification.message}
                      </pre>
                    </div>
                  )}

                  {/* Insurance Claim Draft */}
                  {aiBrief.vendorDrafts.insuranceClaimFiling && (
                    <div className="p-4 rounded-2xl border border-border bg-surface-sunk">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-semibold text-xs text-ink flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-blue" />
                          {aiBrief.vendorDrafts.insuranceClaimFiling.claimType}
                        </span>
                        <span className="text-xs font-bold text-teal">
                          {aiBrief.vendorDrafts.insuranceClaimFiling.estimatedClaimable}
                        </span>
                      </div>
                      <p className="text-xs text-ink-dim">
                        {aiBrief.vendorDrafts.insuranceClaimFiling.status}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border bg-surface-sunk/30 flex items-center justify-between gap-3">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-sunk text-ink text-xs font-semibold transition"
            >
              <Download className="h-3.5 w-3.5" />
              Download Incident Brief
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-ink text-page text-xs font-semibold hover:opacity-90 transition"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
