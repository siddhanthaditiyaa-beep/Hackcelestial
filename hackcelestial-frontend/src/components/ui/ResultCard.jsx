import { motion } from "framer-motion";
import { Star } from "lucide-react";

/**
 * Shared shell for the booking-results cards (flights/trains/hotels/hostels/activities).
 * Each category supplies its own image height + overlay content via config,
 * this component owns the shared chrome: image treatment, hover, footer, CTA.
 */
export default function ResultCard({
  imageSrc,
  imageAlt,
  imageHeight = "h-36",
  badge,
  overlay,
  price,
  priceLabel,
  ratingValue,
  metaText,
  tint,
  ctaLabel = "Book",
  onReview,
  onBook,
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      className="bg-surface rounded-md border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
    >
      <div className={`relative ${imageHeight} overflow-hidden`}>
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        {badge && <div className="absolute top-3 left-3">{badge}</div>}
        <div className="absolute inset-x-0 bottom-0 p-3.5">{overlay}</div>
      </div>

      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          {priceLabel && <div className="text-[10px] text-ink-faint">{priceLabel}</div>}
          <div className="font-display font-semibold text-lg text-ink leading-tight">{price}</div>
          {ratingValue ? (
            <div className="flex items-center gap-1 text-status-risk text-xs mt-0.5">
              <Star className="h-3 w-3 fill-status-risk" />
              {ratingValue}
            </div>
          ) : metaText ? (
            <div className="text-[10px] text-ink-faint mt-0.5">{metaText}</div>
          ) : null}
        </div>
        <div className="flex gap-2 shrink-0">
          {onReview && (
            <button
              onClick={onReview}
              className="px-3 py-1.5 rounded-sm border border-border text-xs font-semibold text-ink-dim hover:text-ink hover:bg-surface-sunk transition"
            >
              Reviews
            </button>
          )}
          <button
            onClick={onBook}
            className={`px-4 py-1.5 rounded-sm text-white text-xs font-bold hover:brightness-105 shadow-sm transition ${tint?.bg || "bg-brand"}`}
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
