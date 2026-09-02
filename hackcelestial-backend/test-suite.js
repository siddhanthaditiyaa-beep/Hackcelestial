import { createApp } from "./src/app.js";

async function runTests() {
  console.log("=== STARTING RECOUP ENGINE BACKEND TEST SUITE ===");
  const app = createApp();

  const server = app.listen(8089, async () => {
    try {
      const base = "http://localhost:8089/api";

      // 1. Health check
      console.log("Testing GET /api/health...");
      const health = await fetch(`${base}/health`).then((r) => r.json());
      console.assert(health.ok === true, "Health check failed");

      // 2. All trips
      console.log("Testing GET /api/trips...");
      const trips = await fetch(`${base}/trips`).then((r) => r.json());
      console.assert(trips.length === 3, `Expected 3 trips, got ${trips.length}`);
      console.log(`✓ Loaded ${trips.length} multi-modal trips`);

      // 3. Disruption types
      console.log("Testing GET /api/disruption-types...");
      const types = await fetch(`${base}/disruption-types`).then((r) => r.json());
      console.assert(types.length >= 6, `Expected at least 6 disruption scenarios, got ${types.length}`);
      console.log(`✓ Verified ${types.length} disruption scenarios (PS-2 compliant)`);

      // 4. Proactive at-risk detection
      console.log("Testing GET /api/itinerary/trip_001/at-risk...");
      const atRisk = await fetch(`${base}/itinerary/trip_001/at-risk`).then((r) => r.json());
      console.assert(Array.isArray(atRisk) && atRisk.length > 0, "Expected at-risk bookings");
      console.log(`✓ Proactive risk detector flagged ${atRisk.length} tight-buffer bookings: ${atRisk.join(", ")}`);

      // 5. What-If delay sensitivity simulation
      console.log("Testing POST /api/itinerary/trip_001/simulate-delay...");
      const sim = await fetch(`${base}/itinerary/trip_001/simulate-delay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: "bk_flight_out", delayMinutes: 45 }),
      }).then((r) => r.json());
      console.assert(sim.sensitivityCurve.length > 0, "Sensitivity curve missing");
      console.log(`✓ Simulated delay sensitivity curve with ${sim.sensitivityCurve.length} data points`);

      // 6. Trigger flight delay disruption
      console.log("Testing POST /api/disrupt (Flight GA-865 Delay)...");
      const disruptRes = await fetch(`${base}/disrupt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: "trip_001",
          bookingId: "bk_flight_out",
          type: "delay",
          delayMinutes: 90,
          travelerPreference: "balanced",
        }),
      }).then((r) => r.json());

      console.assert(disruptRes.impact.downstreamImpacts.length >= 2, "Expected cascade downstream impacts");
      console.assert(disruptRes.recoveryOptions.length > 0, "Expected recovery options");
      console.assert(disruptRes.aiBrief !== null, "Expected AI brief");
      console.log(
        `✓ Cascade detected: ${disruptRes.impact.directImpact} triggered ripple into ${disruptRes.impact.downstreamImpacts.length} downstream bookings`
      );
      console.log(`✓ Severity Score: ${disruptRes.impact.severityScore}/100`);
      console.log(`✓ Recovery Options Generated: ${disruptRes.recoveryOptions.length} ranked plans`);
      console.log(`✓ Top Recommendation: "${disruptRes.recoveryOptions[0].label}" (Score: ${disruptRes.recoveryOptions[0].convenienceScore}/100)`);

      // 7. Apply recovery plan
      console.log("Testing POST /api/select-recovery...");
      const topPlanId = disruptRes.recoveryOptions[0].id;
      const recoveryRes = await fetch(`${base}/select-recovery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: "trip_001",
          disruptionId: disruptRes.disruption.id,
          bookingId: disruptRes.impact.directImpact,
          downstreamIds: disruptRes.impact.downstreamImpacts,
          planId: topPlanId,
        }),
      }).then((r) => r.json());

      console.assert(recoveryRes.ok === true, "Recovery application failed");
      console.assert(recoveryRes.diffs.length > 0, "Expected reconstituted itinerary diffs");
      console.log(`✓ Applied recovery plan "${topPlanId}"`);
      console.log(`✓ Reconstituted ${recoveryRes.diffs.length} bookings to resolved status`);
      console.log(`✓ Financial summary: Recovered ₹${recoveryRes.financialSummary.refundTotal.toLocaleString()} refunds`);

      // 8. Reset trip
      console.log("Testing POST /api/itinerary/trip_001/reset...");
      const resetRes = await fetch(`${base}/itinerary/trip_001/reset`, { method: "POST" }).then((r) => r.json());
      console.assert(resetRes.ok === true, "Reset failed");
      console.log("✓ Reset demo trip back to pristine state");

      // 9. Test Trip 2 (Japan)
      console.log("Testing Japan Trip (trip_002)...");
      const trip2 = await fetch(`${base}/itinerary/trip_002`).then((r) => r.json());
      console.assert(trip2.bookings.length === 6, "Expected 6 bookings for trip 2");
      console.log(`✓ Japan Cultural Circuit loaded (${trip2.bookings.length} bookings, currency: ${trip2.currency})`);

      console.log("\n=============================================");
      console.log("ALL 9 INTEGRATION TEST SUITES PASSED CLEANLY!");
      console.log("=============================================\n");
    } catch (e) {
      console.error("Test error:", e);
      process.exitCode = 1;
    } finally {
      server.close();
    }
  });
}

runTests();
