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
  } = req.body;

  if (!bookingId) {
    return res.status(400).json({ error: "bookingId is required" });
  }

  const existing = getTrip(tripId);
  if (!existing) return res.status(404).json({ error: `Trip '${tripId}' not found` });

  // Apply full recovery reconstitution
  const result = applyRecovery(tripId, planId, bookingId, downstreamIds);
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
