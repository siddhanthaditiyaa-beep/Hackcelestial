import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Sparkles, X } from "lucide-react";
import { useToast } from "../../context/ToastContext";

const TONE_ICON = {
  brand: Sparkles,
  disrupted: AlertTriangle,
  resolved: CheckCircle2,
};

const TONE_ACCENT = {
  brand: "border-l-brand",
  disrupted: "border-l-status-disrupted",
  resolved: "border-l-status-resolved",
};

export default function ToastStack() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = TONE_ICON[t.tone] || Sparkles;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -12, x: 12 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.25 }}
              className={`pointer-events-auto bg-surface border border-border border-l-4 ${TONE_ACCENT[t.tone] || TONE_ACCENT.brand} rounded-sm shadow-md p-4 flex items-start gap-3`}
            >
              <Icon className="h-4.5 w-4.5 text-ink-dim shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                {t.title && <div className="text-sm font-semibold text-ink">{t.title}</div>}
                {t.body && <div className="text-xs text-ink-dim mt-0.5 leading-relaxed">{t.body}</div>}
              </div>
              <button onClick={() => dismiss(t.id)} className="text-ink-faint hover:text-ink transition shrink-0">
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
