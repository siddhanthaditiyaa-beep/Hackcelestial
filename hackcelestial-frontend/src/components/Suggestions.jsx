import { useState } from "react";
import { Lightbulb, Plus, ThumbsUp } from "lucide-react";

export default function Suggestions({ destination }) {
  const [suggestions, setSuggestions] = useState([
    { id: 1, text: "Try the street food at the night market, it's amazing and cheap!", author: "TravelPro99", upvotes: 12 },
    { id: 2, text: "Book your hotel near the central station to save time on commuting.", author: "ExplorerAditi", upvotes: 8 },
    { id: 3, text: "Don't forget to pack a universal adapter.", author: "NomadSam", upvotes: 3 }
  ]);
  const [newSuggestion, setNewSuggestion] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newSuggestion.trim()) return;

    setSuggestions([
      {
        id: Date.now(),
        text: newSuggestion,
        author: "Current User",
        upvotes: 0
      },
      ...suggestions
    ]);
    setNewSuggestion("");
  };

  const handleUpvote = (id) => {
    setSuggestions(suggestions.map(s => s.id === id ? { ...s, upvotes: s.upvotes + 1 } : s));
  };

  return (
    <div className="bg-page rounded-lg shadow-sm px-4 md:px-8 py-8 border border-border mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-sm bg-brand-dim border border-brand/20 flex items-center justify-center">
          <Lightbulb className="h-5 w-5 text-brand" />
        </div>
        <div>
          <h2 className="font-display font-medium text-xl text-ink">
            Community Suggestions {destination ? `for ${destination}` : ""}
          </h2>
          <p className="text-xs text-ink-dim mt-0.5">Tips and tricks from fellow travelers</p>
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
