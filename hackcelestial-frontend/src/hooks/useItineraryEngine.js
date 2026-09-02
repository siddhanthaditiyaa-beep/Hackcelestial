import { useCallback, useEffect, useState } from "react";
import {
  getItinerary,
  getDisruptionTypes,
  getAtRiskBookings,
  triggerDisruption,
  selectRecovery,
  resetItinerary,
} from "../data/api";

export function useItineraryEngine() {
  const [trip, setTrip] = useState(null);
  const [disruptionTypes, setDisruptionTypes] = useState([]);
  const [atRiskIds, setAtRiskIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [applying, setApplying] = useState(false);

  const [activeDisruption, setActiveDisruption] = useState(null); // { id, bookingId, type, triggeredAt }
  const [impact, setImpact] = useState(null); // { directImpact, downstreamImpacts, severityScore }
  const [recoveryOptions, setRecoveryOptions] = useState([]);
  const [resolvedPlan, setResolvedPlan] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [itinerary, types, atRisk] = await Promise.all([
      getItinerary(),
      getDisruptionTypes(),
      getAtRiskBookings(),
    ]);
    setTrip(itinerary);
    setDisruptionTypes(types);
    setAtRiskIds(atRisk);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const trigger = useCallback(async (bookingId, disruptionType) => {
    setTriggering(true);
    setResolvedPlan(null);
    const res = await triggerDisruption(bookingId, disruptionType);
    setActiveDisruption(res.disruption);
    setImpact(res.impact);
    setRecoveryOptions(res.recoveryOptions);
    const fresh = await getItinerary();
    setTrip(fresh);
    setTriggering(false);
  }, []);

  const applyPlan = useCallback(
    async (planId) => {
      if (!activeDisruption || !impact) return;
      setApplying(true);
      await selectRecovery(
        activeDisruption.id,
        impact.directImpact,
        impact.downstreamImpacts,
        planId
      );
      const fresh = await getItinerary();
      setTrip(fresh);
      setResolvedPlan(recoveryOptions.find((p) => p.id === planId) ?? null);
      setApplying(false);
    },
    [activeDisruption, impact, recoveryOptions]
  );

  const dismiss = useCallback(() => {
    setActiveDisruption(null);
    setImpact(null);
    setRecoveryOptions([]);
    setResolvedPlan(null);
  }, []);

  const reset = useCallback(async () => {
    await resetItinerary();
    dismiss();
    await load();
  }, [dismiss, load]);

  return {
    trip,
    disruptionTypes,
    atRiskIds,
    loading,
    triggering,
    applying,
    activeDisruption,
    impact,
    recoveryOptions,
    resolvedPlan,
    trigger,
    applyPlan,
    dismiss,
    reset,
  };
}
