import { motion } from "framer-motion";
import { LogOut, Briefcase } from "lucide-react";
import { HERO_IMAGE } from "../utils/bookingImages";
import ThemeToggle from "./ui/ThemeToggle";

export default function Header({ onOpenMyBookings, onLogout }) {
  return (
    <header className="relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(20,18,15,0.35) 0%, rgba(20,18,15,0.7) 100%)" }}
        aria-hidden
      />

      <div className="relative max-w-[1240px] mx-auto px-4 md:px-8 py-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-full flex items-center justify-center shadow-md ring-1 ring-white/25"
            style={{ background: "linear-gradient(135deg, var(--color-brand), var(--color-brand-2))" }}
          >
            <span className="text-brand-ink font-display font-semibold text-base">R</span>
          </div>
          <div>
            <span className="font-display font-medium text-white text-lg tracking-tight block leading-tight">
              Recoup
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-white/70 block">
              Intelligent Travel Resilience
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* My Bookings */}
          <button
            onClick={onOpenMyBookings}
            className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur text-white transition cursor-pointer"
            title="My Bookings"
          >
            <Briefcase className="h-3.5 w-3.5" />
          </button>

          {/* Theme Toggle */}
          <ThemeToggle className="bg-white/15 hover:bg-white/25 backdrop-blur text-white" />

          {/* Logout */}
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-full bg-white/15 hover:bg-status-disrupted/40 backdrop-blur text-white transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
