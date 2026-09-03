import { motion } from "framer-motion";

export default function DarkPromoBanner({ eyebrow, heading, subtext, children, className = "", contentClassName = "px-6 md:px-12 pt-12 pb-8" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{ background: "linear-gradient(160deg, #14120f 0%, #241f18 55%, #14120f 100%)" }}
    >
      <div className="absolute top-0 left-1/3 w-[420px] h-[420px] bg-brand/10 rounded-full blur-3xl -translate-y-1/2" />

      <div className={`relative z-10 ${contentClassName}`}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-8"
        >
          {eyebrow && (
            <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 text-white/75 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
              {eyebrow}
            </div>
          )}
          <h2 className="font-display font-medium text-white text-3xl md:text-4xl tracking-tight leading-tight">
            {heading}
          </h2>
          {subtext && <p className="text-white/60 max-w-lg mx-auto text-sm mt-3">{subtext}</p>}
        </motion.div>
        {children}
      </div>
    </div>
  );
}
