import { Router } from "express";
import { getTrip, updateBookingStatuses } from "../data/store.js";
import { DISRUPTION_TYPES } from "../data/seed.js";
import {
  computeDownstreamImpact,
  computeAtRiskBookings,
  computeSeverity,
  generateRecoveryOptions,
  generateAIIncidentBrief,
} from "../logic/engine.js";

const router = Router();

// GET /api/disruption-types
router.get("/disruption-types", (_req, res) => {
  res.json(DISRUPTION_TYPES);
});

// POST /api/disrupt
// Body: { tripId, bookingId, type, delayMinutes, travelerPreference }
router.post("/disrupt", (req, res) => {
  const {
    tripId = "trip_001",
    bookingId,
    type,
    delayMinutes = 0,
    travelerPreference = "balanced",
  } = req.body;

  if (!bookingId || !type) {
    return res.status(400).json({ error: "bookingId and type are required" });
  }

  const state = getTrip(tripId);
  if (!state) return res.status(404).json({ error: `Trip '${tripId}' not found` });

  const booking = state.bookings.find((b) => b.id === bookingId);
  if (!booking) return res.status(404).json({ error: "Booking not found" });

  const disruptionType = DISRUPTION_TYPES.find((t) => t.id === type);
  if (!disruptionType) {
    return res.status(400).json({ error: `Unknown disruption type '${type}'` });
  }

  // Verify applicability
  if (!disruptionType.appliesTo.includes(booking.type)) {
    return res.status(400).json({
      error: `Disruption type "${disruptionType.label}" does not apply to a "${booking.type}" booking`,
    });
  }

  // 1. Compute graph-based cascade impact
  const cascade = computeDownstreamImpact(
    state.bookings,
    bookingId,
    delayMinutes,
    type
  );
  const downstreamIds = cascade.downstreamIds;
  const atRiskAmongDownstream = computeAtRiskBookings(cascade.downstream).length;

  // 2. Compute multi-factor severity
  const severityScore = computeSeverity(
    type,
    downstreamIds.length,
    atRiskAmongDownstream,
    cascade.hardFailures.length > 0
  );

  // 3. Update in-memory state
  const statusUpdates = { [bookingId]: "disrupted" };
  downstreamIds.forEach((id) => (statusUpdates[id] = "at-risk"));
  updateBookingStatuses(tripId, statusUpdates);

  // 4. Generate ranked recovery options tailored to traveler preferences
  const recoveryOptions = generateRecoveryOptions(
    state.bookings,
    bookingId,
    downstreamIds,
    travelerPreference
  );

  // 5. Generate AI Incident Copilot Brief
  const bookingsById = Object.fromEntries(state.bookings.map((b) => [b.id, b]));
  const disruptionMeta = {
    id: `dis_${Date.now()}`,
    bookingId,
    type,
    delayMinutes: Number(delayMinutes) || 0,
    triggeredAt: new Date().toISOString(),
  };

  const topPlan = recoveryOptions.find((p) => p.recommended) || recoveryOptions[0];
  const aiBrief = topPlan
    ? generateAIIncidentBrief(
        disruptionMeta,
        { directImpact: bookingId, downstreamImpacts: downstreamIds },
        topPlan,
        bookingsById,
        state.trip.currency || "INR"
      )
    : null;

  res.json({
    disruption: disruptionMeta,
    impact: {
      directImpact: bookingId,
      downstreamImpacts: downstreamIds,
      cascadePaths: cascade.cascadePaths,
      hardFailures: cascade.hardFailures,
      tightWarnings: cascade.tightWarnings,
      severityScore,
      financialMetrics: cascade.financialMetrics,
    },
    recoveryOptions,
    aiBrief,
  });
});

export default router;
