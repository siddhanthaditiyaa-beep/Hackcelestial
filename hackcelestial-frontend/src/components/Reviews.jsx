import { useEffect, useState } from "react";
import { Star, MessageSquare, X, Camera, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchReviews, addReview, resizeImageToDataUrl } from "../data/community";

// Shown only when an item has no real reviews yet — never written anywhere,
// purely a friendly empty-state so a freshly-added item doesn't look dead.
const SEED_REVIEWS = [
  { id: "seed_1", user: "Aman", rating: 5, text: "Excellent experience, highly recommended!", date: "2026-08-15" },
  { id: "seed_2", user: "Sneha Pillai", rating: 4, text: "Very good but slightly expensive.", date: "2026-08-10" },
  { id: "seed_3", user: "Yuvraj Yadav", rating: 5, text: "Smooth booking, everything matched what was promised.", date: "2026-08-04" },
  { id: "seed_4", user: "Sreejith Nair", rating: 4, text: "Good value overall, would book again.", date: "2026-07-29" },
  { id: "seed_5", user: "Karthikeya Shailesh Kumar", rating: 5, text: "Loved it — no surprises, exactly as described.", date: "2026-07-20" },
  { id: "seed_6", user: "Sidd", rating: 4, text: "Solid choice, a couple of minor hiccups but handled well.", date: "2026-07-12" },
];

function toDateStr(createdAt) {
  const ms = typeof createdAt === "number" ? createdAt : createdAt?.toMillis?.() ?? Date.now();
  return new Date(ms).toISOString().split("T")[0];
}

export default function Reviews({ itemKey, itemName, onClose }) {
  const { user } = useAuth();
  const canSyncFirestore = !!user?.uid && !user?.isDemo;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchReviews(itemKey, canSyncFirestore)
      .then((r) => { if (!cancelled) setReviews(r); })
      .catch(() => { if (!cancelled) setReviews([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemKey]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setPhotoDataUrl(dataUrl);
    } catch {
      // best-effort — a failed resize just means no photo attaches
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.trim() || submitting) return;
    setSubmitting(true);
    try {
      const entry = await addReview(
        itemKey,
        itemName,
        {
          user: user?.displayName || user?.profile?.displayName || "Traveler",
          rating: newRating,
          text: newReview,
          photoDataUrl,
        },
        canSyncFirestore
      );
      setReviews((prev) => [entry, ...prev]);
      setNewReview("");
      setNewRating(5);
      setPhotoDataUrl(null);
    } finally {
      setSubmitting(false);
    }
  };

  const displayReviews = reviews.length > 0 ? reviews : SEED_REVIEWS;

  return (
    <div className="bg-surface rounded-md p-6 border border-border shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-lg font-semibold text-ink flex items-center gap-2 min-w-0">
          <MessageSquare className="h-5 w-5 text-brand shrink-0" />
          <span className="truncate">Reviews for {itemName}</span>
        </h3>
        {onClose && (
          <button onClick={onClose} className="h-7 w-7 rounded-full hover:bg-surface-sunk flex items-center justify-center text-ink-faint hover:text-ink transition shrink-0">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Review List */}
      <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-ink-faint py-4">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading reviews…
          </div>
        ) : (
          displayReviews.map((r) => (
            <div key={r.id} className="p-4 rounded-sm bg-surface-sunk border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-ink">{r.user}</span>
                <span className="text-[10px] text-ink-faint">{r.date || toDateStr(r.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${star <= r.rating ? "fill-status-risk text-status-risk" : "text-ink-faint/30"}`}
                  />
                ))}
              </div>
              <p className="text-xs text-ink-dim">{r.text}</p>
              {r.photoDataUrl && (
                <img src={r.photoDataUrl} alt="Review attachment" className="mt-2 h-20 w-20 rounded-sm object-cover border border-border" />
              )}
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
              className={`hover:scale-110 transition-transform ${star <= newRating ? "text-status-risk fill-status-risk" : "text-ink-faint"}`}
            >
              <Star className="h-4 w-4" />
            </button>
          ))}
        </div>
        <textarea
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          placeholder="Share your experience..."
          className="w-full bg-surface-sunk border border-border/50 rounded-sm p-3 text-xs text-ink mb-3 focus:outline-none focus:ring-1 focus:ring-brand/50 resize-none h-20"
        />
        <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-dim hover:text-ink cursor-pointer mb-3">
          <Camera className="h-3.5 w-3.5" /> {photoDataUrl ? "Photo attached" : "Attach a photo"}
          <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
        </label>
        {photoDataUrl && (
          <div className="flex items-center gap-2 mb-3">
            <img src={photoDataUrl} alt="Preview" className="h-12 w-12 rounded-sm object-cover border border-border" />
            <button type="button" onClick={() => setPhotoDataUrl(null)} className="text-[11px] text-ink-faint hover:text-status-disrupted">Remove</button>
          </div>
        )}
        <button
          type="submit"
          disabled={!newReview.trim() || submitting}
          className="w-full py-2.5 rounded-sm bg-brand text-brand-ink text-xs font-bold hover:brightness-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting…" : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
