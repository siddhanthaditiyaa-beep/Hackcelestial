import { Router } from "express";
import { findMatchingDisruptions } from "../data/disruptionLog.js";

const router = Router();

// POST /api/risk-check
// Body: { type, location, vendor } — pure lookup, no AI, cheap enough to
// call on every booking-modal open.
router.post("/risk-check", (req, res) => {
  const { type, location, vendor } = req.body || {};
  const matches = findMatchingDisruptions({ bookingType: type, location, vendor });
  res.json({ atRisk: matches.length > 0, matches: matches.slice(0, 3) });
});

export default router;
