import { useState } from "react";
import { motion } from "framer-motion";
import Header from "./components/Header";
import Login from "./components/Login";
import BookingSystem from "./components/BookingSystem";
import Suggestions from "./components/Suggestions";
import MyBookingsModal from "./components/MyBookingsModal";
import ChatWidget from "./components/ChatWidget";
import { useAuth } from "./context/AuthContext";
import { Loader2, Compass, MessageSquarePlus } from "lucide-react";

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const [mainTab, setMainTab] = useState("booking");
  const [myBookingsOpen, setMyBookingsOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-soft">
        <Loader2 className="h-8 w-8 text-brand animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-page-soft">
      <Header onOpenMyBookings={() => setMyBookingsOpen(true)} onLogout={logout} />

      {/* Global Navigation Tabs */}
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 mt-6 mb-8 relative z-10 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2 bg-surface p-1.5 rounded-md border border-border inline-flex shadow-md">
          <button
            onClick={() => setMainTab("booking")}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-5 py-2 rounded-sm text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${mainTab === "booking" ? "bg-ink text-page shadow-sm" : "text-ink-dim hover:text-ink hover:bg-surface-sunk"}`}
          >
            <Compass className="h-4 w-4 shrink-0" /> Explore & Book
          </button>
          <button
            onClick={() => setMainTab("suggestions")}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-5 py-2 rounded-sm text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${mainTab === "suggestions" ? "bg-ink text-page shadow-sm" : "text-ink-dim hover:text-ink hover:bg-surface-sunk"}`}
          >
            <MessageSquarePlus className="h-4 w-4 shrink-0" /> Trip Suggestions
          </button>
        </div>
      </div>

      <main className="max-w-[1240px] mx-auto px-4 md:px-8 pb-12">
        <motion.div key={mainTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
          {mainTab === "booking" && <BookingSystem />}
          {mainTab === "suggestions" && <Suggestions />}
        </motion.div>
      </main>

      {myBookingsOpen && <MyBookingsModal onClose={() => setMyBookingsOpen(false)} />}

      <ChatWidget />
    </div>
  );
}
