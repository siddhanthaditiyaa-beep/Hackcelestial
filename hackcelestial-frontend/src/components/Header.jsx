import { LogOut, Briefcase } from "lucide-react";
import ThemeToggle from "./ui/ThemeToggle";

export default function Header({ onOpenMyBookings, onLogout }) {
  return (
    <header className="bg-ink">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-sm bg-white/15 backdrop-blur flex items-center justify-center">
            <span className="text-white font-display font-semibold text-base">R</span>
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
