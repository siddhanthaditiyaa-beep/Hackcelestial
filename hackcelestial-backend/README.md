# Recoup — API (Person B / backend)

Express backend for **PS-2: Travel Disruption Recovery Engine** (Hackcelestial).
Implements the exact contract the frontend (`hackcelestial-frontend/`) expects —
this is a drop-in replacement for its original in-memory mock, already wired
and tested end-to-end.

## Running it

```bash
npm install
cp .env.example .env
npm run dev     # nodemon, http://localhost:8080
npm start       # plain node
```

## Endpoints

| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/api/health` | — | `{ ok: true }` |
| GET | `/api/itinerary/:id` | — | trip + bookings |
| GET | `/api/itinerary/:id/at-risk` | — | `bookingId[]` with a tight connection |
| GET | `/api/disruption-types` | — | the 3 supported disruption scenarios |
| POST | `/api/disrupt` | `{ tripId, bookingId, type }` | disruption + impact + ranked recovery options |
| POST | `/api/select-recovery` | `{ tripId, bookingId, downstreamIds, planId }` | applies the plan, resolves affected bookings |
| POST | `/api/itinerary/:id/reset` | — | resets the demo trip back to its seed state |

## How the engine works

- `src/data/seed.js` — the seed trip (Mumbai → Bali, 6 bookings) and the
  alternates pool the recovery engine draws from.
- `src/logic/engine.js` — the actual intelligence:
  - `computeDownstreamImpact` — BFS over each booking's `dependsOn` edges to
    find everything a disruption cascades into.
  - `computeAtRiskBookings` — flags bookings with a thin `bufferMinutes`
    against whatever they depend on, before any disruption happens.
  - `computeSeverity` — weighted score (disruption type + cascade size +
    how many downstream bookings were already tight).
  - `generateRecoveryOptions` — ranks alternates by a convenience score
    (cost + time penalty) and marks the best one recommended.
- `src/data/store.js` — in-memory state per trip. **Resets on server
  restart** — intentional for a 36-hour build; see "Going further" below.

## Data model

Identical to what the frontend expects — see the frontend's README for the
full `Booking` / disruption / recovery JSON shapes. Nothing was renamed
during the handoff, so no adapter layer was needed.

## Going further (not needed for the demo, but next if there's time)

- Swap `src/data/store.js` for a Mongoose model backed by MongoDB Atlas —
  every other file only calls `getTrip` / `updateBookingStatuses` / `resetTrip`,
  so this is a contained change.
- Add more disruption scenarios by extending `DISRUPTION_TYPES` and
  `ALTERNATES` in `seed.js` — the engine logic doesn't need to change.
- Real vendor data would replace the static `ALTERNATES` pool.
