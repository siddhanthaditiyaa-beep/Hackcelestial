import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  RotateCcw,
  MapPin,
  Sparkles,
  GitBranch,
  Calendar,
  Radar,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { HERO_IMAGE, getTripHeroImage } from "../utils/bookingImages";

export default function Header({
  trip,
  allTrips = [],
  activeTripId,
  onSwitchTrip,
  activeView,
  onSwitchView,
  atRiskCount,
  disruptedCount,
  onReset,
  onOpenCopilot,
}) {
  const [isDark, setIsDark] = useState(true);
  const [isTripDropdownOpen, setIsTripDropdownOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const total = trip?.bookings?.length ?? 0;
  const onTrack = trip
    ? trip.bookings.filter((b) => b.status === "confirmed" || b.status === "resolved").length
    : 0;

  return (
    <header className="relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${getTripHeroImage(trip?.id)})` }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.8) 100%)",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(120deg, rgba(255,90,95,0.35), rgba(255,180,0,0.18))",
        }}
        aria-hidden
      />

      <div className="relative max-w-[1240px] mx-auto px-4 md:px-8 pt-6 pb-12">
        {/* Top bar: Brand + Trip Switcher + Copilot + Reset */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-white/25 backdrop-blur flex items-center justify-center shadow-xs">
              <span className="text-white font-display font-bold text-base">R</span>
            </div>
            <div>
              <span className="font-display font-bold text-white text-lg tracking-tight block leading-tight">
                Recoup
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-white/70 block">
                Intelligent Travel Resilience
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Trip Switcher Dropdown */}
            {allTrips.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setIsTripDropdownOpen(!isTripDropdownOpen)}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur text-white font-medium text-xs rounded-full px-3.5 py-2 pr-8 appearance-none cursor-pointer border border-white/20 focus:outline-none inline-flex items-center transition-colors"
                >
                  <span className="truncate max-w-[200px]">
                    {allTrips.find((t) => t.id === activeTripId)?.tripName || "Select Trip"}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-white/80 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform ${isTripDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isTripDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsTripDropdownOpen(false)}
                    />
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute left-0 mt-2 w-max min-w-[240px] z-50 glass-panel border border-white/20 rounded-2xl overflow-hidden shadow-2xl bg-page/90 backdrop-blur-2xl"
                    >
                      <div className="py-1">
                        {allTrips.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => {
                              onSwitchTrip?.(t.id);
                              setIsTripDropdownOpen(false);
                            }}
                            className={`block w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-white/10 ${
                              activeTripId === t.id ? "text-coral font-bold bg-white/5" : "text-ink font-medium"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {activeTripId === t.id ? (
                                <span className="h-1.5 w-1.5 rounded-full bg-coral shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                              ) : (
                                <span className="h-1.5 w-1.5 rounded-full bg-transparent shrink-0" />
                              )}
                              <span className="truncate">{t.tripName}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            )}

            {/* AI Copilot Button */}
            <button
              onClick={onOpenCopilot}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full bg-white/25 hover:bg-white/35 backdrop-blur text-white transition shadow-xs cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-200" />
              AI Copilot
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur text-white transition cursor-pointer"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-200" /> : <Moon className="h-4 w-4 text-white" />}
            </button>

            {/* Reset Button */}
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* Trip Title & Metadata */}
        {trip && (
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 text-white/85 text-xs font-medium mb-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>
                  {trip.startDate} → {trip.endDate}
                </span>
                <span>·</span>
                <span>{trip.traveler?.name}</span>
                {trip.traveler?.loyaltyTier && (
                  <span className="px-2 py-0.2 rounded-full bg-white/20 text-[10px] font-bold">
                    {trip.traveler.loyaltyTier}
                  </span>
                )}
              </div>
              <h1 className="font-display font-extrabold text-white text-2xl md:text-3xl lg:text-4xl tracking-tight drop-shadow-sm">
                {trip.tripName}
              </h1>
              {trip.description && (
                <p className="text-white/80 text-xs md:text-sm mt-1 max-w-2xl font-normal leading-relaxed">
                  {trip.description}
                </p>
              )}
            </motion.div>

            {/* View Selector Tabs & Status Readouts */}
            <div className="pt-2 flex items-center justify-between gap-4 flex-wrap border-t border-white/20">
              {/* View Switcher Pills */}
              <div className="flex items-center gap-1 bg-black/25 backdrop-blur p-1 rounded-2xl border border-white/15">
                <button
                  onClick={() => onSwitchView?.("rail")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeView === "rail"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Timeline Rail
                </button>
                <button
                  onClick={() => onSwitchView?.("graph")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeView === "graph"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  <GitBranch className="h-3.5 w-3.5" />
                  DAG Topology
                </button>
                <button
                  onClick={() => onSwitchView?.("radar")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeView === "radar"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  <Radar className="h-3.5 w-3.5" />
                  Risk Radar & Simulator
                </button>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {disruptedCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-white text-pink shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-pink animate-pulse" />
                    {disruptedCount} Disrupted
                  </span>
                )}
                {atRiskCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-white text-amber shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-amber" />
                    {atRiskCount} At Risk
                  </span>
                )}
                {disruptedCount === 0 && atRiskCount === 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-white text-teal shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-teal" />
                    Itinerary Optimal
                  </span>
                )}
                <span className="text-xs text-white/75 font-medium tabular-nums">
                  {total} bookings ({onTrack} on track)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
