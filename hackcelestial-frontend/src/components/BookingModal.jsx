import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Users, CreditCard, CheckCircle, Plane, Train, Building, Tent, Compass, MapPin, Clock, Star } from "lucide-react";
import { useBooking } from "../context/BookingContext";

const CATEGORY_ICONS = { flights: Plane, trains: Train, hotels: Building, hostels: Tent, activities: Compass };
const CATEGORY_COLORS = {
  flights: "from-coral to-pink",
  trains: "from-blue to-teal",
  hotels: "from-amber to-coral",
  hostels: "from-pink to-coral",
  activities: "from-teal to-blue",
};

export default function BookingModal({ item, category, onClose }) {
  const { addBooking } = useBooking();
  const [step, setStep] = useState(1); // 1=details, 2=confirm, 3=success
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [nights, setNights] = useState(2);
  const [paymentTab, setPaymentTab] = useState("card");
  const [loading, setLoading] = useState(false);

  const Icon = CATEGORY_ICONS[category] || Plane;
  const gradient = CATEGORY_COLORS[category] || CATEGORY_COLORS.flights;

  const needsNights = category === "hotels" || category === "hostels";
  const priceStr = item.price || "₹0";
  const basePrice = parseInt(priceStr.replace(/[^0-9]/g, ""), 10) || 0;
  const totalPrice = needsNights ? basePrice * nights * guests : basePrice * guests;

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200)); // simulate payment
    await addBooking({
      category,
      itemId: item.id,
      itemName: item.name || item.title,
      date,
      guests,
      nights: needsNights ? nights : undefined,
      totalPrice,
      img: item.img,
    });
    setStep(3);
    setLoading(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && step !== 3 && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-800"
        >
          {/* Success State */}
          {step === 3 ? (
            <div className="p-10 text-center">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5"
              >
                <CheckCircle className="h-10 w-10 text-green-500" />
              </motion.div>
              <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white mb-2">Booking Confirmed!</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">{item.name || item.title}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">₹{totalPrice.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mb-7">Payment successful · Confirmation sent to your email</p>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-2xl p-4 text-left mb-6">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold text-sm mb-1">
                  🛡️ Recoup AI Protection Active
                </div>
                <p className="text-xs text-green-600 dark:text-green-500">If anything goes wrong with this booking, our AI will automatically find alternatives and recover your trip.</p>
              </div>
              <button onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 transition">
                View My Bookings
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className={`bg-gradient-to-r ${gradient} p-6 relative`}>
                <button onClick={onClose} className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition">
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white/70 text-xs font-semibold uppercase tracking-wide">{category}</div>
                    <h2 className="font-display font-bold text-white text-lg leading-tight">{item.name || item.title}</h2>
                    <div className="flex items-center gap-2 text-white/70 text-xs mt-0.5">
                      {item.loc && <><MapPin className="h-3 w-3" />{item.loc}</>}
                      {item.rating && <><Star className="h-3 w-3 fill-white/70" />{item.rating}</>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {step === 1 && (
                  <>
                    {/* Date */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1.5">
                        <Calendar className="inline h-3.5 w-3.5 mr-1" />
                        {needsNights ? "Check-in Date" : "Date"}
                      </label>
                      <input type="date" value={date} onChange={e => setDate(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-coral/50 focus:ring-2 focus:ring-coral/10 transition [color-scheme:dark]" />
                    </div>

                    {/* Nights (for hotels/hostels) */}
                    {needsNights && (
                      <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1.5">Number of Nights</label>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setNights(n => Math.max(1, n - 1))} className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition">−</button>
                          <span className="font-bold text-lg text-slate-900 dark:text-white w-8 text-center">{nights}</span>
                          <button onClick={() => setNights(n => n + 1)} className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition">+</button>
                        </div>
                      </div>
                    )}

                    {/* Guests */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1.5">
                        <Users className="inline h-3.5 w-3.5 mr-1" />
                        {category === "activities" ? "Participants" : "Guests"}
                      </label>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setGuests(g => Math.max(1, g - 1))} className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition">−</button>
                        <span className="font-bold text-lg text-slate-900 dark:text-white w-8 text-center">{guests}</span>
                        <button onClick={() => setGuests(g => g + 1)} className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition">+</button>
                      </div>
                    </div>

                    {/* Price summary */}
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 flex items-center justify-between">
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {item.price} × {guests} {needsNights ? `× ${nights} nights` : "person"}
                      </div>
                      <div className="font-display font-bold text-xl text-slate-900 dark:text-white">₹{totalPrice.toLocaleString()}</div>
                    </div>

                    <button onClick={() => setStep(2)}
                      className={`w-full py-3.5 rounded-2xl bg-gradient-to-r ${gradient} text-white font-bold text-sm hover:brightness-110 transition shadow-lg`}>
                      Continue to Payment →
                    </button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <button onClick={() => setStep(1)} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition">← Back</button>
                    </div>

                    {/* Payment method tabs */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-2">
                        <CreditCard className="inline h-3.5 w-3.5 mr-1" />Payment Method
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[["card","💳 Card"], ["upi","📱 UPI"], ["netbanking","🏦 Net Banking"]].map(([id, label]) => (
                          <button key={id} onClick={() => setPaymentTab(id)}
                            className={`py-2.5 rounded-xl text-xs font-semibold border transition ${paymentTab===id ? "border-coral bg-coral/5 text-coral" : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300"}`}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {paymentTab === "card" && (
                      <div className="space-y-3">
                        <input placeholder="Card number" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-coral/50 transition" />
                        <div className="grid grid-cols-2 gap-2">
                          <input placeholder="MM / YY" className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-coral/50 transition" />
                          <input placeholder="CVV" className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-coral/50 transition" />
                        </div>
                        <input placeholder="Name on card" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-coral/50 transition" />
                      </div>
                    )}
                    {paymentTab === "upi" && (
                      <input placeholder="Enter UPI ID (e.g. user@paytm)" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-coral/50 transition" />
                    )}
                    {paymentTab === "netbanking" && (
                      <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-coral/50 transition [color-scheme:dark]">
                        <option>SBI</option><option>HDFC</option><option>ICICI</option><option>Axis</option><option>Kotak</option>
                      </select>
                    )}

                    {/* Final total */}
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 flex items-center justify-between border border-slate-100 dark:border-slate-700">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Payable</span>
                      <span className="font-display font-bold text-xl text-slate-900 dark:text-white">₹{totalPrice.toLocaleString()}</span>
                    </div>

                    <button onClick={handleConfirm} disabled={loading}
                      className={`w-full py-3.5 rounded-2xl bg-gradient-to-r ${gradient} text-white font-bold text-sm hover:brightness-110 transition shadow-lg disabled:opacity-70 flex items-center justify-center gap-2`}>
                      {loading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                          <Clock className="h-4 w-4" />
                        </motion.div>
                      ) : <>🔒 Pay ₹{totalPrice.toLocaleString()} Securely</>}
                    </button>
                    <p className="text-center text-xs text-slate-400">256-bit SSL encrypted · PCI DSS compliant</p>
                  </>
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
