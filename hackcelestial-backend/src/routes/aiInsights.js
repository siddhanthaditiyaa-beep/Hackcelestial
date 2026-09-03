import { Router } from "express";
import { generateTravelInsights, generateTripSuggestions } from "../logic/engine.js";
import { throttle } from "../middleware/throttle.js";

const router = Router();

// POST /api/ai/insights
// Body: { bookingHistory: [{category, itemName, loc}] } (optional)
router.post("/ai/insights", throttle({ max: 15 }), async (req, res) => {
  try {
    const { bookingHistory = [] } = req.body || {};
    const insights = await generateTravelInsights(bookingHistory);
    res.json(insights);
  } catch (err) {
    console.error("ai/insights error:", err);
    res.status(500).json({ error: "Failed to generate insights" });
  }
});

// POST /api/ai/trip-suggestions
// Body: { destination }
router.post("/ai/trip-suggestions", throttle({ max: 15 }), async (req, res) => {
  try {
    const { destination } = req.body || {};
    const tips = await generateTripSuggestions(destination);
    res.json(tips);
  } catch (err) {
    console.error("ai/trip-suggestions error:", err);
    res.status(500).json({ error: "Failed to generate trip suggestions" });
  }
});

export default router;
