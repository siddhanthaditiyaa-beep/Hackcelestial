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
  const glow = tint?.text ? `0 22px 44px -18px color-mix(in srgb, currentColor 60%, transparent)` : undefined;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`bg-surface rounded-lg border border-border shadow-sm hover:border-border-strong transition-colors overflow-hidden group ${tint?.text || ""}`}
    >
      <div
        className="hover:[box-shadow:var(--card-glow,var(--shadow-lift))] rounded-lg transition-shadow duration-300"
        style={{ "--card-glow": glow }}
      >
      <div className={`relative ${imageHeight} overflow-hidden`}>
        <img
          src={imageSrc}
          alt={imageAlt}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        {badge && <div className="absolute top-3 left-3">{badge}</div>}
        <div className="absolute inset-x-0 bottom-0 p-3.5">{overlay}</div>
      </div>

      <div className="px-4 py-3.5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          {priceLabel && <div className="text-[10px] text-ink-faint uppercase tracking-wide">{priceLabel}</div>}
          <div className="font-display font-bold text-xl text-ink leading-tight tracking-tight">{price}</div>
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
              className="px-3 py-2 rounded-full border border-border text-xs font-semibold text-ink-dim hover:text-ink hover:bg-surface-sunk transition"
            >
              Reviews
            </button>
          )}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBook}
            className="btn-shine px-4 py-2 rounded-full text-brand-ink text-xs font-bold shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="relative z-[2]">{ctaLabel}</span>
          </motion.button>
        </div>
      </div>
      </div>
    </motion.div>
  );
}
