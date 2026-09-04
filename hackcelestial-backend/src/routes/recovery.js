import { Router } from "express";
import { getTrip, applyRecovery } from "../data/store.js";

const router = Router();

// POST /api/select-recovery
// Body: { tripId, disruptionId, bookingId, downstreamIds, planId }
router.post("/select-recovery", (req, res) => {
  const {
    tripId = "trip_001",
    bookingId,
    downstreamIds = [],
    planId,
    plan = null,
  } = req.body;

  if (!bookingId) {
    return res.status(400).json({ error: "bookingId is required" });
  }

  const existing = getTrip(tripId);
  if (!existing) return res.status(404).json({ error: `Trip '${tripId}' not found` });

  // Apply full recovery reconstitution. `plan` is the full recovery-option
  // object the frontend already has in memory — used as a fallback when
  // planId isn't found in the static ALTERNATES table (e.g. an AI-generated
  // or dynamically-templated plan), so applying it isn't a silent no-op.
  const result = applyRecovery(tripId, planId, bookingId, downstreamIds, plan);
  if (!result) {
    return res.status(500).json({ error: "Failed to apply recovery plan" });
  }

  const { state, diffs, financialSummary } = result;

  res.json({
    ok: true,
    itinerary: {
      ...state.trip,
      bookings: state.bookings,
    },
    diffs,
    financialSummary,
  });
});

export default router;
