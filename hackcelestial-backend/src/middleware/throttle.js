// Minimal in-memory per-IP request throttle. Not production rate limiting —
// just a guard against a runaway client hammering the Gemini-backed routes.
// Resets on server restart; no persistence, no per-user quotas.

const buckets = new Map(); // ip -> { count, windowStart }

export function throttle({ windowMs = 60_000, max = 15 } = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    const now = Date.now();
    let bucket = buckets.get(ip);

    if (!bucket || now - bucket.windowStart > windowMs) {
      bucket = { count: 0, windowStart: now };
      buckets.set(ip, bucket);
    }

    bucket.count += 1;

    if (bucket.count > max) {
      return res.status(429).json({ error: "Too many requests — please slow down and try again shortly." });
    }

    next();
  };
}
