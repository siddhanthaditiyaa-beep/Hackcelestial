// ---------------------------------------------------------------------------
// Real API client, wired to the Express backend in /hackcelestial-backend.
// Same function names and return shapes as the original mock — components
// never needed to change when this was swapped from mock to live fetch().
// ---------------------------------------------------------------------------

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const TRIP_ID = "trip_001";

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

export async function getItinerary() {
  return request(`/itinerary/${TRIP_ID}`);
}

export async function getDisruptionTypes() {
  return request(`/disruption-types`);
}

export async function getAtRiskBookings() {
  return request(`/itinerary/${TRIP_ID}/at-risk`);
}

export async function triggerDisruption(bookingId, disruptionType) {
  return request(`/disrupt`, {
    method: "POST",
    body: JSON.stringify({ tripId: TRIP_ID, bookingId, type: disruptionType }),
  });
}

export async function selectRecovery(disruptionId, bookingId, downstreamIds, planId) {
  return request(`/select-recovery`, {
    method: "POST",
    body: JSON.stringify({ tripId: TRIP_ID, disruptionId, bookingId, downstreamIds, planId }),
  });
}

export async function resetItinerary() {
  return request(`/itinerary/${TRIP_ID}/reset`, { method: "POST" });
}
