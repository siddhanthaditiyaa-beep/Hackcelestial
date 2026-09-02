import { useMemo, useState, useEffect } from "react";
import { Sparkles, Loader2, Clock } from "lucide-react";
import { TYPE_LABEL } from "../utils/visuals";

export default function DisruptionConsole({
  bookings,
  disruptionTypes,
  selectedBookingId,
  onSelectBooking,
  triggering,
  onTrigger,
  travelerPreference = "balanced",
  onSelectPreference,
}) {
  const [disruptionType, setDisruptionType] = useState("");
  const [delayMinutes, setDelayMinutes] = useState(60);

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);

  const validTypes = useMemo(() => {
    if (!selectedBooking) return [];
    return disruptionTypes.filter((t) =>
      t.appliesTo.includes(selectedBooking.type)
    );
  }, [selectedBooking, disruptionTypes]);

  useEffect(() => {
    if (validTypes.length && !validTypes.some((t) => t.id === disruptionType)) {
      setDisruptionType(validTypes[0].id);
    }
    if (!validTypes.length) setDisruptionType("");
  }, [validTypes]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeTypeObj = disruptionTypes.find((t) => t.id === disruptionType);
  const isDelayScenario = disruptionType === "delay" || disruptionType === "missed_connection";

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.12)]">
      <div className="flex items-center gap-2 mb-5">
        <div className="h-9 w-9 rounded-2xl bg-coral-dim flex items-center justify-center">
          <Sparkles className="h-4.5 w-4.5 text-coral" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-base text-ink">
            Disruption Simulator
          </h2>
          <p className="text-xs text-ink-faint">
            Simulate real-world ripple events & recovery
          </p>
        </div>
      </div>

      <div className="space-y-4.5">
        {/* Step 1: Select Booking */}
        <div>
          <label className="block text-xs font-semibold text-ink-dim mb-1.5">
            1. Target Booking in Itinerary
          </label>
          <select
            value={selectedBookingId ?? ""}
            onChange={(e) => onSelectBooking(e.target.value)}
            className="w-full bg-surface-sunk border border-border rounded-2xl px-4 py-3 text-xs font-medium text-ink focus:outline-none focus:border-coral cursor-pointer"
          >
            <option value="" disabled>
              Choose a booking…
            </option>
            {bookings.map((b) => (
              <option key={b.id} value={b.id}>
                [{b.day}] {TYPE_LABEL[b.type] || b.type} — {b.title}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Select Disruption Type */}
        <div>
          <label className="block text-xs font-semibold text-ink-dim mb-1.5">
            2. Disruption Scenario (PS-2 Scenarios)
          </label>
          <select
            value={disruptionType}
            onChange={(e) => setDisruptionType(e.target.value)}
            disabled={!validTypes.length}
            className="w-full bg-surface-sunk border border-border rounded-2xl px-4 py-3 text-xs font-medium text-ink focus:outline-none focus:border-coral cursor-pointer disabled:opacity-40"
          >
            {validTypes.length === 0 && <option>No scenarios for this type</option>}
            {validTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          {activeTypeObj && (
            <p className="text-[11px] text-ink-faint mt-1.5 leading-relaxed">
              {activeTypeObj.description}
            </p>
          )}
        </div>

        {/* Optional: Delay Duration Slider if applicable */}
        {isDelayScenario && (
          <div className="p-3.5 rounded-2xl bg-surface-sunk border border-border/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-ink-dim flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-coral" />
                Inbound Delay Duration
              </span>
              <span className="text-coral font-bold font-mono">+{delayMinutes}m</span>
            </div>
            <div className="flex items-center gap-2">
              {[30, 60, 120, 180].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDelayMinutes(m)}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-semibold transition ${
                    delayMinutes === m
                      ? "bg-coral text-white shadow-xs"
                      : "bg-surface border border-border text-ink-dim hover:text-ink"
                  }`}
                >
                  +{m}m
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Traveler Preference Profile */}
        <div>
          <label className="block text-xs font-semibold text-ink-dim mb-1.5 flex items-center justify-between">
            <span>3. Traveler Optimization Priority</span>
            <span className="text-[10px] text-ink-faint uppercase font-bold tracking-wider">
              {travelerPreference}
            </span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "balanced", label: "Balanced", desc: "Pareto optimal" },
              { id: "budget", label: "Budget Saver", desc: "Max refunds" },
              { id: "speed", label: "Speed First", desc: "Earliest arrival" },
              { id: "comfort", label: "Max Comfort", desc: "Low friction" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectPreference?.(p.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  travelerPreference === p.id
                    ? "border-coral bg-coral-dim/30 text-ink shadow-xs"
                    : "border-border bg-surface-sunk/60 text-ink-dim hover:border-border-strong hover:text-ink"
                }`}
              >
                <div className="text-xs font-bold leading-none">{p.label}</div>
                <div className="text-[10px] text-ink-faint mt-1">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          disabled={!selectedBookingId || !disruptionType || triggering}
          onClick={() => onTrigger(selectedBookingId, disruptionType, delayMinutes)}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-coral text-white font-semibold text-sm py-3.5 hover:brightness-105 active:brightness-95 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_8px_20px_-8px_rgba(255,90,95,0.6)] cursor-pointer"
        >
          {triggering ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Simulating Ripple Cascade…
            </>
          ) : (
            "Trigger Disruption & Calculate"
          )}
        </button>
      </div>
    </div>
  );
}
