# Recoup — Travel Disruption Recovery Engine

Frontend for **PS-2: Travel Disruption Recovery Engine — Intelligent Travel Resilience** (Hackcelestial).

Represents a traveler's itinerary as a connected chain of bookings, propagates the
downstream impact of a disruption through that chain, and generates ranked
recovery plans the traveler can compare and apply.

Now wired to the real backend in `../hackcelestial-backend` — this is a live
full-stack app, not a mock.

## Running it

```bash
# 1. start the backend first (see hackcelestial-backend/README.md)
cd ../hackcelestial-backend && npm install && npm run dev   # :8080

# 2. then the frontend
npm install
cp .env.example .env    # VITE_API_URL, defaults to http://localhost:8080/api
npm run dev              # http://localhost:5173
npm run build             # production build -> dist/
npm run preview           # serve the production build locally
```

Seeded with a realistic 3-day Mumbai → Bali itinerary (6 connected bookings)
served live from the backend.

## What's actually working

- **Itinerary rail** (`src/components/ItineraryRail.jsx`) — every booking
  rendered in a connected, dependency-aware timeline. Branch points (a booking
  that doesn't depend on the one directly before it) are called out explicitly.
- **Proactive risk detection** — bookings with a tight connection buffer
  (`bufferMinutes`) are flagged "tight connection" *before* anything goes wrong.
- **Impact propagation** (`src/utils/engine.js` -> `computeDownstreamImpact`) —
  BFS over the dependency graph from the disrupted booking outward.
- **Severity scoring** — weighted score from disruption type, cascade size,
  and how many downstream bookings were already at risk.
- **Recovery generation** — ranked alternates with cost delta, time delta,
  convenience score, and % of itinerary affected; the highest-convenience
  option is marked recommended.
- **Full loop** — trigger -> cascade animates down the rail -> compare plans ->
  apply -> itinerary updates to resolved -> reset and go again.

Disruption scenarios covered (scoped deliberately to 3, per the PS spec's
"open-ended" list): **flight delay**, **weather closure**, **activity
cancellation**.

## API contract

Everything the UI needs goes through `src/data/api.js`, which now calls the
real backend. This section documents the shapes for reference — the backend
in `../hackcelestial-backend` implements this exactly.

| Function | Maps to | Returns |
|---|---|---|
| `getItinerary()` | `GET /itinerary/:id` | `{ id, traveler, tripName, startDate, endDate, bookings: Booking[] }` |
| `getDisruptionTypes()` | `GET /disruption-types` | `{ id, label, appliesTo: string[] }[]` |
| `getAtRiskBookings()` | `GET /itinerary/:id/at-risk` | `bookingId[]` |
| `triggerDisruption(bookingId, type)` | `POST /disrupt` | `{ disruption, impact, recoveryOptions }` |
| `selectRecovery(disruptionId, bookingId, downstreamIds)` | `POST /select-recovery` | `{ ok, itinerary }` |
| `resetItinerary()` | `POST /itinerary/:id/reset` | `{ ok }` |

**`Booking` shape** (see `src/data/mockData.js` for the full seed set):

```ts
{
  id: string,
  type: "flight" | "hotel" | "transfer" | "activity",
  title: string,
  subtitle: string,
  vendor: string,
  location: string,
  day: string,
  startTime: string,   // "HH:mm"
  endTime: string,
  status: "confirmed" | "at-risk" | "disrupted" | "resolved",
  dependsOn: string[],           // booking ids this one can't happen without
  bufferMinutes: number | null,  // gap vs. the booking it depends on
  cancellationPolicy: { refundPct: number, windowHours: number }
}
```

**`triggerDisruption` response:**

```ts
{
  disruption: { id, bookingId, type, triggeredAt },
  impact: {
    directImpact: string,        // bookingId
    downstreamImpacts: string[], // bookingIds, in cascade order
    severityScore: number,       // 0-100
  },
  recoveryOptions: {
    id: string,
    label: string,
    costDelta: number,          // signed, INR
    timeDeltaMinutes: number,   // signed
    convenienceScore: number,   // 0-100
    itineraryAffectedPct: number,
    recommended: boolean,
  }[]
}
```

The scoring logic in `src/utils/engine.js` (`computeSeverity`,
`generateRecoveryOptions`) is the reference implementation for what the real
backend's rule engine should reproduce — walk through it together before
building the real endpoints so both sides agree on the weights.

## Stack

React 19 + Vite, Tailwind CSS v4, Framer Motion, lucide-react. No backend
dependency to run standalone.

## Design direction

Dark "flight-ops console" aesthetic rather than a typical travel-app look —
Space Grotesk for headings, Inter for UI text, IBM Plex Mono for
times/codes/data readouts. Amber = at risk, red = disrupted, teal = resolved,
blue = interactive/selected — color is always tied to real itinerary state,
never decorative.
