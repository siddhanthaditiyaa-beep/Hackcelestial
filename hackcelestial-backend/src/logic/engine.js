import { ALTERNATES, DISRUPTION_SEVERITY_BASE } from "../data/seed.js";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const apiKey = process.env.GEMINI_API_KEY;
export const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// The Gemini SDK call has no built-in timeout — a slow/hanging response would
// otherwise leave a request (and the UI waiting on it) hanging indefinitely.
// Every ai.models.generateContent call in this file goes through this.
function generateWithTimeout(params, timeoutMs = 12_000) {
  return Promise.race([
    ai.models.generateContent(params),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Gemini request timed out")), timeoutMs)),
  ]);
}

// One retry with a short delay on a transient error (rate limit / overload /
// our own timeout) before the caller falls through to its static fallback.
// Not a queue or real rate limiter — just enough to smooth over a blip.
export async function generateWithRetry(params, { timeoutMs = 12_000, retryDelayMs = 800 } = {}) {
  try {
    return await generateWithTimeout(params, timeoutMs);
  } catch (err) {
    const status = err?.status;
    const retryable = status === 429 || status === 503 || /timed out/i.test(err?.message || "");
    if (!retryable) throw err;
    await new Promise((r) => setTimeout(r, retryDelayMs));
    return generateWithTimeout(params, timeoutMs);
  }
}

// Tiny in-memory TTL cache for the two "content" AI calls (insights, trip
// suggestions) — these get called from component mounts/tab switches far
// more often than a user actually wants fresh content, so a short cache cuts
// real duplicate load. Deliberately NOT used for recovery options / incident
// briefs, which must reflect the specific disruption being handled, and
// deliberately bypassable (skipCache) so the UI's own "Refresh" affordances
// still do what they say.
const aiCache = new Map(); // key -> { value, expiresAt }
const CACHE_TTL_MS = 90_000;

function getCached(key) {
  const entry = aiCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    aiCache.delete(key);
    return null;
  }
  return entry.value;
}

function setCached(key, value) {
  aiCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

/**
 * Enhanced graph traversal (BFS) computing direct and downstream cascade impacts.
 * Distinguishes hard breaches (buffer collapsed) from soft tight-connection warnings.
 */
export function computeDownstreamImpact(bookings, disruptedId, delayMinutes = 0, disruptionType = "delay") {
  const byId = Object.fromEntries(bookings.map((b) => [b.id, b]));
  const downstream = [];
  const queue = [disruptedId];
  const seen = new Set([disruptedId]);
  const cascadePaths = {}; // childId -> [ancestorIds]

  while (queue.length) {
    const current = queue.shift();
    const currentPath = cascadePaths[current] || [current];

    for (const b of bookings) {
      if (b.dependsOn.includes(current) && !seen.has(b.id)) {
        seen.add(b.id);
        downstream.push(b.id);
        cascadePaths[b.id] = [...currentPath, b.id];
        queue.push(b.id);
      }
    }
  }

  const downstreamBookings = downstream.map((id) => byId[id]).filter(Boolean);

  // Calculate financial exposure
  const disruptedBooking = byId[disruptedId];
  const directCost = disruptedBooking?.cost || 0;
  let downstreamCost = 0;
  let recoverableRefund = 0;

  if (disruptedBooking?.cancellationPolicy) {
    recoverableRefund += Math.round(
      (directCost * (disruptedBooking.cancellationPolicy.refundPct || 0)) / 100
    );
  }

  for (const b of downstreamBookings) {
    downstreamCost += b.cost || 0;
    if (b.cancellationPolicy) {
      recoverableRefund += Math.round(
        ((b.cost || 0) * (b.cancellationPolicy.refundPct || 0)) / 100
      );
    }
  }

  // Determine hard failures vs soft warnings based on delay
  const hardFailures = [];
  const tightWarnings = [];

  for (const b of downstreamBookings) {
    const buffer = b.bufferMinutes ?? 60;
    if (delayMinutes > 0) {
      const remainingBuffer = buffer - delayMinutes;
      if (remainingBuffer <= 0) {
        hardFailures.push({
          id: b.id,
          title: b.title,
          deficitMinutes: Math.abs(remainingBuffer),
          reason: `Buffer breached by ${Math.abs(remainingBuffer)} mins due to ${delayMinutes}m inbound delay`,
        });
      } else if (remainingBuffer < 45) {
        tightWarnings.push({
          id: b.id,
          title: b.title,
          remainingBuffer,
          reason: `Buffer shrunk to ${remainingBuffer} mins (tight connection warning)`,
        });
      }
    } else {
      // Default: immediate child is at severe risk, subsequent are dependent
      if (b.dependsOn.includes(disruptedId)) {
        hardFailures.push({
          id: b.id,
          title: b.title,
          reason: `Direct dependency on disrupted ${disruptedBooking?.type || "booking"}`,
        });
      }
    }
  }

  return {
    disruptedBooking,
    downstream: downstreamBookings,
    downstreamIds: downstream,
    cascadePaths,
    hardFailures,
    tightWarnings,
    financialMetrics: {
      directCost,
      downstreamCost,
      totalExposedCost: directCost + downstreamCost,
      recoverableRefund,
      netRiskExposure: Math.max(0, directCost + downstreamCost - recoverableRefund),
    },
  };
}

/**
 * Identify bookings with thin connection buffers (< threshold) before any disruption occurs.
 */
export function computeAtRiskBookings(bookings, thresholdMinutes = 60) {
  return bookings.filter(
    (b) => b.bufferMinutes !== null && b.bufferMinutes !== undefined && b.bufferMinutes <= thresholdMinutes
  );
}

/**
 * Multi-factor severity score (0-100) taking into account disruption type,
 * cascade depth, total bookings affected, and buffer tightness.
 */
export function computeSeverity(disruptionType, downstreamCount, atRiskAmongDownstream, isHardFailure = false) {
  const base = DISRUPTION_SEVERITY_BASE[disruptionType] ?? 35;
  const cascadeWeight = Math.min(downstreamCount * 12, 45);
  const tightnessWeight = Math.min(atRiskAmongDownstream * 10, 25);
  const hardFailurePenalty = isHardFailure ? 10 : 0;

  return Math.min(Math.round(base + cascadeWeight + tightnessWeight + hardFailurePenalty), 100);
}

/**
 * Proactive "What-If" Buffer Sensitivity Analyzer.
 * Evaluates delay increments to pinpoint exactly when connections break.
 */
export function simulateDelaySensitivity(bookings, bookingId) {
  const target = bookings.find((b) => b.id === bookingId);
  if (!target) return [];

  // Find immediate children
  const directDependents = bookings.filter((b) => b.dependsOn.includes(bookingId));
  const testDelays = [15, 30, 45, 60, 90, 120, 180];

  return testDelays.map((delay) => {
    let brokenCount = 0;
    let atRiskCount = 0;
    const affected = [];

    directDependents.forEach((child) => {
      const buf = child.bufferMinutes ?? 60;
      const margin = buf - delay;
      if (margin <= 0) {
        brokenCount += 1;
        affected.push({ id: child.id, title: child.title, status: "broken", margin });
      } else if (margin < 40) {
        atRiskCount += 1;
        affected.push({ id: child.id, title: child.title, status: "at-risk", margin });
      } else {
        affected.push({ id: child.id, title: child.title, status: "safe", margin });
      }
    });

    return {
      delayMinutes: delay,
      brokenCount,
      atRiskCount,
      severity: Math.min(100, Math.round(20 + brokenCount * 30 + atRiskCount * 15)),
      affected,
    };
  });
}

/**
 * Generates ranked, multi-criteria recovery options tailored to traveler preferences.
 * Preferences: 'balanced' (default), 'budget', 'speed', 'comfort'.
 */
export async function generateRecoveryOptions(allBookings, disruptedId, downstreamIds, preference = "balanced") {
  const affectedIds = [disruptedId, ...downstreamIds];
  const totalBookings = allBookings.length;
  const disruptedBooking = allBookings.find((b) => b.id === disruptedId);
  const rawAlternates = ALTERNATES[disruptedId] || [];

  let alternatesList = rawAlternates;

  if (ai && (!alternatesList || alternatesList.length === 0)) {
    try {
      const prompt = `You are a Travel Disruption Recovery Engine. A user has experienced a disruption.
Disrupted Booking: ${JSON.stringify(disruptedBooking)}
Downstream Bookings count: ${downstreamIds.length}
Traveler Preference: ${preference}

Generate exactly 3 diverse alternative recovery options as a JSON array.
Each object MUST have these exact keys:
- "id": string (unique ID)
- "title": string (short descriptive title)
- "strategy": string (budget, speed, comfort, or balanced)
- "subtitle": string (brief detail)
- "costDelta": number (estimated extra cost in local currency, negative for refund/saving)
- "refundEstimated": number
- "timeDeltaMinutes": number (schedule change in minutes)
- "vendor": string (supplier name)
- "badge": string (short highlight, e.g., "Fastest Option")
- "convenienceScore": number (0-100 base score before preference adjustments)
- "mitigations": array of 1-3 short strings detailing the fix

Ensure the options are creative, realistic, and tailored to the preference.`;
      
      const response = await generateWithRetry({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
      const generated = JSON.parse(response.text);
      if (Array.isArray(generated) && generated.length > 0) {
        alternatesList = generated;
      }
    } catch (err) {
      console.error("AI recovery generation failed:", err);
    }
  }

  // If no static or AI alternates exist, generate dynamic resilient recovery plans fallback
  if (!alternatesList || alternatesList.length === 0) {
    alternatesList = [
    {
      id: `alt_dyn_${disruptedId}_1`,
      title: `Reschedule ${disruptedBooking?.title || "booking"} to next slot`,
      strategy: "balanced",
      subtitle: "Carrier re-accommodation with priority seat protection",
      costDelta: 0,
      refundEstimated: Math.round((disruptedBooking?.cost || 5000) * 0.8),
      timeDeltaMinutes: 120,
      vendor: disruptedBooking?.vendor || "Preferred Provider",
      badge: "Fee-Free Reschedule",
      convenienceScore: 90,
      mitigations: ["Automated supplier coordination notification dispatched"],
    },
    {
      id: `alt_dyn_${disruptedId}_2`,
      title: `Express alternate via priority on-demand booking`,
      strategy: "speed",
      subtitle: "Immediate alternative service to preserve remaining schedule",
      costDelta: Math.round((disruptedBooking?.cost || 5000) * 0.25),
      refundEstimated: Math.round((disruptedBooking?.cost || 5000) * 0.7),
      timeDeltaMinutes: 30,
      vendor: "Express Dispatch",
      badge: "Fastest Option",
      convenienceScore: 86,
      mitigations: ["Fastest pickup to eliminate downstream cascade"],
    },
    {
      id: `alt_dyn_${disruptedId}_3`,
      title: `Cancel & claim 100% policy refund`,
      strategy: "budget",
      subtitle: "Receive full cash credit and skip non-critical component",
      costDelta: -(disruptedBooking?.cost || 3000),
      refundEstimated: disruptedBooking?.cost || 3000,
      timeDeltaMinutes: 0,
      vendor: "Direct Refund",
      badge: "Full Refund",
      convenienceScore: 78,
      mitigations: ["Direct refund to original payment source"],
    },
  ];
  }

  const plans = alternatesList.map((alt, idx) => {
    const costDelta = alt.costDelta || 0;
    const timeDeltaMinutes = alt.timeDeltaMinutes || 0;
    const refundEstimated = alt.refundEstimated || 0;
    const itineraryAffectedPct = Math.round((affectedIds.length / Math.max(1, totalBookings)) * 100);

    // Multi-factor scoring with weights tailored to preference profile
    let convenienceScore = alt.convenienceScore || 85;

    if (preference === "budget") {
      // Heavily penalize additional spending; reward negative costDelta (savings/refunds)
      if (costDelta > 0) convenienceScore -= (costDelta / 150);
      else convenienceScore += Math.min(20, Math.abs(costDelta) / 200);
    } else if (preference === "speed") {
      // Heavily penalize schedule delay
      convenienceScore -= (timeDeltaMinutes / 15);
      if (costDelta > 0 && timeDeltaMinutes <= 60) convenienceScore += 10;
    } else if (preference === "comfort") {
      // Prioritize seamless transitions, minimal friction
      if (alt.strategy === "comfort" || alt.badge?.toLowerCase().includes("upgrade")) convenienceScore += 15;
      convenienceScore -= (Math.max(0, timeDeltaMinutes - 60) / 20);
    } else {
      // Balanced: standard trade-off
      convenienceScore = 100 - (Math.max(0, costDelta) / 250) - (Math.max(0, timeDeltaMinutes) / 25);
    }

    convenienceScore = Math.max(10, Math.min(100, Math.round(convenienceScore)));

    return {
      id: alt.id || `plan_${disruptedId}_${idx}`,
      label: alt.title,
      strategy: alt.strategy || "balanced",
      subtitle: alt.subtitle || "",
      costDelta,
      refundEstimated,
      netOutOfPocket: Math.max(0, costDelta - refundEstimated),
      timeDeltaMinutes,
      newStartTime: alt.newStartTime,
      newEndTime: alt.newEndTime,
      vendor: alt.vendor || disruptedBooking?.vendor,
      badge: alt.badge || (idx === 0 ? "Top Pick" : null),
      convenienceScore,
      itineraryAffectedPct,
      mitigations: alt.mitigations || [
        "Dependencies automatically updated",
        "Itinerary schedule synchronized",
      ],
      recommended: false,
    };
  });

  if (plans.length > 0) {
    // Sort descending by convenienceScore and mark highest as recommended
    plans.sort((a, b) => b.convenienceScore - a.convenienceScore);
    plans[0].recommended = true;
  }

  return plans;
}

/**
 * Reconstitutes the itinerary when a recovery plan is selected:
 * Updates disrupted booking, adjusts downstream schedule/buffers, and marks statuses as resolved.
 */
export function applyRecoveryPlanToItinerary(trip, planId, bookingId, downstreamIds = [], fallbackPlan = null) {
  const allAlternates = Object.values(ALTERNATES).flat();
  // AI-generated and dynamically-templated recovery options (built in
  // generateRecoveryOptions) were never added to the static ALTERNATES
  // table, so the lookup above misses for them — that used to mean
  // "apply" silently did nothing. fallbackPlan is the full option object
  // the frontend already has in memory; use it when the static lookup
  // misses. It uses `label` where ALTERNATES entries use `title` — normalize.
  const selectedAlt =
    allAlternates.find((a) => a.id === planId) ||
    (fallbackPlan ? { ...fallbackPlan, title: fallbackPlan.title || fallbackPlan.label } : null);

  const diffs = [];
  let refundTotal = 0;
  let costDeltaTotal = 0;

  const updatedBookings = trip.bookings.map((booking) => {
    if (booking.id === bookingId) {
      const originalTime = `${booking.startTime} - ${booking.endTime}`;
      const newStart = selectedAlt?.newStartTime || booking.startTime;
      const newEnd = selectedAlt?.newEndTime || booking.endTime;
      const newVendor = selectedAlt?.vendor || booking.vendor;

      costDeltaTotal += selectedAlt?.costDelta || 0;
      refundTotal += selectedAlt?.refundEstimated || 0;

      diffs.push({
        bookingId: booking.id,
        title: booking.title,
        changeType: "replaced",
        details: `Replaced with ${selectedAlt?.title || "selected recovery"}. Times: ${originalTime} \u2192 ${newStart} - ${newEnd}`,
      });

      return {
        ...booking,
        title: selectedAlt?.title ? `${selectedAlt.title}` : booking.title,
        vendor: newVendor,
        startTime: newStart,
        endTime: newEnd,
        status: "resolved",
        recoveryPlanApplied: selectedAlt?.title || "Plan Applied",
      };
    }

    if (downstreamIds.includes(booking.id)) {
      diffs.push({
        bookingId: booking.id,
        title: booking.title,
        changeType: "realigned",
        details: `Connection buffer restored. Status updated to confirmed/resolved.`,
      });

      return {
        ...booking,
        status: "resolved",
      };
    }

    return booking;
  });

  return {
    updatedBookings,
    diffs,
    financialSummary: {
      refundTotal,
      costDeltaTotal,
      netChange: costDeltaTotal - refundTotal,
    },
  };
}

/**
 * AI Incident Copilot generator:
 * Synthesizes human-readable explanations, reasonings, and auto-notifications for drivers and hotels.
 */
export async function generateAIIncidentBrief(disruption, impact, recoveryPlan, bookingsById, currency = "INR") {
  const directBooking = bookingsById[disruption.bookingId];
  const downstreamTitles = impact.downstreamImpacts
    .map((id) => bookingsById[id]?.title)
    .filter(Boolean);

  const directTitle = directBooking?.title || "Transport booking";
  const currSym = currency === "INR" ? "\u20b9" : currency === "EUR" ? "\u20ac" : "\u00a5";

  if (ai) {
    try {
      const prompt = `You are an AI Travel Incident Copilot. Generate a structured JSON incident brief for a disruption.
Disruption Type: ${disruption.type.replace(/_/g, " ")}
Directly Impacted Booking: ${directTitle}
Downstream Bookings at Risk: ${downstreamTitles.join(", ") || "None"}
Recovery Plan Applied: ${JSON.stringify(recoveryPlan)}
Currency Symbol: ${currSym}

Return ONLY a JSON object with these EXACT keys:
- "headline": string (Short catchy incident title)
- "executiveSummary": string (2-3 sentences explaining the cascade and resolution)
- "chainReactionExplained": array of 3 strings explaining: 1) Root Cause, 2) Cascade Effect, 3) Mitigation
- "vendorDrafts": object containing:
  - "hotelNotification": object with "recipient", "subject", "message" (or null if irrelevant)
  - "driverNotification": object with "recipient", "subject", "message" (or null if irrelevant)
  - "insuranceClaimFiling": object with "claimType", "estimatedClaimable" (string with currency), "status"

Draft realistic and professional communications for the vendors.`;
      const response = await generateWithRetry({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
      return JSON.parse(response.text);
    } catch (err) {
      console.error("AI brief generation failed:", err);
    }
  }

  const headline = `Incident Recovered: ${directTitle}`;
  const executiveSummary = `Recoup's Resilience Engine intercepted a cascade failure originating from ${directTitle}. By applying "${recoveryPlan.label}", we recovered ${currSym}${recoveryPlan.refundEstimated.toLocaleString()} under carrier policy, prevented ${downstreamTitles.length} downstream bookings from cancellation, and restored the itinerary with a convenience rating of ${recoveryPlan.convenienceScore}/100.`;

  const chainReactionExplained = [
    `Root Cause: ${disruption.type.replace(/_/g, " ").toUpperCase()} triggered on ${directTitle}.`,
    downstreamTitles.length > 0
      ? `Cascade Effect: Created immediate buffer pressure on: ${downstreamTitles.join(" \u2192 ")}.`
      : "Cascade Effect: Disruption was contained locally without breaking subsequent legs.",
    `Mitigation: Re-indexed schedule via ${recoveryPlan.vendor || "designated alternative"} with net out-of-pocket change of ${currSym}${recoveryPlan.costDelta.toLocaleString()}.`,
  ];

  const vendorDrafts = {
    hotelNotification: directBooking?.type !== "hotel" ? {
      recipient: "Hotel Reception & Guest Concierge",
      subject: `Arrival Update & Late Check-in Notice — ${directBooking?.tripId || "Booking"}`,
      message: `Dear Concierge,\n\nPlease note our arrival is now updated due to flight rescheduling. Our expected check-in is revised. Please keep our reservation confirmed and authorize late arrival digital access. Thank you for your hospitality.`,
    } : null,
    driverNotification: directBooking?.type !== "transfer" ? {
      recipient: "Airport Chauffeur Dispatch",
      subject: `Updated Flight & Pickup Window`,
      message: `Hello Made Wirawan,\n\nOur incoming flight has been rescheduled. We will now meet you at Terminal Arrivals Gate 3 with our updated arrival time. Flight details synced.`,
    } : null,
    insuranceClaimFiling: {
      claimType: "Trip Delay & Misconnection Expense",
      estimatedClaimable: `${currSym}${Math.max(0, recoveryPlan.costDelta)}`,
      status: "Ready to file with 1-click digital receipt bundle",
    },
  };

  return {
    headline,
    executiveSummary,
    chainReactionExplained,
    vendorDrafts,
  };
}

const STATIC_INSIGHTS = [
  { icon: "✈️", text: "Bali in November — perfect weather, off-peak pricing. Flights from ₹18,500.", category: "flights", destinationHint: "Bali" },
  { icon: "🏨", text: "Book 3+ nights for 15% discount. Ubud hotels filling fast this week.", category: "hotels", destinationHint: "Bali" },
  { icon: "🚄", text: "Train to Kerala 40% cheaper than flights & scenic. Seats dropping fast.", category: "trains", destinationHint: "Kerala" },
  { icon: "🎭", text: "Uluwatu Kecak Dance sold out Nov 16 — book Day 2 activity now.", category: "activities", destinationHint: "Bali" },
  { icon: "🌴", text: "Maldives overwater villas: best rates in Sept–Oct before peak season.", category: "hotels", destinationHint: "Maldives" },
  { icon: "🗼", text: "Paris + Rome combo: saves ₹12,000 vs. booking separately.", category: "flights", destinationHint: "Paris" },
  { icon: "🏔", text: "Ladakh road-trip season closes Dec 1 — only 3 weeks left to book.", category: "activities", destinationHint: "Leh Ladakh" },
  { icon: "🎌", text: "Japan cherry blossom season peaks late March — hotel spots gone in 2 weeks.", category: "hotels", destinationHint: "Tokyo" },
];

/**
 * Fresh AI Travel Insights — 6-8 structured suggestion cards, optionally
 * personalized against the traveler's real booking history. Returns
 * structured fields (not free text) so the frontend can route a card click
 * straight into a destination/category view.
 */
export async function generateTravelInsights(bookingHistory = [], { skipCache = false } = {}) {
  const cacheKey = `insights:${JSON.stringify(bookingHistory)}`;
  if (!skipCache) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  if (ai) {
    try {
      const historyLine = bookingHistory.length
        ? bookingHistory.map((b) => `${b.category || b.type}: ${b.itemName || b.title} (${b.loc || ""})`).join("; ")
        : "No bookings yet — generate broadly appealing suggestions.";

      const prompt = `You are Recoup's AI travel insights generator for a booking platform (flights, trains, hotels, hostels, activities).
Traveler's recent bookings: ${historyLine}

Generate exactly 7 diverse, fresh, specific travel insight cards as a JSON array. Vary destinations and categories each time — do not just repeat generic tips.
Each object MUST have these exact keys:
- "icon": string (single relevant emoji)
- "text": string (one punchy sentence, under 110 characters, mention a concrete detail like a price, date window, or % saving)
- "category": string (one of: flights, trains, hotels, hostels, activities)
- "destinationHint": string (a real city/place name this insight is about)

If the traveler has bookings, bias roughly half the suggestions toward destinations/categories related to their history (e.g. "since you booked X, consider Y nearby"), and the rest toward fresh discovery.`;

      const response = await generateWithRetry({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });
      const generated = JSON.parse(response.text);
      if (Array.isArray(generated) && generated.length > 0) {
        setCached(cacheKey, generated);
        return generated;
      }
    } catch (err) {
      console.error("AI travel insights generation failed:", err);
    }
  }

  // Fallback: shuffle the static list so "refresh" still feels different.
  return [...STATIC_INSIGHTS].sort(() => Math.random() - 0.5);
}

const STATIC_TRIP_TIPS = [
  { emoji: "🍜", title: "Eat where the locals eat", text: "Skip the hotel restaurant — night markets and family-run spots are cheaper and better.", vibe: "food" },
  { emoji: "🎒", title: "Pack light, pack smart", text: "A universal adapter and one extra power bank solve 90% of travel-day headaches.", vibe: "practical" },
  { emoji: "🌅", title: "Chase the golden hour", text: "Book sunrise or sunset activities first — they sell out fastest and photograph best.", vibe: "adventure" },
];

/**
 * AI-generated "fun" trip tips for a specific destination — powers the
 * Trip Suggestions tab and the destination bundle "coming soon" fallback.
 */
export async function generateTripSuggestions(destination, { skipCache = false } = {}) {
  const cacheKey = `trip-suggestions:${destination || ""}`;
  if (!skipCache) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  if (ai) {
    try {
      const prompt = `You are a well-traveled, enthusiastic local guide. Generate exactly 4 fun, specific, non-generic travel tips for a trip to "${destination || "a popular destination"}" as a JSON array.
Each object MUST have these exact keys:
- "emoji": string (single relevant emoji)
- "title": string (short punchy title, under 40 characters)
- "text": string (one or two sentences, concrete and specific to the destination, under 160 characters)
- "vibe": string (one of: food, adventure, culture, budget, luxury, practical)

Make it feel like insider knowledge, not a Wikipedia summary.`;

      const response = await generateWithRetry({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });
      const generated = JSON.parse(response.text);
      if (Array.isArray(generated) && generated.length > 0) {
        setCached(cacheKey, generated);
        return generated;
      }
    } catch (err) {
      console.error("AI trip suggestions generation failed:", err);
    }
  }

  return STATIC_TRIP_TIPS;
}

const DEFAULT_CANCELLATION_POLICY = {
  flight: { refundPct: 70, windowHours: 24 },
  train: { refundPct: 80, windowHours: 6 },
  hotel: { refundPct: 50, windowHours: 48 },
  activity: { refundPct: 0, windowHours: 12 },
  transfer: { refundPct: 60, windowHours: 4 },
};

/**
 * Disrupt + recover a real booking (or a bundle of them) from the booking
 * platform, not the seeded demo trips. Reuses the same cascade/severity/AI
 * machinery as the demo-trip flow. `bookings` is the full group the
 * disrupted one belongs to (a bundle checkout's sibling items, each already
 * carrying its own `dependsOn` referencing sibling ids) — for a standalone
 * booking with no bundle, callers pass a single-element array and
 * computeDownstreamImpact naturally finds no downstream bookings.
 */
export async function disruptRealBooking(bookings, disruptedId, disruptionType, delayMinutes = 0, preference = "balanced") {
  const normalized = bookings.map((booking) => ({
    ...booking,
    dependsOn: Array.isArray(booking.dependsOn) ? booking.dependsOn : [],
    bufferMinutes: booking.bufferMinutes ?? null,
    cancellationPolicy: booking.cancellationPolicy || DEFAULT_CANCELLATION_POLICY[booking.type] || null,
  }));

  const cascade = computeDownstreamImpact(normalized, disruptedId, delayMinutes, disruptionType);
  const atRiskAmongDownstream = computeAtRiskBookings(cascade.downstream).length;
  const severityScore = computeSeverity(disruptionType, cascade.downstreamIds.length, atRiskAmongDownstream, cascade.hardFailures.length > 0);

  const recoveryOptions = await generateRecoveryOptions(normalized, disruptedId, cascade.downstreamIds, preference);

  const disruptionMeta = {
    id: `dis_real_${Date.now()}`,
    bookingId: disruptedId,
    type: disruptionType,
    delayMinutes: Number(delayMinutes) || 0,
    triggeredAt: new Date().toISOString(),
  };

  const bookingsById = Object.fromEntries(normalized.map((b) => [b.id, b]));
  const topPlan = recoveryOptions.find((p) => p.recommended) || recoveryOptions[0];
  const aiBrief = topPlan
    ? await generateAIIncidentBrief(
        disruptionMeta,
        { directImpact: disruptedId, downstreamImpacts: cascade.downstreamIds },
        topPlan,
        bookingsById,
        "INR"
      )
    : null;

  return {
    disruption: disruptionMeta,
    impact: {
      directImpact: disruptedId,
      downstreamImpacts: cascade.downstreamIds,
      cascadePaths: cascade.cascadePaths,
      hardFailures: cascade.hardFailures,
      tightWarnings: cascade.tightWarnings,
      severityScore,
      financialMetrics: cascade.financialMetrics,
    },
    recoveryOptions,
    aiBrief,
  };
}
