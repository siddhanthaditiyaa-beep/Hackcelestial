import { useCallback, useEffect, useState } from "react";
import {
  getAllTrips,
  getItinerary,
  getDisruptionTypes,
  getAtRiskBookings,
  triggerDisruption,
  selectRecovery,
  simulateDelay,
  resetItinerary,
} from "../data/api";

export function useItineraryEngine() {
  const [allTrips, setAllTrips] = useState([]);
  const [activeTripId, setActiveTripId] = useState("trip_001");
  const [trip, setTrip] = useState(null);
  const [disruptionTypes, setDisruptionTypes] = useState([]);
  const [atRiskIds, setAtRiskIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [triggering, setTriggering] = useState(false);
  const [applying, setApplying] = useState(false);

  // Preference & Configuration state
  const [travelerPreference, setTravelerPreference] = useState("balanced");
  const [activeView, setActiveView] = useState("rail"); // "rail" | "graph" | "radar"
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Disruption & Recovery state
  const [activeDisruption, setActiveDisruption] = useState(null);
  const [impact, setImpact] = useState(null);
  const [recoveryOptions, setRecoveryOptions] = useState([]);
  const [aiBrief, setAiBrief] = useState(null);
  const [resolvedPlan, setResolvedPlan] = useState(null);
  const [appliedDiffs, setAppliedDiffs] = useState([]);
  const [financialSummary, setFinancialSummary] = useState(null);

  const load = useCallback(async (tripIdToLoad = activeTripId) => {
    setLoading(true);
    setLoadError(null);
    try {
      const [tripsList, itinerary, types, atRisk] = await Promise.all([
        getAllTrips().catch(() => []),
        getItinerary(tripIdToLoad),
        getDisruptionTypes().catch(() => []),
        getAtRiskBookings(tripIdToLoad).catch(() => []),
      ]);
      setAllTrips(tripsList.length ? tripsList : [{ id: "trip_001", tripName: "Mumbai \u2192 Bali" }]);
      setTrip(itinerary);
      setDisruptionTypes(types);
      setAtRiskIds(atRisk);
    } catch (err) {
      console.error("Failed to load itinerary engine data:", err);
      setLoadError(err?.message || "Couldn't reach the Recoup backend.");
    } finally {
      setLoading(false);
    }
  }, [activeTripId]);

  useEffect(() => {
    load(activeTripId);
  }, [load, activeTripId]);

  const switchTrip = useCallback((tripId) => {
    setActiveTripId(tripId);
    setActiveDisruption(null);
    setImpact(null);
    setRecoveryOptions([]);
    setAiBrief(null);
    setResolvedPlan(null);
    setAppliedDiffs([]);
    setFinancialSummary(null);
  }, []);

  const trigger = useCallback(
    async (bookingId, disruptionType, customDelay = 0) => {
      setTriggering(true);
      setResolvedPlan(null);
      setAppliedDiffs([]);
      setFinancialSummary(null);
      try {
        const res = await triggerDisruption(
          bookingId,
          disruptionType,
          activeTripId,
          customDelay,
          travelerPreference
        );
        setActiveDisruption(res.disruption);
        setImpact(res.impact);
        setRecoveryOptions(res.recoveryOptions);
        setAiBrief(res.aiBrief);

        const fresh = await getItinerary(activeTripId);
        setTrip(fresh);
      } catch (err) {
        console.error("Disruption trigger error:", err);
      } finally {
        setTriggering(false);
      }
    },
    [activeTripId, travelerPreference]
  );

  const applyPlan = useCallback(
    async (planId) => {
      if (!activeDisruption || !impact) return;
      setApplying(true);
      try {
        const res = await selectRecovery(
          activeDisruption.id,
          impact.directImpact,
          impact.downstreamImpacts,
          planId,
          activeTripId
        );
        setTrip(res.itinerary);
        setAppliedDiffs(res.diffs || []);
        setFinancialSummary(res.financialSummary || null);
        setResolvedPlan(recoveryOptions.find((p) => p.id === planId) ?? null);
      } catch (err) {
        console.error("Apply recovery error:", err);
      } finally {
        setApplying(false);
      }
    },
    [activeDisruption, impact, recoveryOptions, activeTripId]
  );

  const dismiss = useCallback(() => {
    setActiveDisruption(null);
    setImpact(null);
    setRecoveryOptions([]);
    setAiBrief(null);
    setResolvedPlan(null);
    setAppliedDiffs([]);
    setFinancialSummary(null);
  }, []);

  const reset = useCallback(async () => {
    try {
      await resetItinerary(activeTripId);
      dismiss();
      await load(activeTripId);
    } catch (err) {
      console.error("Reset itinerary error:", err);
    }
  }, [activeTripId, dismiss, load]);

  const runDelaySimulation = useCallback(
    async (bookingId, delayMinutes) => {
      return simulateDelay(bookingId, delayMinutes, activeTripId);
    },
    [activeTripId]
  );

  return {
    allTrips,
    activeTripId,
    trip,
    disruptionTypes,
    atRiskIds,
    loading,
    loadError,
    triggering,
    applying,
    travelerPreference,
    setTravelerPreference,
    activeView,
    setActiveView,
    isCopilotOpen,
    setIsCopilotOpen,
    activeDisruption,
    impact,
    recoveryOptions,
    aiBrief,
    resolvedPlan,
    appliedDiffs,
    financialSummary,
    switchTrip,
    load,
    trigger,
    applyPlan,
    dismiss,
    reset,
    runDelaySimulation,
  };
}
