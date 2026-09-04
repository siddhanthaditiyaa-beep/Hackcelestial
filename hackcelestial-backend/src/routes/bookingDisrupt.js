import { Router } from "express";
import { disruptRealBooking } from "../logic/engine.js";
import { recordDisruption } from "../data/disruptionLog.js";
import { throttle } from "../middleware/throttle.js";

const router = Router();

// POST /api/booking-disrupt
// Body EITHER:
//   { booking: {id, type, title, vendor, cost, location}, disruptionType, delayMinutes, travelerPreference }
//   (a standalone real booking, no bundle siblings)
// OR:
//   { bookings: [{id, type, ..., dependsOn}], disruptedBookingId, disruptionType, delayMinutes, travelerPreference }
//   (a bundle checkout's full sibling group, so the cascade is real)
// For real bookings made on the booking platform — not the seeded demo trips.
router.post("/booking-disrupt", throttle({ max: 10 }), async (req, res) => {
  const {
    booking,
    bookings,
    disruptedBookingId,
    disruptionType,
    delayMinutes = 0,
    travelerPreference = "balanced",
  } = req.body;

  const group = Array.isArray(bookings) && bookings.length ? bookings : booking ? [booking] : null;
  const disruptedId = disruptedBookingId || booking?.id;

  if (!group || !disruptedId || !group.some((b) => b.id === disruptedId)) {
    return res.status(400).json({ error: "booking (or bookings + disruptedBookingId) is required" });
  }
  if (group.some((b) => !b.id || !b.type)) {
    return res.status(400).json({ error: "every booking needs an id and type" });
  }
  if (!disruptionType) {
    return res.status(400).json({ error: "disruptionType is required" });
  }

  try {
    const result = await disruptRealBooking(group, disruptedId, disruptionType, delayMinutes, travelerPreference);

    const disruptedBooking = group.find((b) => b.id === disruptedId);
    recordDisruption({
      type: disruptionType,
      location: disruptedBooking.location,
      vendor: disruptedBooking.vendor,
      bookingType: disruptedBooking.type,
    });

    res.json(result);
  } catch (err) {
    console.error("booking-disrupt error:", err);
    res.status(500).json({ error: "Failed to simulate disruption" });
  }
});

export default router;
