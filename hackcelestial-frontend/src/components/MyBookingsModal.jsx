import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plane, Train, Building, Tent, Compass, Trash2, Briefcase, Zap, Loader2, ArrowLeft, Luggage } from "lucide-react";
import Modal from "./ui/Modal";
import RecoveryList from "./RecoveryList";
import ImpactPanel from "./ImpactPanel";
import ConciergeCopilotModal from "./ConciergeCopilotModal";
import StatusBadge from "./ui/StatusBadge";
import { useBooking } from "../context/BookingContext";
import { useToast } from "../context/ToastContext";
import { disruptRealBooking, disruptBundleBooking } from "../data/api";
import { requestNotificationPermission, notify } from "../utils/notifications";

const CATEGORY_ICONS = { flights: Plane, trains: Train, hotels: Building, hostels: Tent, activities: Compass };
const CATEGORY_TO_ENGINE_TYPE = { flights: "flight", trains: "train", hotels: "hotel", hostels: "hotel", activities: "activity" };

function pickDisruptionParams(booking) {
  if (booking.category === "flights" || booking.category === "trains") {
    return { disruptionType: "delay", delayMinutes: 45 + Math.floor(Math.random() * 90) };
  }
  return { disruptionType: "cancellation_hotel_activity", delayMinutes: 0 };
}

function toEngineBooking(b) {
  return {
    id: b.id,
    type: CATEGORY_TO_ENGINE_TYPE[b.category] || "flight",
    title: b.itemName,
    vendor: b.itemName,
    cost: b.totalPrice,
    location: b.loc || b.itemName,
    dependsOn: Array.isArray(b.dependsOn) ? b.dependsOn : [],
  };
}

export default function MyBookingsModal({ onClose }) {
  const { confirmedBookings, removeBooking, updateBooking } = useBooking();
  const { push } = useToast();
  const [disruptions, setDisruptions] = useState({}); // bookingId -> {impact, aiBrief, recoveryOptions, bookingsById, triggering, applying, resolvedPlan, appliedDiffs, financialSummary}
  const [copilotBookingId, setCopilotBookingId] = useState(null);

  const setState = (bookingId, patch) => {
    setDisruptions((prev) => ({ ...prev, [bookingId]: { ...prev[bookingId], ...patch } }));
  };

  const { grouped, standalone } = useMemo(() => {
    const groups = {};
    const solo = [];
    confirmedBookings.forEach((b) => {
      if (b.bundleId) {
        (groups[b.bundleId] ||= []).push(b);
      } else {
        solo.push(b);
      }
    });
    return { grouped: Object.entries(groups), standalone: solo };
  }, [confirmedBookings]);

  const handleSimulate = async (booking) => {
    await requestNotificationPermission();
    setState(booking.id, { triggering: true, resolvedPlan: null, appliedDiffs: [], financialSummary: null });

    try {
      const { disruptionType, delayMinutes } = pickDisruptionParams(booking);
      const siblings = booking.bundleId ? confirmedBookings.filter((b) => b.bundleId === booking.bundleId) : [booking];
      const engineGroup = siblings.map(toEngineBooking);
      const bookingsById = Object.fromEntries(siblings.map((b) => [b.id, { title: b.itemName }]));

      const result = engineGroup.length > 1
        ? await disruptBundleBooking(engineGroup, booking.id, disruptionType, delayMinutes, "balanced")
        : await disruptRealBooking(engineGroup[0], disruptionType, delayMinutes, "balanced");

      setState(booking.id, { ...result, bookingsById, triggering: false });
      await updateBooking(booking.id, { status: "disrupted" });
      // Downstream siblings show as "at-risk" until this is resolved or dismissed.
      await Promise.all(
        (result.impact?.downstreamImpacts || []).map((id) => updateBooking(id, { status: "at-risk" }))
      );

      notify(result.aiBrief?.headline || "Booking disrupted", {
        body: result.aiBrief?.executiveSummary || `${booking.itemName} has been disrupted. Recovery options are ready.`,
      });
      push(
        result.aiBrief?.headline || "Booking disrupted",
        result.aiBrief?.executiveSummary || `${booking.itemName} has been disrupted — AI recovery options are ready below.`,
        "disrupted"
      );
    } catch (err) {
      setState(booking.id, { triggering: false });
      push("Couldn't simulate disruption", err.message || "Please try again.", "disrupted");
    }
  };

  const handleApply = async (booking, planId) => {
    const state = disruptions[booking.id];
    const plan = state?.recoveryOptions?.find((p) => p.id === planId);
    if (!plan) return;

    setState(booking.id, { applying: true });
    await new Promise((r) => setTimeout(r, 900)); // simulate reconstitution

    const financialSummary = {
      refundTotal: plan.refundEstimated || 0,
      costDeltaTotal: plan.costDelta || 0,
      netChange: (plan.costDelta || 0) - (plan.refundEstimated || 0),
    };
    const appliedDiffs = [{ title: booking.itemName, details: `Replaced with ${plan.label}. Net cost change ₹${plan.costDelta || 0}.` }];

    setState(booking.id, { applying: false, resolvedPlan: plan, appliedDiffs, financialSummary });
    await updateBooking(booking.id, { status: "resolved", itemName: plan.label || booking.itemName });
    await Promise.all(
      (state.impact?.downstreamImpacts || []).map((id) => updateBooking(id, { status: "resolved" }))
    );
    push("Recovered!", `${plan.label} applied — your trip is protected.`, "resolved");
  };

  const dismissDisruption = (bookingId) => {
    setState(bookingId, { disruption: null, impact: null, recoveryOptions: [], aiBrief: null, resolvedPlan: null, appliedDiffs: [], financialSummary: null });
  };

  const copilotBooking = confirmedBookings.find((b) => b.id === copilotBookingId);
  const copilotState = copilotBookingId ? disruptions[copilotBookingId] : null;

  if (copilotBooking && copilotState) {
    return (
      <ConciergeCopilotModal
        isOpen
        onClose={() => setCopilotBookingId(null)}
        aiBrief={copilotState.aiBrief}
        resolvedPlan={copilotState.resolvedPlan}
        trip={{ tripName: copilotBooking.itemName, traveler: { name: "You" } }}
      />
    );
  }

  const renderBookingRow = (b) => {
    const Icon = CATEGORY_ICONS[b.category] || Plane;
    const state = disruptions[b.id];
    const hasActiveDisruption = state?.impact && !state?.resolvedPlan;

    return (
      <div key={b.id} className="rounded-sm border border-border bg-surface-sunk overflow-hidden">
        <div className="flex items-center gap-3 p-3.5">
          <div className="h-10 w-10 rounded-sm bg-surface border border-border flex items-center justify-center shrink-0 text-ink-dim">
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-sm text-ink truncate">{b.itemName}</div>
            <div className="text-xs text-ink-faint flex items-center gap-1.5 flex-wrap">
              <span>{b.date || "Date pending"} · {b.guests} guest{b.guests > 1 ? "s" : ""}{b.nights ? ` · ${b.nights} nights` : ""}</span>
              {b.status && <StatusBadge status={b.status} />}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-semibold text-sm text-ink">₹{b.totalPrice?.toLocaleString()}</div>
            <button
              onClick={() => removeBooking(b.id)}
              className="inline-flex items-center gap-1 text-[11px] text-ink-faint hover:text-status-disrupted transition mt-1"
            >
              <Trash2 className="h-3 w-3" /> Cancel
            </button>
          </div>
        </div>

        {!state?.impact && !state?.triggering && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSimulate(b)}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-status-risk py-2.5 border-t border-border hover:bg-status-risk-dim transition"
          >
            <Zap className="h-3.5 w-3.5" /> Simulate Disruption
          </motion.button>
        )}

        {state?.triggering && (
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-ink-dim py-2.5 border-t border-border">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Simulating cascade & generating recovery options…
          </div>
        )}

        {hasActiveDisruption && (
          <div className="p-3.5 border-t border-border space-y-3">
            <button
              onClick={() => dismissDisruption(b.id)}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-faint hover:text-ink-dim transition"
            >
              <ArrowLeft className="h-3 w-3" /> Dismiss
            </button>
            <ImpactPanel
              disruption={state.disruption}
              impact={state.impact}
              bookingsById={state.bookingsById || {}}
              disruptionTypeLabel={state.disruption?.type === "delay" ? "Transport Delay" : "Cancellation"}
              currency="INR"
            />
            <RecoveryList
              options={state.recoveryOptions || []}
              onApply={(planId) => handleApply(b, planId)}
              applying={state.applying}
              resolvedPlan={null}
              onDismiss={() => dismissDisruption(b.id)}
              currency="INR"
              onOpenCopilot={() => setCopilotBookingId(b.id)}
            />
          </div>
        )}

        {state?.resolvedPlan && (
          <div className="p-3.5 border-t border-border">
            <RecoveryList
              options={[]}
              onApply={() => {}}
              resolvedPlan={state.resolvedPlan}
              onDismiss={() => dismissDisruption(b.id)}
              appliedDiffs={state.appliedDiffs}
              financialSummary={state.financialSummary}
              currency="INR"
              onOpenCopilot={() => setCopilotBookingId(b.id)}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-lg" className="max-h-[88vh]" showCloseButton>
      <div className="p-6 border-b border-border flex items-center gap-2.5 shrink-0">
        <div className="h-9 w-9 rounded-sm bg-brand-dim flex items-center justify-center text-brand">
          <Briefcase className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display font-medium text-base text-ink">My Bookings</h3>
          <p className="text-xs text-ink-dim">{confirmedBookings.length} confirmed</p>
        </div>
      </div>

      <div className="p-6 overflow-y-auto space-y-5">
        {confirmedBookings.length === 0 ? (
          <p className="text-sm text-ink-faint text-center py-10">No bookings yet — your confirmed trips will show up here.</p>
        ) : (
          <>
            {grouped.map(([bundleId, items]) => {
              const total = items.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
              return (
                <div key={bundleId} className="rounded-md border border-brand/30 bg-brand-dim/30 p-3 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 px-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand uppercase tracking-wide">
                      <Luggage className="h-3.5 w-3.5" /> Trip Bundle · {items.length} item{items.length > 1 ? "s" : ""}
                    </span>
                    <span className="text-xs font-semibold text-ink">₹{total.toLocaleString()}</span>
                  </div>
                  {items.map(renderBookingRow)}
                </div>
              );
            })}

            {standalone.length > 0 && (
              <div className="space-y-3">
                {grouped.length > 0 && (
                  <div className="text-[11px] font-bold text-ink-faint uppercase tracking-wide px-1">Other Bookings</div>
                )}
                {standalone.map(renderBookingRow)}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
