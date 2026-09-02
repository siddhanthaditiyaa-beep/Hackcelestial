# Recoup — Intelligent Travel Resilience API

Express backend for **PS-2: Travel Disruption Recovery Engine — Intelligent Travel Resilience** (Hackcelestial).

Models travel itineraries as Temporal Dependency Directed Acyclic Graphs (DAGs), simulates cascading ripple effects, computes financial exposure & policy-based refunds, and executes multi-criteria recovery optimization tailored to traveler preferences.

## Live Deployment Links
- **Backend API (Render)**: [https://hackcelestial-svqi.onrender.com/api](https://hackcelestial-svqi.onrender.com/api)
- **Frontend App (Vercel)**: [https://hackcelestial-seven.vercel.app/](https://hackcelestial-seven.vercel.app/)

---

## Quick Start

```bash
npm install
npm test          # Runs full 9-point integration test suite
npm run dev       # nodemon live reload, http://localhost:8080
npm start         # production node server
```

---

## API Endpoints

| Method | Path | Body | Description |
|---|---|---|---|
| `GET` | `/api/health` | — | Health check (`{ ok: true }`) |
| `GET` | `/api/trips` | — | Lists all available multi-modal demo trips |
| `GET` | `/api/itinerary/:id` | — | Returns trip metadata + connected bookings |
| `GET` | `/api/itinerary/:id/at-risk` | — | Proactively flags bookings with tight buffers (<60m) |
| `POST` | `/api/itinerary/:id/simulate-delay` | `{ bookingId, delayMinutes }` | What-If buffer sensitivity curve calculator |
| `GET` | `/api/disruption-types` | — | Returns all 7 PS-2 compliant disruption scenarios |
| `POST` | `/api/disrupt` | `{ tripId, bookingId, type, delayMinutes, travelerPreference }` | Calculates DAG cascade, financial exposure, AI brief, and ranked recovery options |
| `POST` | `/api/select-recovery` | `{ tripId, disruptionId, bookingId, downstreamIds, planId }` | Reconstitutes itinerary, reschedules times, applies diffs, and computes refund ledger |
| `POST` | `/api/itinerary/:id/reset` | — | Resets trip state back to original seed |

---

## Core Engine Architecture

- **Temporal Dependency Graph (`src/logic/engine.js`)**:
  - `computeDownstreamImpact`: BFS traversal over `dependsOn` edges; detects hard buffer collapse vs. soft warning thresholds.
  - `computeSeverity`: Composite 0–100 score weighing disruption type base, cascade depth, buffer violations, and financial exposure.
  - `simulateDelaySensitivity`: Proactive "What-If" evaluator returning minute-by-minute failure tipping points across delay increments.
  - `generateRecoveryOptions`: Evaluates alternatives against **Traveler Preferences** (`balanced`, `budget`, `speed`, `comfort`) across cost, schedule drift, and convenience score.
  - `applyRecoveryPlanToItinerary`: Reconstitutes the itinerary schedule, resets node statuses, updates times, and tallies refund claims.
  - `generateAIIncidentBrief`: Synthesizes narrative explanations and auto-drafts vendor notifications (driver WhatsApp, hotel late check-in, airline claim).

- **Multi-Modal Inventory (`src/data/seed.js`)**:
  - `trip_001`: Mumbai → Bali Tropical Escape (Flight, private transfer, luxury villa, sunrise volcano trek, temple dance)
  - `trip_002`: Tokyo → Kyoto Heritage Circuit (Shinkansen bullet train, VIP taxi, Gion Ryokan, tea ceremony, bamboo rickshaw)
  - `trip_003`: London → Paris → Zurich Business Tour (Eurostar high-speed rail, chauffeur sedan, boutique stay, keynote summit, TGV Lyria)
