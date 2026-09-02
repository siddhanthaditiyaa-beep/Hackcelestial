import { Router } from "express";
import { getTrip, resetTrip, getAllTrips } from "../data/store.js";
import { computeAtRiskBookings, simulateDelaySensitivity } from "../logic/engine.js";

const router = Router();

// GET /api/itinerary/trips or mounted at /api/trips
router.get("/all-trips", (_req, res) => {
  res.json(getAllTrips());
});

// GET /api/itinerary/:id
router.get("/:id", (req, res) => {
  const state = getTrip(req.params.id);
  if (!state) return res.status(404).json({ error: `Trip '${req.params.id}' not found` });
  res.json({ ...state.trip, bookings: state.bookings });
});

// GET /api/itinerary/:id/at-risk
router.get("/:id/at-risk", (req, res) => {
  const state = getTrip(req.params.id);
  if (!state) return res.status(404).json({ error: `Trip '${req.params.id}' not found` });
  const atRisk = computeAtRiskBookings(state.bookings);
  res.json(atRisk.map((b) => b.id));
});

// POST /api/itinerary/:id/simulate-delay
// Body: { bookingId, delayMinutes }
router.post("/:id/simulate-delay", (req, res) => {
  const { bookingId, delayMinutes = 30 } = req.body;
  const state = getTrip(req.params.id);
  if (!state) return res.status(404).json({ error: `Trip '${req.params.id}' not found` });

  const sensitivity = simulateDelaySensitivity(state.bookings, bookingId);
  res.json({
    tripId: req.params.id,
    bookingId,
    testedDelayMinutes: delayMinutes,
    sensitivityCurve: sensitivity,
  });
});

// POST /api/itinerary/:id/reset
router.post("/:id/reset", (req, res) => {
  const state = resetTrip(req.params.id);
  if (!state) return res.status(404).json({ error: `Trip '${req.params.id}' not found` });
  res.json({ ok: true, itinerary: { ...state.trip, bookings: state.bookings } });
});

export default router;
