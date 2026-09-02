import { ALTERNATES, DISRUPTION_SEVERITY_BASE } from "../data/mockData";

// Find every booking that transitively depends on the disrupted booking.
export function computeDownstreamImpact(bookings, disruptedId) {
  const byId = Object.fromEntries(bookings.map((b) => [b.id, b]));
  const downstream = [];
  const queue = [disruptedId];
  const seen = new Set([disruptedId]);

  while (queue.length) {
    const current = queue.shift();
    for (const b of bookings) {
      if (b.dependsOn.includes(current) && !seen.has(b.id)) {
        seen.add(b.id);
        downstream.push(b.id);
        queue.push(b.id);
      }
    }
  }
  return downstream.map((id) => byId[id]);
}

// Bookings with a tight buffer against whatever they depend on.
export function computeAtRiskBookings(bookings, thresholdMinutes = 60) {
  return bookings.filter(
    (b) => b.bufferMinutes !== null && b.bufferMinutes <= thresholdMinutes
  );
}

// Weighted severity score, 0-100.
export function computeSeverity(disruptionType, downstreamCount, atRiskAmongDownstream) {
  const base = DISRUPTION_SEVERITY_BASE[disruptionType] ?? 30;
  const cascadeWeight = Math.min(downstreamCount * 10, 40);
  const tightnessWeight = atRiskAmongDownstream * 8;
  return Math.min(Math.round(base + cascadeWeight + tightnessWeight), 100);
}

// Build 1-3 ranked recovery plans from the alternates pool.
export function generateRecoveryOptions(bookings, disruptedId, downstreamIds) {
  const affectedIds = [disruptedId, ...downstreamIds];
  const totalBookings = bookings.length;
  const plans = [];

  const alts = ALTERNATES[disruptedId] ?? [];
  alts.forEach((alt, idx) => {
    const costDelta = alt.costDelta;
    const timeDeltaMinutes = alt.timeDeltaMinutes;
    const itineraryAffectedPct = Math.round(
      (affectedIds.length / totalBookings) * 100
    );
    // Convenience: penalize cost and lost time, reward speed.
    const convenienceScore = Math.max(
      0,
      Math.min(
        100,
        100 - Math.abs(costDelta) / 100 - Math.max(timeDeltaMinutes, 0) / 15
      )
    );
    plans.push({
      id: `plan_${disruptedId}_${idx}`,
      label: alt.title,
      costDelta,
      timeDeltaMinutes,
      convenienceScore: Math.round(convenienceScore),
      itineraryAffectedPct,
      recommended: false,
    });
  });

  // Mark the highest-convenience plan as recommended.
  if (plans.length) {
    const best = plans.reduce((a, b) => (b.convenienceScore > a.convenienceScore ? b : a));
    best.recommended = true;
  }

  return plans;
}
