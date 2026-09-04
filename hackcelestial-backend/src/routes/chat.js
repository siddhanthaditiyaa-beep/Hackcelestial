import { Router } from "express";
import { runChatTurn } from "../logic/chatAgent.js";
import { throttle } from "../middleware/throttle.js";

const router = Router();

const MAX_TURNS = 40; // guards against a runaway/abusive conversation payload

// POST /api/chat
// Body: { contents: [{role: "user"|"model", parts: [...]}, ...] } — the full
// conversation so far, in Gemini's own Content format. The frontend owns and
// replays this history; this endpoint is stateless.
router.post("/chat", throttle({ max: 20 }), async (req, res) => {
  try {
    const { contents } = req.body || {};
    if (!Array.isArray(contents) || contents.length === 0) {
      return res.status(400).json({ error: "contents must be a non-empty array" });
    }
    if (contents.length > MAX_TURNS) {
      return res.status(400).json({ error: "Conversation too long for this endpoint" });
    }

    const result = await runChatTurn(contents);
    res.json(result);
  } catch (err) {
    console.error("chat error:", err);
    res.status(500).json({ error: "The AI concierge is having trouble responding right now. Please try again." });
  }
});

export default router;
