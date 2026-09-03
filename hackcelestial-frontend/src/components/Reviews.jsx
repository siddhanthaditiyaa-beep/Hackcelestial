import { useState } from "react";
import { Star, MessageSquare } from "lucide-react";

export default function Reviews({ itemId, itemName }) {
  const [reviews, setReviews] = useState([
    { id: 1, user: "Aman", rating: 5, text: "Excellent experience, highly recommended!", date: "2026-08-15" },
    { id: 2, user: "Sneha", rating: 4, text: "Very good but slightly expensive.", date: "2026-08-10" }
  ]);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newReview.trim()) return;
    
    setReviews([
      {
        id: Date.now(),
        user: "Current User",
        rating: newRating,
        text: newReview,
        date: new Date().toISOString().split("T")[0]
      },
      ...reviews
    ]);
    setNewReview("");
    setNewRating(5);
  };

  return (
    <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm">
      <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-blue" />
        Reviews for {itemName}
      </h3>
      
      {/* Review List */}
      <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
        {reviews.length === 0 ? (
          <p className="text-sm text-ink-faint">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="p-4 rounded-xl bg-surface-sunk border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-ink">{r.user}</span>
                <span className="text-[10px] text-ink-faint">{r.date}</span>
              </div>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-3 w-3 ${star <= r.rating ? "fill-amber text-amber" : "text-ink-faint/30"}`} 
                  />
                ))}
              </div>
              <p className="text-xs text-ink-dim">{r.text}</p>
            </div>
          ))
        )}
      </div>

      {/* Add Review Form */}
      <form onSubmit={handleSubmit} className="border-t border-border pt-4">
        <h4 className="text-sm font-semibold text-ink mb-3">Add Your Review</h4>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-ink-dim">Rating:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setNewRating(star)}
              className={`hover:scale-110 transition-transform ${star <= newRating ? "text-amber fill-amber" : "text-ink-faint"}`}
            >
              <Star className="h-4 w-4" />
            </button>
          ))}
        </div>
        <textarea
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          placeholder="Share your experience..."
          className="w-full bg-surface-sunk/50 border border-border/50 rounded-xl p-3 text-xs text-ink mb-3 focus:outline-none focus:ring-1 focus:ring-blue/50 resize-none h-20"
        />
        <button
          type="submit"
          disabled={!newReview.trim()}
          className="w-full py-2.5 rounded-xl bg-blue text-white text-xs font-bold hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
}
