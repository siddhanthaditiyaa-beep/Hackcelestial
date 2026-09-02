import { useState, useMemo } from "react";
import {
  Radar,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  XCircle,
  CloudSun,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

export default function ProactiveRiskRadar({
  trip,
  atRiskIds,
  onTriggerDisruption,
}) {
  const bookings = trip?.bookings || [];
  const [selectedRootId, setSelectedRootId] = useState(
    bookings[0]?.id || "bk_flight_out"
  );
  const [simulatedDelay, setSimulatedDelay] = useState(45);

  const rootBooking = useMemo(() => {
    return bookings.find((b) => b.id === selectedRootId) || bookings[0];
  }, [bookings, selectedRootId]);

  // Find immediate downstream dependents
  const directDependents = useMemo(() => {
    if (!rootBooking) return [];
    return bookings.filter((b) => b.dependsOn.includes(rootBooking.id));
  }, [bookings, rootBooking]);

  // Sensitivity calculation
  const simulationResults = useMemo(() => {
    if (!rootBooking) return [];

    return directDependents.map((child) => {
      const originalBuffer = child.bufferMinutes ?? 60;
      const remainingMargin = originalBuffer - simulatedDelay;
      const isBreached = remainingMargin <= 0;
      const isTight = remainingMargin > 0 && remainingMargin < 40;

      return {
        child,
        originalBuffer,
        remainingMargin,
        isBreached,
        isTight,
        breakPointMinutes: originalBuffer,
      };
    });
  }, [rootBooking, directDependents, simulatedDelay]);

  const earliestBreach = useMemo(() => {
    if (!simulationResults.length) return null;
    const sorted = [...simulationResults].sort(
      (a, b) => a.breakPointMinutes - b.breakPointMinutes
    );
    return sorted[0];
  }, [simulationResults]);

  return (
    <div className="space-y-6">
      {/* Top Banner: Proactive Risk Status */}
      <div className="rounded-3xl glass-panel p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.2)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-dim/10 rounded-full blur-3xl -z-10 pointer-events-none -translate-x-10 -translate-y-10" />

        <div className="flex items-start justify-between gap-4 flex-wrap relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-dim/20 border border-amber/20 flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(255,180,0,0.15)]">
              <Radar className="h-5 w-5 text-amber drop-shadow-[0_0_4px_rgba(255,180,0,0.8)] animate-[spin_4s_linear_infinite]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-ink drop-shadow-sm">
                Proactive Risk Radar
              </h3>
              <p className="text-xs text-ink-dim mt-0.5">
                Real-time connection vulnerability scanner
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider bg-amber-dim/20 text-amber border border-amber/30 shadow-[0_0_10px_rgba(255,180,0,0.2)] backdrop-blur-sm">
              <AlertTriangle className="h-3.5 w-3.5" />
              {atRiskIds.length} Tight Margin{atRiskIds.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Live Weather & Operations Advisory */}
        <div className="grid sm:grid-cols-2 gap-3 mt-6 pt-5 border-t border-border/30 text-xs relative z-10">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface-sunk/40 border border-border/40 backdrop-blur-sm transition-all hover:bg-surface-sunk/60 hover:border-blue/30 group">
            <CloudSun className="h-4.5 w-4.5 text-blue shrink-0 mt-0.5 drop-shadow-[0_0_3px_rgba(0,180,255,0.6)] group-hover:scale-110 transition-transform" />
            <div>
              <span className="font-bold text-ink uppercase tracking-wider text-[10px]">Regional Weather Outlook</span>
              <p className="text-ink-dim mt-1.5 leading-relaxed font-medium">
                Seasonal afternoon tropical squalls forecast across Denpasar & Ubud corridors. Speedboat transfers may experience 20–40m delays.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface-sunk/40 border border-border/40 backdrop-blur-sm transition-all hover:bg-surface-sunk/60 hover:border-amber/30 group">
            <ShieldAlert className="h-4.5 w-4.5 text-amber shrink-0 mt-0.5 drop-shadow-[0_0_3px_rgba(255,180,0,0.6)] group-hover:scale-110 transition-transform" />
            <div>
              <span className="font-bold text-ink uppercase tracking-wider text-[10px]">Airspace Congestion</span>
              <p className="text-ink-dim mt-1.5 leading-relaxed font-medium">
                BOM runway maintenance window between 12:00–16:00. Outbound sectors have 22% historical delay likelihood exceeding 30 mins.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive "What-If" Delay Sensitivity Simulator */}
      <div className="rounded-3xl glass-panel p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.2)] space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-coral-dim/10 rounded-full blur-3xl -z-10 pointer-events-none translate-x-10 -translate-y-10" />

        <div className="flex items-center justify-between gap-3 flex-wrap relative z-10">
          <div className="flex items-center gap-2.5">
            <Sliders className="h-5 w-5 text-coral drop-shadow-[0_0_4px_rgba(255,79,94,0.6)]" />
            <h4 className="font-display font-bold text-lg text-ink drop-shadow-sm">
              "What-If" Inbound Delay Simulator
            </h4>
          </div>
          <span className="text-[10px] text-ink-faint font-bold uppercase tracking-wider border border-border/40 bg-surface-sunk/30 px-2 py-1 rounded-md backdrop-blur-sm">
            Test cascade tipping points
          </span>
        </div>

        {/* Selector & Slider */}
        <div className="grid sm:grid-cols-2 gap-5 items-center bg-surface-sunk/40 p-5 rounded-2xl border border-border/40 backdrop-blur-sm relative z-10">
          <div>
            <label className="block text-[11px] font-bold text-ink-faint uppercase tracking-wider mb-2">
              Test Inbound Booking
            </label>
            <select
              value={selectedRootId}
              onChange={(e) => setSelectedRootId(e.target.value)}
              className="w-full bg-page border border-border/50 rounded-xl px-4 py-3 text-xs font-semibold text-ink focus:outline-none focus:ring-1 focus:ring-coral/50 cursor-pointer"
            >
              {bookings.map((b) => (
                <option key={b.id} value={b.id} className="bg-page">
                  {b.title} ({b.startTime})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-[11px] font-bold text-ink-faint uppercase tracking-wider">Simulate Inbound Delay</span>
              <span className="text-coral font-bold font-mono bg-coral-dim/20 px-2.5 py-0.5 rounded-md border border-coral/20 drop-shadow-[0_0_2px_rgba(255,79,94,0.5)]">+{simulatedDelay} minutes</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="5"
              value={simulatedDelay}
              onChange={(e) => setSimulatedDelay(Number(e.target.value))}
              className="w-full h-1.5 bg-border/50 rounded-lg appearance-none cursor-pointer accent-coral"
            />
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-ink-faint mt-2">
              <span>On Time</span>
              <span>+45m</span>
              <span>+90m</span>
              <span>+150m (Severe)</span>
            </div>
          </div>
        </div>

        {/* Dynamic Impact Readout */}
        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-ink-dim">
            <span>Downstream Connection Margin Analysis</span>
            {earliestBreach && (
              <span className="text-pink bg-pink-dim/20 border border-pink/30 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(227,28,95,0.2)]">
                Critical tipping point at +{earliestBreach.breakPointMinutes} mins
              </span>
            )}
          </div>

          {simulationResults.length === 0 ? (
            <p className="text-xs text-ink-faint py-5 text-center font-medium bg-surface-sunk/20 rounded-2xl border border-border/20 border-dashed">
              This booking has no direct downstream dependents to simulate cascade impacts.
            </p>
          ) : (
            <div className="grid gap-3">
              {simulationResults.map(
                ({ child, originalBuffer, remainingMargin, isBreached, isTight }) => (
                  <div
                    key={child.id}
                    className={`p-4 rounded-2xl border transition-all backdrop-blur-sm ${
                      isBreached
                        ? "bg-pink-dim/20 border-pink/40 shadow-[inset_0_0_20px_rgba(227,28,95,0.05)]"
                        : isTight
                        ? "bg-amber-dim/10 border-amber/30"
                        : "bg-surface-sunk/30 border-border/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {isBreached ? (
                          <XCircle className="h-5 w-5 text-pink shrink-0 drop-shadow-[0_0_5px_rgba(227,28,95,0.6)]" />
                        ) : isTight ? (
                          <AlertTriangle className="h-5 w-5 text-amber shrink-0 drop-shadow-[0_0_5px_rgba(255,180,0,0.6)]" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-teal shrink-0 drop-shadow-[0_0_5px_rgba(0,240,255,0.6)]" />
                        )}
                        <div>
                          <h5 className="font-bold text-sm text-ink drop-shadow-sm">
                            {child.title} <span className="text-ink-dim font-medium text-xs ml-1">({child.subtitle})</span>
                          </h5>
                          <p className="text-[11px] text-ink-dim mt-1 font-medium">
                            Scheduled: <span className="text-ink">{child.startTime}</span> <span className="text-ink-faint mx-1.5">•</span> Original buffer: <span className="text-ink font-mono">{originalBuffer}m</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-sm font-bold tabular-nums drop-shadow-sm ${
                            isBreached
                              ? "text-pink"
                              : isTight
                              ? "text-amber"
                              : "text-teal"
                          }`}
                        >
                          {isBreached
                            ? `Breached by ${Math.abs(remainingMargin)}m`
                            : `Margin: ${remainingMargin}m left`}
                        </span>
                        <div className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${isBreached ? 'text-pink/80' : isTight ? 'text-amber/80' : 'text-teal/80'}`}>
                          {isBreached
                            ? "Missed connection"
                            : isTight
                            ? "Connection high risk"
                            : "Safe connection"}
                        </div>
                      </div>
                    </div>

                    {/* Visual Progress Bar of buffer consumption */}
                    <div className="mt-4 pt-3 border-t border-border/30">
                      <div className="h-2 rounded-full bg-surface-sunk/80 border border-border/20 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 shadow-[inset_0_0_5px_rgba(255,255,255,0.2)] ${
                            isBreached
                              ? "bg-pink shadow-[0_0_10px_rgba(227,28,95,0.6)] w-full"
                              : isTight
                              ? "bg-amber shadow-[0_0_10px_rgba(255,180,0,0.6)]"
                              : "bg-teal shadow-[0_0_10px_rgba(0,240,255,0.6)]"
                          }`}
                          style={{
                            width: isBreached
                              ? "100%"
                              : `${Math.max(10, Math.min(100, (remainingMargin / originalBuffer) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* Quick Action to Trigger the tested scenario */}
          {simulatedDelay > 0 && rootBooking && (
            <div className="pt-4 flex justify-end">
              <button
                onClick={() => onTriggerDisruption(rootBooking.id, "delay", simulatedDelay)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-coral text-white text-xs font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_4px_15px_rgba(255,79,94,0.4)] cursor-pointer"
              >
                Apply +{simulatedDelay}m Delay to Engine
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
