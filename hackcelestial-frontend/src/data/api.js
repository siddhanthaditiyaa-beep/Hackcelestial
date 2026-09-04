// ---------------------------------------------------------------------------
// Recoup API client wired to Express backend (/hackcelestial-backend)
// ---------------------------------------------------------------------------

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://hackcelestial-svqi.onrender.com/api"
    : "http://localhost:8080/api");

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function getAllTrips() {
  return request(`/trips`);
}

export async function getItinerary(tripId = "trip_001") {
  return request(`/itinerary/${tripId}`);
}

export async function getDisruptionTypes() {
  return request(`/disruption-types`);
}

export async function getAtRiskBookings(tripId = "trip_001") {
  return request(`/itinerary/${tripId}/at-risk`);
}

export async function triggerDisruption(
  bookingId,
  disruptionType,
  tripId = "trip_001",
  delayMinutes = 0,
  travelerPreference = "balanced"
) {
  return request(`/disrupt`, {
    method: "POST",
    body: JSON.stringify({
      tripId,
      bookingId,
      type: disruptionType,
      delayMinutes: Number(delayMinutes) || 0,
      travelerPreference,
    }),
  });
}

export async function selectRecovery(
  disruptionId,
  bookingId,
  downstreamIds,
  planId,
  tripId = "trip_001",
  plan = null
) {
  return request(`/select-recovery`, {
    method: "POST",
    body: JSON.stringify({
      tripId,
      disruptionId,
      bookingId,
      downstreamIds,
      planId,
      plan,
    }),
  });
}

export async function simulateDelay(
  bookingId,
  delayMinutes = 30,
  tripId = "trip_001"
) {
  return request(`/itinerary/${tripId}/simulate-delay`, {
    method: "POST",
    body: JSON.stringify({ bookingId, delayMinutes }),
  });
}

export async function resetItinerary(tripId = "trip_001") {
  return request(`/itinerary/${tripId}/reset`, { method: "POST" });
}

// ---------------------------------------------------------------------------
// Real-booking disruption loop + AI content (feature push)
// ---------------------------------------------------------------------------

// Standalone booking (no bundle siblings).
export async function disruptRealBooking(booking, disruptionType, delayMinutes = 0, travelerPreference = "balanced") {
  return request(`/booking-disrupt`, {
    method: "POST",
    body: JSON.stringify({ booking, disruptionType, delayMinutes: Number(delayMinutes) || 0, travelerPreference }),
  });
}

// Bundle: full sibling group + which one is being disrupted, so the cascade
// reflects the bundle's real dependsOn chain.
export async function disruptBundleBooking(bookings, disruptedBookingId, disruptionType, delayMinutes = 0, travelerPreference = "balanced") {
  return request(`/booking-disrupt`, {
    method: "POST",
    body: JSON.stringify({ bookings, disruptedBookingId, disruptionType, delayMinutes: Number(delayMinutes) || 0, travelerPreference }),
  });
}

export async function getAITravelInsights(bookingHistory = [], refresh = false) {
  return request(`/ai/insights`, {
    method: "POST",
    body: JSON.stringify({ bookingHistory, refresh }),
  });
}

export async function getAITripSuggestions(destination, refresh = false) {
  return request(`/ai/trip-suggestions`, {
    method: "POST",
    body: JSON.stringify({ destination, refresh }),
  });
}

export async function checkBookingRisk({ type, location, vendor }) {
  return request(`/risk-check`, {
    method: "POST",
    body: JSON.stringify({ type, location, vendor }),
  });
}

// contents: the full conversation so far as Gemini Content objects
// ({role: "user"|"model", parts: [...]}) — see ChatWidget.jsx.
export async function sendChatTurn(contents) {
  return request(`/chat`, {
    method: "POST",
    body: JSON.stringify({ contents }),
  });
}
