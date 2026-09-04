import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, CreditCard, ShieldCheck, Clock } from "lucide-react";
import { useBooking } from "../context/BookingContext";
import Modal from "./ui/Modal";

function parsePrice(price) {
  return parseInt(String(price || "0").replace(/[^0-9]/g, ""), 10) || 0;
}

function itemLabel(category, item) {
  if (category === "flights") return `${item.airline} · ${item.from} → ${item.to}`;
  if (category === "trains") return `${item.name} · ${item.from} → ${item.to}`;
  return item.name;
}

// Booking category → dependency tier, mirroring the demo trip's own shape
// (transport first, then lodging, then activities). Items in a later tier
// depend on the first-booked item of the nearest earlier non-empty tier, so
// disrupting a bundle's flight can cascade to its hotel/activities the same
// way the seeded demo trip cascades.
const CATEGORY_TIER = { flights: 0, trains: 0, hotels: 1, hostels: 1, activities: 2 };

function buildBundlePayload(items) {
  const bundleId = `bundle_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const withTier = items.map(({ category, item }) => ({
    category,
    item,
    tier: CATEGORY_TIER[category] ?? 1,
    id: `${bundleId}_${category}_${item.id}`,
  }));

  const firstIdByTier = {};
  withTier.forEach((entry) => {
    if (firstIdByTier[entry.tier] === undefined) firstIdByTier[entry.tier] = entry.id;
  });
  const tiers = Object.keys(firstIdByTier).map(Number).sort((a, b) => a - b);

  return withTier.map((entry) => {
    const earlierTier = [...tiers].reverse().find((t) => t < entry.tier);
    const dependsOn = earlierTier !== undefined ? [firstIdByTier[earlierTier]] : [];
    return { ...entry, bundleId, dependsOn };
  });
}

export default function BundleCheckoutModal({ items, onClose, onDone }) {
  const { addBooking } = useBooking();
  const [step, setStep] = useState(1); // 1=review, 2=success
  const [loading, setLoading] = useState(false);

  const total = items.reduce((sum, { item }) => sum + parsePrice(item.price), 0);

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400)); // simulate combined payment
    const bundle = buildBundlePayload(items);
    await Promise.all(
      bundle.map(({ id, category, item, bundleId, dependsOn }) =>
        addBooking({
          id,
          category,
          itemId: item.id,
          itemName: itemLabel(category, item),
          date: "",
          guests: 1,
          totalPrice: parsePrice(item.price),
          img: item.img,
          bundleId,
          dependsOn,
        })
      )
    );
    setStep(2);
    setLoading(false);
  };

  return (
    <Modal onClose={step === 1 ? onClose : undefined} closeOnBackdrop={step === 1} showCloseButton={step === 1} maxWidth="max-w-lg">
      {step === 1 ? (
        <>
          <div className="bg-brand p-6">
            <div className="text-white/70 text-xs font-semibold uppercase tracking-wide">Trip Bundle</div>
            <h2 className="font-display font-semibold text-white text-lg">{items.length} item{items.length > 1 ? "s" : ""} · Combined Checkout</h2>
          </div>
          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {items.map(({ category, item }) => (
                <div key={`${category}:${item.id}`} className="flex items-center justify-between gap-3 rounded-sm bg-surface-sunk border border-border p-3">
                  <span className="text-sm text-ink truncate">{itemLabel(category, item)}</span>
                  <span className="text-sm font-semibold text-ink shrink-0">{item.price}</span>
                </div>
              ))}
            </div>
            <div className="bg-surface-sunk rounded-sm p-4 flex items-center justify-between border border-border">
              <span className="text-sm font-semibold text-ink-dim flex items-center gap-1.5"><CreditCard className="h-4 w-4" /> Total Payable</span>
              <span className="font-display font-semibold text-xl text-ink">₹{total.toLocaleString()}</span>
            </div>
            <motion.button
              whileTap={!loading ? { scale: 0.98 } : {}}
              onClick={handleConfirm}
              disabled={loading}
              className="w-full py-3.5 rounded-sm bg-brand text-brand-ink font-bold text-sm hover:brightness-105 transition shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Clock className="h-4 w-4" />
                </motion.div>
              ) : (
                <>Pay ₹{total.toLocaleString()} for Everything</>
              )}
            </motion.button>
            <p className="text-center text-xs text-ink-faint">256-bit SSL encrypted · PCI DSS compliant</p>
          </div>
        </>
      ) : (
        <div className="p-10 text-center">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="h-20 w-20 rounded-full bg-status-resolved-dim flex items-center justify-center mx-auto mb-5"
          >
            <CheckCircle className="h-10 w-10 text-status-resolved" />
          </motion.div>
          <h2 className="font-display font-semibold text-2xl text-ink mb-2">Bundle Booked!</h2>
          <p className="text-ink-dim text-sm mb-2">{items.length} item{items.length > 1 ? "s" : ""} confirmed</p>
          <p className="text-2xl font-bold text-ink mb-6">₹{total.toLocaleString()}</p>
          <div className="bg-status-resolved-dim border border-status-resolved/20 rounded-md p-4 text-left mb-6">
            <div className="flex items-center gap-2 text-status-resolved font-semibold text-sm mb-1">
              <ShieldCheck className="h-4 w-4" /> Recoup AI Protection Active
            </div>
            <p className="text-xs text-ink-dim">Every item in this bundle is covered — if anything's disrupted, we'll find you a recovery option automatically.</p>
          </div>
          <button onClick={onDone} className="w-full py-3.5 rounded-sm bg-ink text-page font-bold text-sm hover:opacity-90 transition">
            Done
          </button>
        </div>
      )}
    </Modal>
  );
}
