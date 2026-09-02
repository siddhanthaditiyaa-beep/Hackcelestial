import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import ItineraryRail from "./components/ItineraryRail";
import DisruptionConsole from "./components/DisruptionConsole";
import ImpactPanel from "./components/ImpactPanel";
import RecoveryList from "./components/RecoveryList";
import { useItineraryEngine } from "./hooks/useItineraryEngine";
import { ArrowLeft, Loader2 } from "lucide-react";

const DISRUPTION_LABELS = {
  delay: "Flight delay",
  weather: "Weather closure",
  cancellation: "Activity cancellation",
};

export default function App() {
  const {
    trip,
    disruptionTypes,
    atRiskIds,
    loading,
    triggering,
    applying,
    activeDisruption,
    impact,
    recoveryOptions,
    resolvedPlan,
    trigger,
    applyPlan,
    dismiss,
    reset,
  } = useItineraryEngine();

  const [selectedBookingId, setSelectedBookingId] = useState(null);

  useEffect(() => {
    if (trip && !selectedBookingId) {
      setSelectedBookingId(trip.bookings[0].id);
    }
  }, [trip, selectedBookingId]);

  const bookingsById = useMemo(() => {
    if (!trip) return {};
    return Object.fromEntries(trip.bookings.map((b) => [b.id, b]));
  }, [trip]);

  const atRiskCount = trip
    ? trip.bookings.filter((b) => b.status === "at-risk").length
    : 0;
  const disruptedCount = trip
    ? trip.bookings.filter((b) => b.status === "disrupted").length
    : 0;

  if (loading || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-soft">
        <Loader2 className="h-6 w-6 text-coral animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-soft">
      <Header
        trip={trip}
        atRiskCount={atRiskCount}
        disruptedCount={disruptedCount}
        onReset={reset}
      />

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 -mt-6 pb-10">
        <div className="bg-page rounded-[2rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] px-4 md:px-8 py-2 grid lg:grid-cols-[1fr_380px] gap-8">
        <section>
          <div className="mb-6 pt-6">
            <h2 className="font-display text-xl font-bold text-ink">
              Your itinerary
            </h2>
            <p className="text-sm text-ink-dim mt-0.5">
              {trip.bookings.length} connected bookings · tap one to select it
              in the console
            </p>
          </div>
          <ItineraryRail
            bookings={trip.bookings}
            atRiskIds={atRiskIds}
            impact={impact}
            selectedId={selectedBookingId}
            onSelect={setSelectedBookingId}
          />
        </section>

        <aside className="lg:sticky lg:top-6 lg:self-start space-y-6 pt-6 pb-6">
          {!activeDisruption ? (
            <DisruptionConsole
              bookings={trip.bookings}
              disruptionTypes={disruptionTypes}
              selectedBookingId={selectedBookingId}
              onSelectBooking={setSelectedBookingId}
              triggering={triggering}
              onTrigger={trigger}
            />
          ) : (
            <div>
              {!resolvedPlan && (
                <button
                  onClick={dismiss}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-faint hover:text-ink-dim mb-4 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to console
                </button>
              )}
              <ImpactPanel
                disruption={activeDisruption}
                impact={impact}
                bookingsById={bookingsById}
                disruptionTypeLabel={DISRUPTION_LABELS[activeDisruption.type]}
              />
              <RecoveryList
                options={recoveryOptions}
                onApply={applyPlan}
                applying={applying}
                resolvedPlan={resolvedPlan}
                onDismiss={dismiss}
              />
            </div>
          )}
        </aside>
        </div>
      </main>
    </div>
  );
}
