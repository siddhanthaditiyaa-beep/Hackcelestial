import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function Modal({
  onClose,
  closeOnBackdrop = true,
  maxWidth = "max-w-lg",
  showCloseButton = false,
  className = "",
  children,
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm"
        onClick={(e) => closeOnBackdrop && e.target === e.currentTarget && onClose?.()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={`relative bg-surface rounded-lg border border-border shadow-md w-full ${maxWidth} max-h-[88vh] flex flex-col overflow-hidden ${className}`}
        >
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-surface-sunk hover:bg-border flex items-center justify-center text-ink-dim transition"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
