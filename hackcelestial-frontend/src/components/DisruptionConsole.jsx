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
    <div className="rounded-3xl glass-panel p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-coral-dim/20 rounded-full blur-3xl -z-10 pointer-events-none translate-x-10 -translate-y-10" />
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="h-10 w-10 rounded-2xl bg-coral-dim/30 border border-coral/20 flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(255,79,94,0.3)]">
          <Sparkles className="h-5 w-5 text-coral drop-shadow-[0_0_4px_rgba(255,79,94,0.8)]" />
        </div>
        <div>
          <h2 className="font-display font-bold text-lg text-ink drop-shadow-sm">
            Disruption Simulator
          </h2>
          <p className="text-xs text-ink-dim mt-0.5">
            Trigger real-world ripple events & recovery
          </p>
        </div>
      </div>

      <div className="space-y-5 relative z-10">
        {/* Step 1: Select Booking */}
        <div>
          <label className="block text-[11px] font-bold text-ink-faint uppercase tracking-wider mb-2">
            1. Target Booking
          </label>
          <select
            value={selectedBookingId ?? ""}
            onChange={(e) => onSelectBooking(e.target.value)}
            className="w-full bg-surface-sunk/50 border border-border/50 rounded-2xl px-4 py-3.5 text-xs font-semibold text-ink focus:outline-none focus:ring-1 focus:ring-coral/50 focus:border-coral/50 cursor-pointer backdrop-blur-sm transition-all"
          >
            <option value="" disabled className="bg-page text-ink-faint">
              Choose a booking…
            </option>
            {bookings.map((b) => (
              <option key={b.id} value={b.id} className="bg-page text-ink">
                [{b.day}] {TYPE_LABEL[b.type] || b.type} — {b.title}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Select Disruption Type */}
        <div>
          <label className="block text-[11px] font-bold text-ink-faint uppercase tracking-wider mb-2">
            2. Scenario Matrix
          </label>
          <select
            value={disruptionType}
            onChange={(e) => setDisruptionType(e.target.value)}
            disabled={!validTypes.length}
            className="w-full bg-surface-sunk/50 border border-border/50 rounded-2xl px-4 py-3.5 text-xs font-semibold text-ink focus:outline-none focus:ring-1 focus:ring-coral/50 focus:border-coral/50 cursor-pointer backdrop-blur-sm transition-all disabled:opacity-30"
          >
            {validTypes.length === 0 && <option className="bg-page">No scenarios for this type</option>}
            {validTypes.map((t) => (
              <option key={t.id} value={t.id} className="bg-page text-ink">
                {t.label}
              </option>
            ))}
          </select>
          {activeTypeObj && (
            <p className="text-[11px] text-ink-dim/90 mt-2.5 leading-relaxed bg-surface-sunk/30 p-2.5 rounded-xl border border-border/20">
              {activeTypeObj.description}
            </p>
          )}
        </div>

        {/* Optional: Delay Duration Slider if applicable */}
        {isDelayScenario && (
          <div className="p-4 rounded-2xl bg-surface-sunk/40 border border-border/40 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs font-bold mb-3">
              <span className="text-ink-dim flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <Clock className="h-3.5 w-3.5 text-amber drop-shadow-[0_0_3px_rgba(255,180,0,0.8)]" />
                Inbound Delay
              </span>
              <span className="text-amber font-bold font-mono bg-amber-dim/20 px-2 py-0.5 rounded-md border border-amber/20 drop-shadow-[0_0_2px_rgba(255,180,0,0.5)]">+{delayMinutes}m</span>
            </div>
            <div className="flex items-center gap-2">
              {[30, 60, 120, 180].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDelayMinutes(m)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    delayMinutes === m
                      ? "bg-amber text-white shadow-[0_0_10px_rgba(255,180,0,0.5)]"
                      : "bg-surface-sunk border border-border/50 text-ink-dim hover:text-ink hover:border-amber/50"
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
          <label className="block text-[11px] font-bold text-ink-faint uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>3. Optimization Vector</span>
            <span className="text-[9px] text-teal border border-teal/20 bg-teal-dim/10 px-1.5 py-0.5 rounded">
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
                className={`p-3 rounded-xl border text-left transition-all backdrop-blur-sm ${
                  travelerPreference === p.id
                    ? "border-teal ring-1 ring-teal/30 bg-teal-dim/20 text-ink shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                    : "border-border/50 bg-surface-sunk/30 text-ink-dim hover:border-teal/50 hover:text-ink hover:bg-surface-sunk/60"
                }`}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider leading-none text-ink">{p.label}</div>
                <div className="text-[10px] text-ink-faint/80 mt-1.5 font-medium">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          disabled={!selectedBookingId || !disruptionType || triggering}
          onClick={() => onTrigger(selectedBookingId, disruptionType, delayMinutes)}
          className="w-full mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-coral text-white font-bold text-sm py-4 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,79,94,0.4)] cursor-pointer"
        >
          {triggering ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin drop-shadow-md" />
              Simulating Ripple Cascade…
            </>
          ) : (
            "Trigger Disruption Matrix"
          )}
        </button>
      </div>
    </div>
  );
}
