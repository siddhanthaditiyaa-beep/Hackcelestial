import {
  TRIPS,
  BOOKINGS_SEED_TRIP_001,
  BOOKINGS_SEED_TRIP_002,
  BOOKINGS_SEED_TRIP_003,
} from "./seed.js";
import { applyRecoveryPlanToItinerary } from "../logic/engine.js";

const SEED_BOOKINGS_BY_TRIP = {
  trip_001: BOOKINGS_SEED_TRIP_001,
  trip_002: BOOKINGS_SEED_TRIP_002,
  trip_003: BOOKINGS_SEED_TRIP_003,
};

const trips = new Map();

function createInitialState(tripId) {
  const meta = TRIPS.find((t) => t.id === tripId) || TRIPS[0];
  const seedBookings = SEED_BOOKINGS_BY_TRIP[tripId] || BOOKINGS_SEED_TRIP_001;

  return {
    trip: { ...meta },
    bookings: seedBookings.map((b) => ({
      ...b,
      dependsOn: [...b.dependsOn],
      cancellationPolicy: b.cancellationPolicy ? { ...b.cancellationPolicy } : null,
    })),
    history: [],
  };
}

// Populate all trips
TRIPS.forEach((t) => {
  trips.set(t.id, createInitialState(t.id));
});

export function getAllTrips() {
  return TRIPS.map((t) => {
    const state = trips.get(t.id);
    return {
      ...t,
      bookingCount: state?.bookings.length || 0,
      disruptedCount: state?.bookings.filter((b) => b.status === "disrupted").length || 0,
      atRiskCount: state?.bookings.filter((b) => b.status === "at-risk").length || 0,
    };
  });
}

export function getTrip(tripId = "trip_001") {
  return trips.get(tripId) ?? null;
}

export function updateBookingStatuses(tripId, updates) {
  const state = trips.get(tripId);
  if (!state) return null;

  state.bookings = state.bookings.map((b) =>
    updates[b.id] ? { ...b, status: updates[b.id] } : b
  );
  return state;
}

export function applyRecovery(tripId, planId, bookingId, downstreamIds = [], fallbackPlan = null) {
  const state = trips.get(tripId);
  if (!state) return null;

  const { updatedBookings, diffs, financialSummary } = applyRecoveryPlanToItinerary(
    state,
    planId,
    bookingId,
    downstreamIds,
    fallbackPlan
  );

  state.bookings = updatedBookings;
  state.history.push({
    timestamp: new Date().toISOString(),
    planId,
    bookingId,
    diffs,
    financialSummary,
  });

  return { state, diffs, financialSummary };
}

export function resetTrip(tripId = "trip_001") {
  trips.set(tripId, createInitialState(tripId));
  return trips.get(tripId);
}
