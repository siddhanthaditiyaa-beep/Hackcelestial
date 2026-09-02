import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import ItineraryRail from "./components/ItineraryRail";
import TopologyGraphView from "./components/TopologyGraphView";
import ProactiveRiskRadar from "./components/ProactiveRiskRadar";
import DisruptionConsole from "./components/DisruptionConsole";
import ImpactPanel from "./components/ImpactPanel";
import RecoveryList from "./components/RecoveryList";
import ConciergeCopilotModal from "./components/ConciergeCopilotModal";
import Login from "./components/Login";
import { useItineraryEngine } from "./hooks/useItineraryEngine";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function App() {
  const {
    allTrips,
    activeTripId,
    trip,
    disruptionTypes,
    atRiskIds,
    loading,
    triggering,
    applying,
    travelerPreference,
    setTravelerPreference,
    activeView,
    setActiveView,
    isCopilotOpen,
    setIsCopilotOpen,
    activeDisruption,
    impact,
    recoveryOptions,
    aiBrief,
    resolvedPlan,
    appliedDiffs,
    financialSummary,
    switchTrip,
    trigger,
    applyPlan,
    dismiss,
    reset,
  } = useItineraryEngine();

  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("recoup_auth") === "true" || sessionStorage.getItem("recoup_auth") === "true";
  });

  useEffect(() => {
    if (trip && trip.bookings && trip.bookings.length > 0) {
      if (!selectedBookingId || !trip.bookings.some((b) => b.id === selectedBookingId)) {
        setSelectedBookingId(trip.bookings[0].id);
      }
    }
  }, [trip, selectedBookingId]);

  const bookingsById = useMemo(() => {
    if (!trip || !trip.bookings) return {};
    return Object.fromEntries(trip.bookings.map((b) => [b.id, b]));
  }, [trip]);

  const atRiskCount = trip
    ? trip.bookings.filter((b) => b.status === "at-risk").length
    : 0;
  const disruptedCount = trip
    ? trip.bookings.filter((b) => b.status === "disrupted").length
    : 0;

  const activeDisruptionTypeObj = useMemo(() => {
    if (!activeDisruption) return null;
    return disruptionTypes.find((t) => t.id === activeDisruption.type);
  }, [activeDisruption, disruptionTypes]);

  if (!isAuthenticated) {
    return (
      <Login 
        onLogin={(remember) => {
          setIsAuthenticated(true);
          if (remember) {
            localStorage.setItem("recoup_auth", "true");
          } else {
            sessionStorage.setItem("recoup_auth", "true");
          }
        }} 
      />
    );
  }

  if (loading || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-soft">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-coral animate-spin" />
          <p className="text-xs font-semibold text-ink-dim">
            Loading Recoup Travel Resilience Engine…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-soft">
      <Header
        trip={trip}
        allTrips={allTrips}
        activeTripId={activeTripId}
        onSwitchTrip={switchTrip}
        activeView={activeView}
        onSwitchView={setActiveView}
        atRiskCount={atRiskCount}
        disruptedCount={disruptedCount}
        onReset={reset}
        onOpenCopilot={() => setIsCopilotOpen(true)}
      />

      <main className="max-w-[1240px] mx-auto px-4 md:px-8 -mt-6 pb-12">
        <div className="bg-page rounded-[2rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] px-4 md:px-8 py-4 grid lg:grid-cols-[1fr_420px] gap-8">
          {/* Main Visualizer Area */}
          <section className="pt-4 pb-6">
            <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-display text-xl font-bold text-ink">
                  {activeView === "rail"
                    ? "Itinerary Timeline"
                    : activeView === "graph"
                    ? "Dependency DAG Topology"
                    : "Proactive Risk Radar"}
                </h2>
                <p className="text-xs text-ink-dim mt-0.5">
                  {trip.bookings.length} connected bookings ·{" "}
                  {activeView === "rail"
                    ? "select a booking to configure disruption in the console"
                    : activeView === "graph"
                    ? "inspect topological dependencies and buffer margins"
                    : "test delay sensitivity and buffer collapse tipping points"}
                </p>
              </div>

              <div className="text-xs font-medium text-ink-faint">
                Traveler: <span className="text-ink font-semibold">{trip.traveler?.name}</span>
              </div>
            </div>

            {/* View Switching */}
            {activeView === "rail" && (
              <ItineraryRail
                bookings={trip.bookings}
                atRiskIds={atRiskIds}
                impact={impact}
                selectedId={selectedBookingId}
                onSelect={setSelectedBookingId}
              />
            )}

            {activeView === "graph" && (
              <TopologyGraphView
                bookings={trip.bookings}
                atRiskIds={atRiskIds}
                impact={impact}
                selectedId={selectedBookingId}
                onSelect={setSelectedBookingId}
              />
            )}

            {activeView === "radar" && (
              <ProactiveRiskRadar
                trip={trip}
                atRiskIds={atRiskIds}
                onTriggerDisruption={(bId, type, delay) => {
                  setSelectedBookingId(bId);
                  trigger(bId, type, delay);
                }}
              />
            )}
          </section>

          {/* Sidebar: Disruption Console / Recovery List */}
          <aside className="lg:sticky lg:top-6 lg:self-start space-y-6 pt-4 pb-6">
            {!activeDisruption ? (
              <DisruptionConsole
                bookings={trip.bookings}
                disruptionTypes={disruptionTypes}
                selectedBookingId={selectedBookingId}
                onSelectBooking={setSelectedBookingId}
                triggering={triggering}
                onTrigger={trigger}
                travelerPreference={travelerPreference}
                onSelectPreference={setTravelerPreference}
              />
            ) : (
              <div className="space-y-4">
                {!resolvedPlan && (
                  <button
                    onClick={dismiss}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-faint hover:text-ink-dim transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to simulation console
                  </button>
                )}

                <ImpactPanel
                  disruption={activeDisruption}
                  impact={impact}
                  bookingsById={bookingsById}
                  disruptionTypeLabel={activeDisruptionTypeObj?.label || activeDisruption.type}
                  currency={trip.currency || "INR"}
                />

                <RecoveryList
                  options={recoveryOptions}
                  onApply={applyPlan}
                  applying={applying}
                  resolvedPlan={resolvedPlan}
                  onDismiss={dismiss}
                  appliedDiffs={appliedDiffs}
                  financialSummary={financialSummary}
                  currency={trip.currency || "INR"}
                  onOpenCopilot={() => setIsCopilotOpen(true)}
                />
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* AI Copilot & Concierge Modal */}
      <ConciergeCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        aiBrief={aiBrief}
        activeDisruption={activeDisruption}
        resolvedPlan={resolvedPlan}
        trip={trip}
      />
    </div>
  );
}
