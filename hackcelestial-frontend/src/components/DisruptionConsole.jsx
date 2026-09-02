import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { TYPE_LABEL } from "../utils/visuals";

export default function DisruptionConsole({
  bookings,
  disruptionTypes,
  selectedBookingId,
  onSelectBooking,
  triggering,
  onTrigger,
}) {
  const [disruptionType, setDisruptionType] = useState("");

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);

  const validTypes = useMemo(() => {
    if (!selectedBooking) return [];
    return disruptionTypes.filter((t) => t.appliesTo.includes(selectedBooking.type));
  }, [selectedBooking, disruptionTypes]);

  useEffect(() => {
    if (validTypes.length && !validTypes.some((t) => t.id === disruptionType)) {
      setDisruptionType(validTypes[0].id);
    }
    if (!validTypes.length) setDisruptionType("");
  }, [validTypes]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.12)]">
      <div className="flex items-center gap-2 mb-5">
        <motion.div
          animate={{ rotate: [0, 12, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
          className="h-9 w-9 rounded-2xl bg-coral-dim flex items-center justify-center"
        >
          <Sparkles className="h-4.5 w-4.5 text-coral" />
        </motion.div>
        <div>
          <h2 className="font-display font-semibold text-base text-ink">
            Simulate a disruption
          </h2>
          <p className="text-xs text-ink-faint">see the recovery engine in action</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-ink-dim mb-1.5">
            Which booking?
          </label>
          <select
            value={selectedBookingId ?? ""}
            onChange={(e) => onSelectBooking(e.target.value)}
            className="w-full bg-surface-sunk border border-border rounded-2xl px-4 py-3 text-sm font-medium text-ink focus:outline-none focus:border-coral appearance-none cursor-pointer"
          >
            <option value="" disabled>
              Choose a booking…
            </option>
            {bookings.map((b) => (
              <option key={b.id} value={b.id}>
                {TYPE_LABEL[b.type]} — {b.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-dim mb-1.5">
            What happens?
          </label>
          <select
            value={disruptionType}
            onChange={(e) => setDisruptionType(e.target.value)}
            disabled={!validTypes.length}
            className="w-full bg-surface-sunk border border-border rounded-2xl px-4 py-3 text-sm font-medium text-ink focus:outline-none focus:border-coral appearance-none cursor-pointer disabled:opacity-40"
          >
            {validTypes.length === 0 && <option>No scenarios for this type</option>}
            {validTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          disabled={!selectedBookingId || !disruptionType || triggering}
          onClick={() => onTrigger(selectedBookingId, disruptionType)}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-coral text-white font-semibold text-sm py-3.5 hover:brightness-105 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_8px_20px_-8px_rgba(255,90,95,0.6)]"
        >
          {triggering ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Working it out…
            </>
          ) : (
            "Trigger disruption"
          )}
        </motion.button>
      </div>
    </div>
  );
}
