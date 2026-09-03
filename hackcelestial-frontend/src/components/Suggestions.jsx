import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Plus, ThumbsUp, Sparkles, RotateCw, MapPin } from "lucide-react";
import { getAITripSuggestions } from "../data/api";
import { useBooking } from "../context/BookingContext";
import Autocomplete from "./ui/Autocomplete";

const VIBE_TINT = {
  food: "bg-status-risk-dim text-status-risk",
  adventure: "bg-cat-activity/10 text-activity",
  culture: "bg-cat-train/10 text-train",
  budget: "bg-status-resolved-dim text-status-resolved",
  luxury: "bg-brand-dim text-brand",
  practical: "bg-cat-flight/10 text-flight",
};

const SEED_SUGGESTIONS = [
  { id: 1, text: "Try the street food at the night market, it's amazing and cheap!", author: "TravelPro99", upvotes: 12 },
  { id: 2, text: "Book your hotel near the central station to save time on commuting.", author: "ExplorerAditi", upvotes: 8 },
  { id: 3, text: "Don't forget to pack a universal adapter.", author: "NomadSam", upvotes: 3 },
];

export default function Suggestions({ destination: destinationProp }) {
  const { confirmedBookings, savedDestinations } = useBooking();

  const defaultDestination = useMemo(() => {
    if (destinationProp) return destinationProp;
    const recent = confirmedBookings[0];
    if (recent?.loc) return recent.loc.split(",")[0].trim();
    if (recent?.itemName) return recent.itemName;
    if (savedDestinations[0]) return savedDestinations[0];
    return "Bali";
  }, [destinationProp, confirmedBookings, savedDestinations]);

  const [destination, setDestination] = useState(defaultDestination);
  const [suggestions, setSuggestions] = useState(SEED_SUGGESTIONS);
  const [newSuggestion, setNewSuggestion] = useState("");
  const [aiTips, setAiTips] = useState([]);
  const [loadingTips, setLoadingTips] = useState(true);

  const loadTips = async () => {
    setLoadingTips(true);
    try {
      const tips = await getAITripSuggestions(destination);
      setAiTips(tips);
    } catch {
      setAiTips([]);
    } finally {
      setLoadingTips(false);
    }
  };

  useEffect(() => { loadTips(); }, [destination]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newSuggestion.trim()) return;

    setSuggestions([
      { id: Date.now(), text: newSuggestion, author: "Current User", upvotes: 0 },
      ...suggestions
    ]);
    setNewSuggestion("");
  };

  const handleUpvote = (id) => {
    setSuggestions(suggestions.map(s => s.id === id ? { ...s, upvotes: s.upvotes + 1 } : s));
  };

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
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-status-resolved">
            <Sparkles className="h-3.5 w-3.5" /> Recoup AI Tips
          </span>
          <button onClick={loadTips} disabled={loadingTips} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-faint hover:text-brand transition disabled:opacity-50">
            <RotateCw className={`h-3 w-3 ${loadingTips ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
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
                <div className="animate-pulse space-y-2">
                  <div className="h-5 w-5 rounded bg-surface-sunk" />
                  <div className="h-3 w-3/4 rounded bg-surface-sunk" />
                  <div className="h-3 w-full rounded bg-surface-sunk" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-4">
          {suggestions.map((s) => (
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
                <span className="text-[10px] font-bold">{s.upvotes}</span>
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
