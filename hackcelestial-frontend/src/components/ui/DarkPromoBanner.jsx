import { motion } from "framer-motion";

export default function DarkPromoBanner({ eyebrow, heading, subtext, children, className = "", contentClassName = "px-6 md:px-12 pt-12 pb-8" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl ${className}`}
      style={{ background: "linear-gradient(160deg, #14120f 0%, #241f18 55%, #14120f 100%)" }}
    >
      <motion.div
        className="absolute top-0 left-1/3 w-[460px] h-[460px] bg-brand/12 rounded-full blur-3xl -translate-y-1/2 will-change-transform"
        animate={{ x: [0, 40, -20, 0], y: [0, -20, 10, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-[360px] h-[360px] bg-status-resolved/10 rounded-full blur-3xl translate-y-1/2 will-change-transform"
        animate={{ x: [0, -30, 20, 0], y: [0, 20, -15, 0], scale: [1, 0.9, 1.08, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      {/* subtle grain for a premium, non-flat surface */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />

      <div className={`relative z-10 ${contentClassName}`}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-8"
        >
          {eyebrow && (
            <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 text-white/75 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
              {eyebrow}
            </div>
          )}
          <h2 className="font-display font-medium text-white text-3xl md:text-5xl tracking-tight leading-[1.08]">
            {heading}
          </h2>
          {subtext && <p className="text-white/60 max-w-lg mx-auto text-sm mt-3.5">{subtext}</p>}
        </motion.div>
        {children}
      </div>
    </div>
  );
}
