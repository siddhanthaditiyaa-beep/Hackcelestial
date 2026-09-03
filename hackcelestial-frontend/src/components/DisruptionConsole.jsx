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
    <div className="rounded-md bg-surface border border-border p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-sm bg-brand-dim border border-brand/20 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-brand" />
        </div>
        <div>
          <h2 className="font-display font-medium text-lg text-ink">
            Disruption Simulator
          </h2>
          <p className="text-xs text-ink-dim mt-0.5">
            Trigger real-world ripple events & recovery
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Step 1: Select Booking */}
        <div>
          <label className="block text-[11px] font-bold text-ink-faint uppercase tracking-wider mb-2">
            1. Target Booking
          </label>
          <select
            value={selectedBookingId ?? ""}
            onChange={(e) => onSelectBooking(e.target.value)}
            className="w-full bg-surface-sunk border border-border rounded-sm px-4 py-3.5 text-xs font-semibold text-ink focus:outline-none focus:ring-1 focus:ring-brand/50 focus:border-brand/50 cursor-pointer transition-all"
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
          <label className="block text-[11px] font-bold text-ink-faint uppercase tracking-wider mb-2">
            2. Scenario Matrix
          </label>
          <select
            value={disruptionType}
            onChange={(e) => setDisruptionType(e.target.value)}
            disabled={!validTypes.length}
            className="w-full bg-surface-sunk border border-border rounded-sm px-4 py-3.5 text-xs font-semibold text-ink focus:outline-none focus:ring-1 focus:ring-brand/50 focus:border-brand/50 cursor-pointer transition-all disabled:opacity-30"
          >
            {validTypes.length === 0 && <option>No scenarios for this type</option>}
            {validTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          {activeTypeObj && (
            <p className="text-[11px] text-ink-dim mt-2.5 leading-relaxed bg-surface-sunk p-2.5 rounded-sm border border-border/60">
              {activeTypeObj.description}
            </p>
          )}
        </div>

        {/* Optional: Delay Duration Slider if applicable */}
        {isDelayScenario && (
          <div className="p-4 rounded-sm bg-surface-sunk border border-border">
            <div className="flex items-center justify-between text-xs font-bold mb-3">
              <span className="text-ink-dim flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <Clock className="h-3.5 w-3.5 text-status-risk" />
                Inbound Delay
              </span>
              <span className="text-status-risk font-bold font-mono bg-status-risk-dim px-2 py-0.5 rounded-sm border border-status-risk/20">+{delayMinutes}m</span>
            </div>
            <div className="flex items-center gap-2">
              {[30, 60, 120, 180].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDelayMinutes(m)}
                  className={`flex-1 py-1.5 rounded-sm text-[11px] font-bold transition-all ${
                    delayMinutes === m
                      ? "bg-status-risk text-white"
                      : "bg-surface border border-border text-ink-dim hover:text-ink hover:border-status-risk/50"
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
            <span className="text-[9px] text-status-resolved border border-status-resolved/20 bg-status-resolved-dim px-1.5 py-0.5 rounded-sm">
              {travelerPreference}
            </span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "balanced", label: "Balanced", desc: "Pareto optimal" },
              { id: "comfort", label: "Stay Put", desc: "No hotel change" },
              { id: "budget", label: "Budget Saver", desc: "Save money" },
              { id: "speed", label: "Speed First", desc: "Save time" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectPreference?.(p.id)}
                className={`p-3 rounded-sm border text-left transition-all ${
                  travelerPreference === p.id
                    ? "border-brand ring-1 ring-brand/25 bg-brand-dim text-ink"
                    : "border-border bg-surface-sunk text-ink-dim hover:border-brand/40 hover:text-ink"
                }`}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider leading-none text-ink">{p.label}</div>
                <div className="text-[10px] text-ink-faint mt-1.5 font-medium">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          disabled={!selectedBookingId || !disruptionType || triggering}
          onClick={() => onTrigger(selectedBookingId, disruptionType, delayMinutes)}
          className="w-full mt-4 inline-flex items-center justify-center gap-2 rounded-sm bg-brand text-brand-ink font-bold text-sm py-4 hover:brightness-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
        >
          {triggering ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
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
