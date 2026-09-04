import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, CheckCircle, Plane, Train, Building, Tent, Compass, MapPin, Clock, Star, ShieldCheck, AlertTriangle, Phone } from "lucide-react";
import { useBooking } from "../context/BookingContext";
import { CATEGORY_TINT } from "../utils/visuals";
import { checkBookingRisk } from "../data/api";
import Modal from "./ui/Modal";
import MyBookingsModal from "./MyBookingsModal";
import PaymentMethodPicker from "./ui/PaymentMethodPicker";

const CATEGORY_ICONS = { flights: Plane, trains: Train, hotels: Building, hostels: Tent, activities: Compass };
const CATEGORY_KEY = { flights: "flight", trains: "train", hotels: "hotel", hostels: "hostel", activities: "activity" };

export default function BookingModal({ item, category, onClose }) {
  const { addBooking } = useBooking();
  const [step, setStep] = useState(1); // 1=details, 2=payment, 3=success
  const [date, setDate] = useState("");
  const [dateError, setDateError] = useState(false);
  const [guests, setGuests] = useState(1);
  const [nights, setNights] = useState(2);
  const [paymentValid, setPaymentValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [riskWarning, setRiskWarning] = useState(null);
  const [dismissedRisk, setDismissedRisk] = useState(false);

  const Icon = CATEGORY_ICONS[category] || Plane;
  const tint = CATEGORY_TINT[CATEGORY_KEY[category]] || CATEGORY_TINT.flight;

  useEffect(() => {
    const location = item.loc || (item.from && item.to ? `${item.from} → ${item.to}` : item.name || "");
    checkBookingRisk({ type: CATEGORY_KEY[category], location, vendor: item.airline || item.name })
      .then((res) => { if (res.atRisk) setRiskWarning(res); })
      .catch(() => {}); // advisory only — never block booking on this failing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const needsNights = category === "hotels" || category === "hostels";
  const itemName = item.name || item.title || (item.airline ? `${item.airline} ${item.flight}` : "Booking");
  const priceStr = item.price || "₹0";
  const basePrice = parseInt(priceStr.replace(/[^0-9]/g, ""), 10) || 0;
  const totalPrice = needsNights ? basePrice * nights * guests : basePrice * guests;

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200)); // simulate payment
    await addBooking({
      category,
      itemId: item.id,
      itemName,
      date,
      guests,
      nights: needsNights ? nights : undefined,
      totalPrice,
      img: item.img,
      phone: item.phone,
      loc: item.loc,
    });
    setStep(3);
    setLoading(false);
  };

  if (showMyBookings) {
    return <MyBookingsModal onClose={() => { setShowMyBookings(false); onClose(); }} />;
  }

  return (
    <Modal onClose={step !== 3 ? onClose : undefined} closeOnBackdrop={step !== 3} showCloseButton={step !== 3} maxWidth="max-w-lg">
      {/* Success State */}
      {step === 3 ? (
        <div className="p-10 text-center">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="h-20 w-20 rounded-full bg-status-resolved-dim flex items-center justify-center mx-auto mb-5"
          >
            <CheckCircle className="h-10 w-10 text-status-resolved" />
          </motion.div>
          <h2 className="font-display font-semibold text-2xl text-ink mb-2">Booking Confirmed!</h2>
          <p className="text-ink-dim text-sm mb-2">{itemName}</p>
          <p className="text-2xl font-bold text-ink mb-1">₹{totalPrice.toLocaleString()}</p>
          <p className="text-xs text-ink-faint mb-7">Payment successful · Confirmation sent to your email</p>
          <div className="bg-status-resolved-dim border border-status-resolved/20 rounded-md p-4 text-left mb-6">
            <div className="flex items-center gap-2 text-status-resolved font-semibold text-sm mb-1">
              <ShieldCheck className="h-4 w-4" />
              Recoup AI Protection Active
            </div>
            <p className="text-xs text-ink-dim">If anything goes wrong with this booking, our AI will automatically find alternatives and recover your trip.</p>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => setShowMyBookings(true)}
              className="w-full py-3.5 rounded-sm bg-ink text-page font-bold text-sm hover:opacity-90 transition">
              View My Bookings
            </button>
            <button onClick={onClose}
              className="w-full py-3 rounded-sm text-ink-dim font-semibold text-sm hover:bg-surface-sunk transition">
              Continue Exploring
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className={`${tint.bg} p-6 relative`}>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-sm bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-white/70 text-xs font-semibold uppercase tracking-wide">{category}</div>
                <h2 className="font-display font-semibold text-white text-lg leading-tight truncate">{itemName}</h2>
                <div className="flex items-center gap-2 text-white/70 text-xs mt-0.5 min-w-0">
                  {item.loc && <span className="inline-flex items-center gap-1 min-w-0"><MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{item.loc}</span></span>}
                  {item.rating && <span className="inline-flex items-center gap-1 shrink-0"><Star className="h-3 w-3 fill-white/70" />{item.rating}</span>}
                </div>
                {item.phone && (
                  <div className="flex items-center gap-1 text-white/70 text-xs mt-1">
                    <Phone className="h-3 w-3 shrink-0" /> {item.phone}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4 overflow-y-auto">
            {step === 1 && (
              <>
                {riskWarning && !dismissedRisk && (
                  <div className="flex items-start gap-2.5 bg-status-risk-dim border border-status-risk/30 rounded-sm px-3.5 py-3 text-xs">
                    <AlertTriangle className="h-4 w-4 text-status-risk shrink-0 mt-0.5" />
                    <div className="flex-1 text-ink-dim">
                      <span className="font-semibold text-status-risk">Heads up —</span> this route/vendor currently has an active disruption elsewhere in the system. You can still book — Recoup AI's recovery safety net will be active if this happens to you too.
                    </div>
                    <button onClick={() => setDismissedRisk(true)} className="text-status-risk/70 hover:text-status-risk shrink-0 font-bold text-sm leading-none">×</button>
                  </div>
                )}

                {/* Date */}
                <div>
                  <label className="text-xs font-semibold text-ink-dim uppercase tracking-wide block mb-1.5">
                    <Calendar className="inline h-3.5 w-3.5 mr-1" />
                    {needsNights ? "Check-in Date" : "Date"}
                  </label>
                  <input type="date" value={date} onChange={e => { setDate(e.target.value); setDateError(false); }}
                    className={`w-full bg-surface-sunk border rounded-sm px-4 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/10 transition ${dateError ? "border-status-disrupted" : "border-border focus:border-brand/50"}`} />
                  {dateError && <p className="text-xs text-status-disrupted mt-1.5">Please select a date to continue.</p>}
                </div>

                {/* Nights (for hotels/hostels) */}
                {needsNights && (
                  <div>
                    <label className="text-xs font-semibold text-ink-dim uppercase tracking-wide block mb-1.5">Number of Nights</label>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setNights(n => Math.max(1, n - 1))} className="h-9 w-9 rounded-sm border border-border flex items-center justify-center text-ink-dim font-bold hover:bg-surface-sunk transition">−</button>
                      <span className="font-bold text-lg text-ink w-8 text-center">{nights}</span>
                      <button onClick={() => setNights(n => n + 1)} className="h-9 w-9 rounded-sm border border-border flex items-center justify-center text-ink-dim font-bold hover:bg-surface-sunk transition">+</button>
                    </div>
                  </div>
                )}

                {/* Guests */}
                <div>
                  <label className="text-xs font-semibold text-ink-dim uppercase tracking-wide block mb-1.5">
                    <Users className="inline h-3.5 w-3.5 mr-1" />
                    {category === "activities" ? "Participants" : "Guests"}
                  </label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setGuests(g => Math.max(1, g - 1))} className="h-9 w-9 rounded-sm border border-border flex items-center justify-center text-ink-dim font-bold hover:bg-surface-sunk transition">−</button>
                    <span className="font-bold text-lg text-ink w-8 text-center">{guests}</span>
                    <button onClick={() => setGuests(g => g + 1)} className="h-9 w-9 rounded-sm border border-border flex items-center justify-center text-ink-dim font-bold hover:bg-surface-sunk transition">+</button>
                  </div>
                </div>

                {/* Price summary */}
                <div className="bg-surface-sunk rounded-sm p-4 flex items-center justify-between">
                  <div className="text-sm text-ink-dim">
                    {item.price} × {guests} {needsNights ? `× ${nights} nights` : "person"}
                  </div>
                  <div className="font-display font-semibold text-xl text-ink">₹{totalPrice.toLocaleString()}</div>
                </div>

                <motion.button whileTap={{ scale: 0.98 }} onClick={() => date ? setStep(2) : setDateError(true)}
                  className={`w-full py-3.5 rounded-sm ${tint.bg} text-white font-bold text-sm hover:brightness-105 transition shadow-sm`}>
                  Continue to Payment →
                </motion.button>
              </>
            )}

            {step === 2 && (
              <>
                <button onClick={() => setStep(1)} className="text-xs text-ink-faint hover:text-ink-dim transition">← Back</button>

                <PaymentMethodPicker amount={totalPrice} onValidityChange={setPaymentValid} />

                {/* Final total */}
                <div className="bg-surface-sunk rounded-sm p-4 flex items-center justify-between border border-border">
                  <span className="text-sm font-semibold text-ink-dim">Total Payable</span>
                  <span className="font-display font-semibold text-xl text-ink">₹{totalPrice.toLocaleString()}</span>
                </div>

                <motion.button whileTap={!loading ? { scale: 0.98 } : {}} onClick={handleConfirm} disabled={loading || !paymentValid}
                  className={`w-full py-3.5 rounded-sm ${tint.bg} text-white font-bold text-sm hover:brightness-105 transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2`}>
                  {loading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Clock className="h-4 w-4" />
                    </motion.div>
                  ) : <>Pay ₹{totalPrice.toLocaleString()} Securely</>}
                </motion.button>
                <p className="text-center text-xs text-ink-faint">256-bit SSL encrypted · PCI DSS compliant</p>
              </>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
