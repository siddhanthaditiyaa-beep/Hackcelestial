// ---------------------------------------------------------------------------
// Mock dataset — shaped exactly like the real API contract (see api.js).
// Swapping this for live fetch() calls should require zero component changes.
// ---------------------------------------------------------------------------

export const TRIP = {
  id: "trip_001",
  traveler: { name: "Aditi Sharma" },
  tripName: "Mumbai \u2192 Bali",
  startDate: "2026-11-14",
  endDate: "2026-11-17",
};

// dependsOn = booking ids this booking cannot happen without.
// bufferMinutes = gap between this booking's start and the prior booking's end
// (used to flag "at risk" connections proactively).
export const BOOKINGS = [
  {
    id: "bk_flight_out",
    type: "flight",
    title: "BOM \u2192 DPS",
    subtitle: "Air Garuda GA-865",
    vendor: "Air Garuda",
    location: "Mumbai \u2192 Denpasar",
    day: "Day 1",
    startTime: "06:15",
    endTime: "14:40",
    status: "confirmed",
    dependsOn: [],
    bufferMinutes: null,
    cancellationPolicy: { refundPct: 70, windowHours: 24 },
  },
  {
    id: "bk_transfer_1",
    type: "transfer",
    title: "Airport \u2192 Ubud",
    subtitle: "Private car, Made Wirawan",
    vendor: "BaliRides",
    location: "Denpasar Airport \u2192 Ubud",
    day: "Day 1",
    startTime: "15:10",
    endTime: "16:40",
    status: "confirmed",
    dependsOn: ["bk_flight_out"],
    bufferMinutes: 30,
    cancellationPolicy: { refundPct: 90, windowHours: 2 },
  },
  {
    id: "bk_hotel",
    type: "hotel",
    title: "Ubud Canopy Retreat",
    subtitle: "Garden Villa, 2 nights",
    vendor: "Ubud Canopy Retreat",
    location: "Ubud",
    day: "Day 1 \u2013 Day 3",
    startTime: "17:00",
    endTime: "11:00",
    status: "confirmed",
    dependsOn: ["bk_transfer_1"],
    bufferMinutes: 20,
    cancellationPolicy: { refundPct: 50, windowHours: 48 },
  },
  {
    id: "bk_trek",
    type: "activity",
    title: "Mount Batur Sunrise Trek",
    subtitle: "Guided hike + breakfast",
    vendor: "Batur Trails Co.",
    location: "Mount Batur",
    day: "Day 2",
    startTime: "03:30",
    endTime: "09:00",
    status: "confirmed",
    dependsOn: ["bk_hotel"],
    bufferMinutes: 480,
    cancellationPolicy: { refundPct: 0, windowHours: 12 },
  },
  {
    id: "bk_uluwatu",
    type: "activity",
    title: "Uluwatu Sunset + Kecak Fire Dance",
    subtitle: "Small group tour",
    vendor: "Bali Culture Tours",
    location: "Uluwatu",
    day: "Day 2",
    startTime: "15:30",
    endTime: "20:00",
    status: "confirmed",
    dependsOn: ["bk_hotel"],
    bufferMinutes: 360,
    cancellationPolicy: { refundPct: 60, windowHours: 24 },
  },
  {
    id: "bk_flight_back",
    type: "flight",
    title: "DPS \u2192 BOM",
    subtitle: "Air Garuda GA-866",
    vendor: "Air Garuda",
    location: "Denpasar \u2192 Mumbai",
    day: "Day 3",
    startTime: "13:20",
    endTime: "22:10",
    status: "confirmed",
    dependsOn: ["bk_hotel"],
    bufferMinutes: 120,
    cancellationPolicy: { refundPct: 70, windowHours: 24 },
  },
];

// Disruption scenarios the console can trigger. Kept to 3, per team scope.
export const DISRUPTION_TYPES = [
  { id: "delay", label: "Flight delay", appliesTo: ["flight"] },
  { id: "weather", label: "Weather closure", appliesTo: ["activity", "transfer"] },
  { id: "cancellation", label: "Activity cancellation", appliesTo: ["activity", "hotel"] },
];

// Alternate options the recovery engine draws from, keyed by booking id.
export const ALTERNATES = {
  bk_flight_out: [
    { id: "alt_f1", title: "Air Garuda GA-871 (later same day)", costDelta: 4200, timeDeltaMinutes: 300 },
    { id: "alt_f2", title: "SkyJet SJ-410 (next morning)", costDelta: 6800, timeDeltaMinutes: 900 },
  ],
  bk_transfer_1: [
    { id: "alt_t1", title: "BaliRides express pickup (next slot)", costDelta: 0, timeDeltaMinutes: 45 },
    { id: "alt_t2", title: "Airport taxi queue (self-arranged)", costDelta: -600, timeDeltaMinutes: 20 },
  ],
  bk_trek: [
    { id: "alt_a1", title: "Reschedule trek to Day 3, 03:30", costDelta: 0, timeDeltaMinutes: 0 },
    { id: "alt_a2", title: "Swap for Tegalalang sunrise walk (no permit needed)", costDelta: -800, timeDeltaMinutes: -30 },
  ],
  bk_uluwatu: [
    { id: "alt_a3", title: "Reschedule Uluwatu tour to Day 3 sunset", costDelta: 0, timeDeltaMinutes: 0 },
    { id: "alt_a4", title: "Swap for Tanah Lot sunset (indoor-covered viewing)", costDelta: 300, timeDeltaMinutes: 15 },
  ],
  bk_hotel: [
    { id: "alt_h1", title: "Move to Ubud Jungle Suites (sister property)", costDelta: 1500, timeDeltaMinutes: 0 },
  ],
  bk_flight_back: [
    { id: "alt_f3", title: "Air Garuda GA-868 (next day)", costDelta: 5200, timeDeltaMinutes: 1440 },
  ],
};

export const DISRUPTION_SEVERITY_BASE = {
  delay: 35,
  weather: 55,
  cancellation: 45,
};
