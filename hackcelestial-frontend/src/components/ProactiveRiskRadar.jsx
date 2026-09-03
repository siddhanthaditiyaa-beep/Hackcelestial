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
      <div className="rounded-md bg-surface border border-border p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-sm bg-status-risk-dim border border-status-risk/20 flex items-center justify-center">
              <Radar className="h-5 w-5 text-status-risk animate-[spin_4s_linear_infinite]" />
            </div>
            <div>
              <h3 className="font-display font-medium text-lg text-ink">
                Proactive Risk Radar
              </h3>
              <p className="text-xs text-ink-dim mt-0.5">
                Real-time connection vulnerability scanner
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-wider bg-status-risk-dim text-status-risk border border-status-risk/30">
              <AlertTriangle className="h-3.5 w-3.5" />
              {atRiskIds.length} Tight Margin{atRiskIds.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Live Weather & Operations Advisory */}
        <div className="grid sm:grid-cols-2 gap-3 mt-6 pt-5 border-t border-border text-xs">
          <div className="flex items-start gap-3 p-3.5 rounded-sm bg-surface-sunk border border-border/60">
            <CloudSun className="h-4.5 w-4.5 text-cat-flight shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-ink uppercase tracking-wider text-[10px]">Regional Weather Outlook</span>
              <p className="text-ink-dim mt-1.5 leading-relaxed font-medium">
                Seasonal afternoon tropical squalls forecast across Denpasar & Ubud corridors. Speedboat transfers may experience 20–40m delays.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3.5 rounded-sm bg-surface-sunk border border-border/60">
            <ShieldAlert className="h-4.5 w-4.5 text-status-risk shrink-0 mt-0.5" />
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
      <div className="rounded-md bg-surface border border-border p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <Sliders className="h-5 w-5 text-brand" />
            <h4 className="font-display font-medium text-lg text-ink">
              "What-If" Inbound Delay Simulator
            </h4>
          </div>
          <span className="text-[10px] text-ink-faint font-bold uppercase tracking-wider border border-border bg-surface-sunk px-2 py-1 rounded-sm">
            Test cascade tipping points
          </span>
        </div>

        {/* Selector & Slider */}
        <div className="grid sm:grid-cols-2 gap-5 items-center bg-surface-sunk p-5 rounded-sm border border-border">
          <div>
            <label className="block text-[11px] font-bold text-ink-faint uppercase tracking-wider mb-2">
              Test Inbound Booking
            </label>
            <select
              value={selectedRootId}
              onChange={(e) => setSelectedRootId(e.target.value)}
              className="w-full bg-surface border border-border rounded-sm px-4 py-3 text-xs font-semibold text-ink focus:outline-none focus:ring-1 focus:ring-brand/50 cursor-pointer"
            >
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} ({b.startTime})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-[11px] font-bold text-ink-faint uppercase tracking-wider">Simulate Inbound Delay</span>
              <span className="text-brand font-bold font-mono bg-brand-dim px-2.5 py-0.5 rounded-sm border border-brand/20">+{simulatedDelay} minutes</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="5"
              value={simulatedDelay}
              onChange={(e) => setSimulatedDelay(Number(e.target.value))}
              className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-brand"
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
        <div className="space-y-4">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-ink-dim">
            <span>Downstream Connection Margin Analysis</span>
            {earliestBreach && (
              <span className="text-status-disrupted bg-status-disrupted-dim border border-status-disrupted/30 px-2 py-0.5 rounded-sm">
                Critical tipping point at +{earliestBreach.breakPointMinutes} mins
              </span>
            )}
          </div>

          {simulationResults.length === 0 ? (
            <p className="text-xs text-ink-faint py-5 text-center font-medium bg-surface-sunk rounded-sm border border-dashed border-border">
              This booking has no direct downstream dependents to simulate cascade impacts.
            </p>
          ) : (
            <div className="grid gap-3">
              {simulationResults.map(
                ({ child, originalBuffer, remainingMargin, isBreached, isTight }) => (
                  <div
                    key={child.id}
                    className={`p-4 rounded-sm border transition-all ${
                      isBreached
                        ? "bg-status-disrupted-dim border-status-disrupted/40"
                        : isTight
                        ? "bg-status-risk-dim border-status-risk/30"
                        : "bg-surface-sunk border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {isBreached ? (
                          <XCircle className="h-5 w-5 text-status-disrupted shrink-0" />
                        ) : isTight ? (
                          <AlertTriangle className="h-5 w-5 text-status-risk shrink-0" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-status-resolved shrink-0" />
                        )}
                        <div>
                          <h5 className="font-bold text-sm text-ink">
                            {child.title} <span className="text-ink-dim font-medium text-xs ml-1">({child.subtitle})</span>
                          </h5>
                          <p className="text-[11px] text-ink-dim mt-1 font-medium">
                            Scheduled: <span className="text-ink">{child.startTime}</span> <span className="text-ink-faint mx-1.5">•</span> Original buffer: <span className="text-ink font-mono">{originalBuffer}m</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-sm font-bold tabular-nums ${
                            isBreached
                              ? "text-status-disrupted"
                              : isTight
                              ? "text-status-risk"
                              : "text-status-resolved"
                          }`}
                        >
                          {isBreached
                            ? `Breached by ${Math.abs(remainingMargin)}m`
                            : `Margin: ${remainingMargin}m left`}
                        </span>
                        <div className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${isBreached ? 'text-status-disrupted/80' : isTight ? 'text-status-risk/80' : 'text-status-resolved/80'}`}>
                          {isBreached
                            ? "Missed connection"
                            : isTight
                            ? "Connection high risk"
                            : "Safe connection"}
                        </div>
                      </div>
                    </div>

                    {/* Visual Progress Bar of buffer consumption */}
                    <div className="mt-4 pt-3 border-t border-border/60">
                      <div className="h-2 rounded-full bg-surface border border-border/40 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isBreached
                              ? "bg-status-disrupted w-full"
                              : isTight
                              ? "bg-status-risk"
                              : "bg-status-resolved"
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
                className="inline-flex items-center gap-2 px-5 py-3 rounded-sm bg-brand text-brand-ink text-xs font-bold hover:brightness-105 transition-all shadow-sm cursor-pointer"
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
