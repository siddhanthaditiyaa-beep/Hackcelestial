# Archived: Itinerary Dashboard (demo trip visualization)

**Removed:** Round 5 (see git log around this commit for the exact diff).
**Why:** the app now has a real booking system (`BookingContext.jsx` + `MyBookingsModal.jsx`). The old
Itinerary Dashboard tab was entirely built around a single seeded fake trip (`trip_001`, "Mumbai → Bali
Tropical Escape") served by the backend's `/api/itinerary` routes — it wasn't showing the user's own
bookings, and its trip banner + view-switcher pills rendered above every tab (including Explore & Book
and Trip Suggestions) even though they only did anything on the Dashboard tab, which was confusing.

**Nothing was deleted.** Every component this feature depended on is still present in the repo, just no
longer imported/rendered from `App.jsx`. Git history also has the exact pre-removal state if you'd rather
restore via `git log` / `git show`.

## What it did

A single seeded demo trip rendered three interchangeable views (switched via pills in `Header.jsx`):

- **Timeline Rail** (`ItineraryRail.jsx` + `BookingNode.jsx`) — a vertical card timeline of the trip's bookings.
- **DAG Topology** (`TopologyGraphView.jsx`) — a dependency graph showing buffer margins between bookings.
- **Proactive Risk Radar** (`ProactiveRiskRadar.jsx`) — a delay-sensitivity simulator.

Alongside a sidebar: `DisruptionConsole.jsx` (trigger a disruption on the demo trip) → `ImpactPanel.jsx` +
`RecoveryList.jsx` (cascade impact + AI recovery options) → `ConciergeCopilotModal.jsx` ("AI Copilot"
button, an incident-brief viewer tied to the resolved disruption).

All of this was driven by `useItineraryEngine.js`, a hook wrapping the backend's demo-trip endpoints
(`hackcelestial-backend/src/routes/itinerary.js`, `disrupt.js`, `riskCheck.js` — all still present and
untouched on the backend, just no longer called from the frontend).

## Files still in the repo, unimported

- `hackcelestial-frontend/src/hooks/useItineraryEngine.js`
- `hackcelestial-frontend/src/components/ItineraryRail.jsx`
- `hackcelestial-frontend/src/components/BookingNode.jsx`
- `hackcelestial-frontend/src/components/TopologyGraphView.jsx`
- `hackcelestial-frontend/src/components/ProactiveRiskRadar.jsx`
- `hackcelestial-frontend/src/components/DisruptionConsole.jsx`
- `hackcelestial-frontend/src/components/ConciergeCopilotModal.jsx`

**Not archived — still actively used** by `MyBookingsModal.jsx`'s real-booking disruption flow, do not
touch these when restoring or removing further:
- `hackcelestial-frontend/src/components/ImpactPanel.jsx`
- `hackcelestial-frontend/src/components/RecoveryList.jsx`

## How to restore it

1. In `App.jsx`: re-add `import { useItineraryEngine } from "./hooks/useItineraryEngine";` and the other
   removed imports (`ItineraryRail`, `TopologyGraphView`, `ProactiveRiskRadar`, `DisruptionConsole`,
   `ConciergeCopilotModal`), call the hook again, and restore the `mainTab === "dashboard"` block and its
   nav pill — see the git history immediately before this file was added for the exact JSX (the commit
   that removed it has the full working version in its parent).
2. In `Header.jsx`: restore the hero trip-banner, trip-switcher dropdown, "AI Copilot" button, "Reset"
   button, view-switcher pills, and "X bookings" stat — same approach, check git history for the exact
   pre-removal version of this file.
3. No backend changes are needed — the demo-trip routes were never touched.
