# Recoup — Travel Disruption Recovery Engine

Frontend for **PS-2: Travel Disruption Recovery Engine — Intelligent Travel Resilience** (Hackcelestial).

Represents a traveler's itinerary as a connected Directed Acyclic Graph (DAG), visualizes cascading downstream impacts across connected bookings, evaluates risk sensitivity with an interactive delay simulator, and generates optimized recovery plans tailored to traveler priorities.

Wired to the Express backend in `../hackcelestial-backend`.

---

## Running It

```bash
# 1. Start the backend first
cd ../hackcelestial-backend && npm install && npm test && npm run dev   # :8080

# 2. Then run the frontend
cd ../hackcelestial-frontend
npm install
npm run dev              # http://localhost:5173
npm run build             # production bundle verification
```

---

## Key Platform Features

1. **Dual Itinerary Visualizations**:
   - **Timeline Rail**: Connected chronological cards with buffer indicators, cancellation policy tags, and photo covers.
   - **DAG Dependency Topology**: Interactive directed graph displaying causal dependencies, buffer margins, and glowing cascade paths.

2. **Proactive Risk Radar & "What-If" Sensitivity Simulator**:
   - Live slider (`0m` to `150m`) to test inbound transport delays.
   - Dynamic tipping point detection (identifies exactly when and which downstream booking breaks).
   - Regional weather advisory and airspace congestion risk radar.

3. **All 6 PS-2 Disruption Scenarios**:
   - Transport delays (with custom delay duration)
   - Transport cancellations
   - Missed transfers / collapsed connection buffers
   - Hotel overbookings & activity closures
   - Transfer vehicle breakdowns / driver no-shows
   - Severe weather closures (typhoon/monsoon/volcanic ash)
   - Traveler-initiated schedule adjustments

4. **Multi-Factor Recovery Optimization**:
   - Customizable **Traveler Optimization Preferences**:
     - *Balanced*: Pareto-optimal trade-off
     - *Budget Saver*: Maximizes policy refunds and minimizes out-of-pocket costs
     - *Speed Priority*: Minimizes total itinerary delay
     - *Max Comfort*: Minimizes friction and prioritizes premier re-accommodation
   - Dual Comparison Views:
     - **Card Grid** with metric chips and auto-mitigations
     - **Side-by-Side Trade-off Matrix Table** comparing cost, time, cascade %, and convenience score

5. **Full Itinerary Reconstitution**:
   - Selecting a recovery plan dynamically updates booking times, re-links dependent nodes, resolves cascade statuses, and calculates the net refund accounting ledger.

6. **AI Incident Copilot & Concierge**:
   - Synthesizes an executive narrative explanation of the disruption.
   - Auto-generates ready-to-copy communications:
     - WhatsApp / Email notice to hotel front desk for late check-in
     - Dispatch notice to driver with updated pickup gate and time
     - Insurance claim receipt and policy documentation
   - 1-click download of the complete incident recovery brief.

7. **Multi-Trip Showcase**:
   - Trip 1: Mumbai → Bali Tropical Escape (Leisure multi-modal)
   - Trip 2: Tokyo → Kyoto Heritage Circuit (Shinkansen bullet train + Ryokan)
   - Trip 3: London → Paris → Zurich Business Tour (Eurostar + Chauffeur + Summit)
