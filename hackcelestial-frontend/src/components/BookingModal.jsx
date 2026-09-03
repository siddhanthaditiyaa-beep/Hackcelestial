import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, CreditCard, CheckCircle, Plane, Train, Building, Tent, Compass, MapPin, Clock, Star, ShieldCheck, AlertTriangle } from "lucide-react";
import { useBooking } from "../context/BookingContext";
import { CATEGORY_TINT } from "../utils/visuals";
import { checkBookingRisk } from "../data/api";
import Modal from "./ui/Modal";
import MyBookingsModal from "./MyBookingsModal";

const CATEGORY_ICONS = { flights: Plane, trains: Train, hotels: Building, hostels: Tent, activities: Compass };
const CATEGORY_KEY = { flights: "flight", trains: "train", hotels: "hotel", hostels: "hostel", activities: "activity" };

export default function BookingModal({ item, category, onClose }) {
  const { addBooking } = useBooking();
  const [step, setStep] = useState(1); // 1=details, 2=payment, 3=success
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [nights, setNights] = useState(2);
  const [paymentTab, setPaymentTab] = useState("card");
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
              <div className="h-12 w-12 rounded-sm bg-white/20 backdrop-blur flex items-center justify-center">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-white/70 text-xs font-semibold uppercase tracking-wide">{category}</div>
                <h2 className="font-display font-semibold text-white text-lg leading-tight">{itemName}</h2>
                <div className="flex items-center gap-2 text-white/70 text-xs mt-0.5">
                  {item.loc && <><MapPin className="h-3 w-3" />{item.loc}</>}
                  {item.rating && <><Star className="h-3 w-3 fill-white/70" />{item.rating}</>}
                </div>
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
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="w-full bg-surface-sunk border border-border rounded-sm px-4 py-3 text-sm text-ink outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/10 transition" />
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

                <button onClick={() => setStep(2)}
                  className={`w-full py-3.5 rounded-sm ${tint.bg} text-white font-bold text-sm hover:brightness-105 transition shadow-sm`}>
                  Continue to Payment →
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <button onClick={() => setStep(1)} className="text-xs text-ink-faint hover:text-ink-dim transition">← Back</button>

                {/* Payment method tabs */}
                <div>
                  <label className="text-xs font-semibold text-ink-dim uppercase tracking-wide block mb-2">
                    <CreditCard className="inline h-3.5 w-3.5 mr-1" />Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[["card","💳 Card"], ["upi","📱 UPI"], ["netbanking","🏦 Net Banking"]].map(([id, label]) => (
                      <button key={id} onClick={() => setPaymentTab(id)}
                        className={`py-2.5 rounded-sm text-xs font-semibold border transition ${paymentTab===id ? "border-brand bg-brand-dim text-brand" : "border-border text-ink-dim hover:border-border-strong"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {paymentTab === "card" && (
                  <div className="space-y-3">
                    <input placeholder="Card number" className="w-full bg-surface-sunk border border-border rounded-sm px-4 py-3 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-brand/50 transition" />
                    <div className="grid grid-cols-2 gap-2">
                      <input placeholder="MM / YY" className="bg-surface-sunk border border-border rounded-sm px-4 py-3 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-brand/50 transition" />
                      <input placeholder="CVV" className="bg-surface-sunk border border-border rounded-sm px-4 py-3 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-brand/50 transition" />
                    </div>
                    <input placeholder="Name on card" className="w-full bg-surface-sunk border border-border rounded-sm px-4 py-3 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-brand/50 transition" />
                  </div>
                )}
                {paymentTab === "upi" && (
                  <input placeholder="Enter UPI ID (e.g. user@paytm)" className="w-full bg-surface-sunk border border-border rounded-sm px-4 py-3 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-brand/50 transition" />
                )}
                {paymentTab === "netbanking" && (
                  <select className="w-full bg-surface-sunk border border-border rounded-sm px-4 py-3 text-sm text-ink outline-none focus:border-brand/50 transition">
                    <option>SBI</option><option>HDFC</option><option>ICICI</option><option>Axis</option><option>Kotak</option>
                  </select>
                )}

                {/* Final total */}
                <div className="bg-surface-sunk rounded-sm p-4 flex items-center justify-between border border-border">
                  <span className="text-sm font-semibold text-ink-dim">Total Payable</span>
                  <span className="font-display font-semibold text-xl text-ink">₹{totalPrice.toLocaleString()}</span>
                </div>

                <button onClick={handleConfirm} disabled={loading}
                  className={`w-full py-3.5 rounded-sm ${tint.bg} text-white font-bold text-sm hover:brightness-105 transition shadow-sm disabled:opacity-70 flex items-center justify-center gap-2`}>
                  {loading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Clock className="h-4 w-4" />
                    </motion.div>
                  ) : <>Pay ₹{totalPrice.toLocaleString()} Securely</>}
                </button>
                <p className="text-center text-xs text-ink-faint">256-bit SSL encrypted · PCI DSS compliant</p>
              </>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
