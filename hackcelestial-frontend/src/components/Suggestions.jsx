import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Plus, ThumbsUp, Sparkles, MapPin } from "lucide-react";
import { getAITripSuggestions } from "../data/api";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import { fetchSuggestions, addSuggestion, upvoteSuggestion } from "../data/community";
import Autocomplete from "./ui/Autocomplete";
import Skeleton from "./ui/Skeleton";

const VIBE_TINT = {
  food: "bg-status-risk-dim text-status-risk",
  adventure: "bg-cat-activity/10 text-activity",
  culture: "bg-cat-train/10 text-train",
  budget: "bg-status-resolved-dim text-status-resolved",
  luxury: "bg-brand-dim text-brand",
  practical: "bg-cat-flight/10 text-flight",
};

// Shown only when a destination has no real community suggestions yet —
// never written anywhere, purely a friendly empty-state.
const SEED_SUGGESTIONS = [
  { id: "seed_1", text: "Try the street food at the night market, it's amazing and cheap!", author: "Yuvraj Yadav", upvotes: 12 },
  { id: "seed_2", text: "Book your hotel near the central station to save time on commuting.", author: "Sreejith Nair", upvotes: 8 },
  { id: "seed_3", text: "Don't forget to pack a universal adapter.", author: "Karthikeya Shailesh Kumar", upvotes: 3 },
];

const REFRESH_MIN_MS = 120_000;
const REFRESH_JITTER_MS = 60_000;

export default function Suggestions({ destination: destinationProp }) {
  const { confirmedBookings, savedDestinations } = useBooking();
  const { user } = useAuth();
  const canSyncFirestore = !!user?.uid && !user?.isDemo;

  const defaultDestination = useMemo(() => {
    if (destinationProp) return destinationProp;
    const recent = confirmedBookings[0];
    if (recent?.loc) return recent.loc.split(",")[0].trim();
    if (recent?.itemName) return recent.itemName;
    if (savedDestinations[0]) return savedDestinations[0];
    return "Bali";
  }, [destinationProp, confirmedBookings, savedDestinations]);

  const [destination, setDestination] = useState(defaultDestination);
  const [suggestions, setSuggestions] = useState([]);
  const [newSuggestion, setNewSuggestion] = useState("");
  const [aiTips, setAiTips] = useState([]);
  const [loadingTips, setLoadingTips] = useState(true);

  const destinationId = destination.trim().toLowerCase();

  const loadTips = async (refresh = false) => {
    setLoadingTips(true);
    try {
      const tips = await getAITripSuggestions(destination, refresh);
      setAiTips(tips);
    } catch {
      setAiTips([]);
    } finally {
      setLoadingTips(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      const list = await fetchSuggestions(destinationId, canSyncFirestore);
      setSuggestions(list);
    } catch {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    loadTips();
    loadSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination]);

  // Auto-refresh instead of a manual button — re-fetches AI tips (bypassing
  // their cache) and the latest community suggestions every ~2-3 minutes.
  useEffect(() => {
    const delay = REFRESH_MIN_MS + Math.random() * REFRESH_JITTER_MS;
    const id = setInterval(() => {
      loadTips(true);
      loadSuggestions();
    }, delay);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newSuggestion.trim()) return;
    const entry = await addSuggestion(
      destinationId,
      destination,
      { text: newSuggestion, author: user?.displayName || user?.profile?.displayName || "Traveler" },
      canSyncFirestore
    );
    setSuggestions((prev) => [entry, ...prev]);
    setNewSuggestion("");
  };

  const handleUpvote = async (id) => {
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, upvotes: (s.upvotes || 0) + 1 } : s)));
    upvoteSuggestion(id, canSyncFirestore).catch(() => {});
  };

  const displaySuggestions = suggestions.length > 0 ? suggestions : SEED_SUGGESTIONS;

  return (
    <div className="bg-page rounded-lg shadow-sm px-4 md:px-8 py-8 border border-border mt-8">
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-sm bg-brand-dim border border-brand/20 flex items-center justify-center">
            <Lightbulb className="h-5 w-5 text-brand" />
          </div>
          <div>
            <h2 className="font-display font-medium text-xl text-ink">
              Community Suggestions {destination ? `for ${destination}` : ""}
            </h2>
            <p className="text-xs text-ink-dim mt-0.5">Tips and tricks from fellow travelers, plus AI-powered insider knowledge</p>
          </div>
        </div>
        <Autocomplete
          value={destination}
          onChange={setDestination}
          placeholder="Change destination…"
          icon={MapPin}
          className="w-full sm:w-56"
        />
      </div>

      {/* AI Tips */}
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-status-resolved mb-3">
          <Sparkles className="h-3.5 w-3.5" /> Recoup AI Tips
        </span>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {(loadingTips ? Array.from({ length: 4 }) : aiTips).map((tip, i) => (
            <motion.div
              key={tip?.title || i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-md bg-surface border border-border p-4 shadow-sm"
            >
              {tip ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{tip.emoji}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${VIBE_TINT[tip.vibe] || VIBE_TINT.practical}`}>{tip.vibe}</span>
                  </div>
                  <div className="font-semibold text-sm text-ink mb-1">{tip.title}</div>
                  <p className="text-xs text-ink-dim leading-relaxed">{tip.text}</p>
                </>
              ) : (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-4">
          {displaySuggestions.map((s) => (
            <div key={s.id} className="p-5 rounded-md bg-surface border border-border shadow-sm flex gap-4">
              <div className="flex-1">
                <p className="text-sm text-ink mb-2 leading-relaxed">{s.text}</p>
                <div className="text-[11px] text-ink-faint font-medium">Suggested by {s.author}</div>
              </div>
              <button
                onClick={() => handleUpvote(s.id)}
                className="flex flex-col items-center justify-center h-12 w-12 rounded-sm bg-surface-sunk border border-border/50 hover:bg-brand-dim hover:border-brand/30 transition text-ink-dim hover:text-brand group"
              >
                <ThumbsUp className="h-3.5 w-3.5 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold">{s.upvotes || 0}</span>
              </button>
            </div>
          ))}
        </div>

        <div className="self-start sticky top-6">
          <form onSubmit={handleSubmit} className="p-5 rounded-md bg-surface border border-border shadow-sm">
            <h3 className="font-semibold text-sm text-ink mb-3">Got a tip to share?</h3>
            <textarea
              value={newSuggestion}
              onChange={(e) => setNewSuggestion(e.target.value)}
              placeholder="E.g., Visit the museum on Tuesdays for free entry..."
              className="w-full bg-surface-sunk border border-border/50 rounded-sm p-3 text-xs text-ink mb-4 focus:outline-none focus:ring-1 focus:ring-brand/50 resize-none h-24"
            />
            <button
              type="submit"
              disabled={!newSuggestion.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-sm bg-brand text-brand-ink text-xs font-bold hover:brightness-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Add Suggestion
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
