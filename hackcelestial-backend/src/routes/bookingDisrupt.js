import { Router } from "express";
import { disruptRealBooking } from "../logic/engine.js";
import { recordDisruption } from "../data/disruptionLog.js";
import { throttle } from "../middleware/throttle.js";

const router = Router();

// POST /api/booking-disrupt
// Body: { booking: {id, type, title, vendor, cost, location}, disruptionType, delayMinutes, travelerPreference }
// For real bookings made on the booking platform — not the seeded demo trips.
router.post("/booking-disrupt", throttle({ max: 10 }), async (req, res) => {
  const { booking, disruptionType, delayMinutes = 0, travelerPreference = "balanced" } = req.body;

  if (!booking || !booking.id || !booking.type) {
    return res.status(400).json({ error: "booking (with id and type) is required" });
  }
  if (!disruptionType) {
    return res.status(400).json({ error: "disruptionType is required" });
  }

  try {
    const result = await disruptRealBooking(booking, disruptionType, delayMinutes, travelerPreference);

    recordDisruption({
      type: disruptionType,
      location: booking.location,
      vendor: booking.vendor,
      bookingType: booking.type,
    });

    res.json(result);
  } catch (err) {
    console.error("booking-disrupt error:", err);
    res.status(500).json({ error: "Failed to simulate disruption" });
  }
});

export default router;
