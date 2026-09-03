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
import BookingSystem from "./components/BookingSystem";
import Suggestions from "./components/Suggestions";
import MyBookingsModal from "./components/MyBookingsModal";
import { useItineraryEngine } from "./hooks/useItineraryEngine";
import { useAuth } from "./context/AuthContext";
import { Loader2, Home, Compass, MessageSquarePlus, ArrowLeft } from "lucide-react";

export default function App() {
  const {
    allTrips,
    activeTripId,
    trip,
    disruptionTypes,
    atRiskIds,
    loading,
    loadError,
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
    load,
    trigger,
    applyPlan,
    dismiss,
    reset,
  } = useItineraryEngine();

  const { user, loading: authLoading, logout } = useAuth();
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [mainTab, setMainTab] = useState("booking");
  const [myBookingsOpen, setMyBookingsOpen] = useState(false);

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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-soft">
        <Loader2 className="h-8 w-8 text-brand animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (!loading && loadError && !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-soft px-4">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <p className="text-sm font-semibold text-ink">Couldn't reach the Recoup engine</p>
          <p className="text-xs text-ink-dim">{loadError}</p>
          <button
            onClick={() => load(activeTripId)}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full bg-ink text-page hover:opacity-90 transition"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (loading || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-soft">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-brand animate-spin" />
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
        onOpenMyBookings={() => setMyBookingsOpen(true)}
        onLogout={logout}
      />

      {/* Global Navigation Tabs */}
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 -mt-10 mb-8 relative z-10">
        <div className="flex items-center gap-2 bg-surface p-1.5 rounded-md border border-border inline-flex shadow-md">
          <button
            onClick={() => setMainTab("dashboard")}
            className={`flex items-center gap-2 px-5 py-2 rounded-sm text-sm font-bold transition-all ${mainTab === "dashboard" ? "bg-ink text-page shadow-sm" : "text-ink-dim hover:text-ink hover:bg-surface-sunk"}`}
          >
            <Home className="h-4 w-4" /> Itinerary Dashboard
          </button>
          <button
            onClick={() => setMainTab("booking")}
            className={`flex items-center gap-2 px-5 py-2 rounded-sm text-sm font-bold transition-all ${mainTab === "booking" ? "bg-ink text-page shadow-sm" : "text-ink-dim hover:text-ink hover:bg-surface-sunk"}`}
          >
            <Compass className="h-4 w-4" /> Explore & Book
          </button>
          <button
            onClick={() => setMainTab("suggestions")}
            className={`flex items-center gap-2 px-5 py-2 rounded-sm text-sm font-bold transition-all ${mainTab === "suggestions" ? "bg-ink text-page shadow-sm" : "text-ink-dim hover:text-ink hover:bg-surface-sunk"}`}
          >
            <MessageSquarePlus className="h-4 w-4" /> Trip Suggestions
          </button>
        </div>
      </div>

      <main className="max-w-[1240px] mx-auto px-4 md:px-8 pb-12">
        {mainTab === "booking" && <BookingSystem />}
        
        {mainTab === "suggestions" && <Suggestions destination={trip.tripName} />}
        
        {mainTab === "dashboard" && (
        <div className="bg-page rounded-lg shadow-md px-4 md:px-8 py-4 grid lg:grid-cols-[1fr_420px] gap-8">
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
        )}
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

      {myBookingsOpen && <MyBookingsModal onClose={() => setMyBookingsOpen(false)} />}
    </div>
  );
}
