import { motion } from "framer-motion";
import { RotateCcw, MapPin } from "lucide-react";
import { HERO_IMAGE } from "../utils/bookingImages";

export default function Header({ trip, atRiskCount, disruptedCount, onReset }) {
  const total = trip?.bookings.length ?? 0;
  const onTrack = trip ? trip.bookings.filter((b) => b.status === "confirmed").length : 0;

  return (
    <header className="relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.7) 100%)",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(120deg, rgba(255,90,95,0.35), rgba(255,180,0,0.15))" }}
        aria-hidden
      />

      <div className="relative max-w-[1200px] mx-auto px-6 md:px-10 pt-6 pb-10">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-white/25 backdrop-blur flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">R</span>
            </div>
            <span className="font-display font-bold text-white text-lg tracking-tight">
              Recoup
            </span>
          </div>

          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full bg-white/20 backdrop-blur text-white hover:bg-white/30 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset demo
          </button>
        </div>

        {trip && (
          <div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-1.5 text-white/85 text-sm font-medium mb-1.5">
                <MapPin className="h-4 w-4" />
                {trip.startDate} → {trip.endDate}
              </div>
              <h1 className="font-display font-extrabold text-white text-3xl md:text-4xl tracking-tight drop-shadow-sm">
                {trip.tripName}
              </h1>
              <p className="text-white/85 text-sm mt-1.5 font-medium">
                {trip.traveler.name}'s trip
              </p>
            </motion.div>

            <div className="flex items-center gap-2 mt-5 flex-wrap">
              {disruptedCount > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white text-pink shadow-sm">
                  {disruptedCount} disrupted
                </span>
              )}
              {atRiskCount > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white text-amber shadow-sm">
                  {atRiskCount} at risk
                </span>
              )}
              {disruptedCount === 0 && atRiskCount === 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white text-teal shadow-sm">
                  All bookings on track
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-white">
                {total} bookings · {onTrack} on track
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
