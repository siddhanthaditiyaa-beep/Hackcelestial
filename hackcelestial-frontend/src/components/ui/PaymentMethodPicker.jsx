import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { CreditCard, Smartphone, QrCode as QrCodeIcon, Landmark } from "lucide-react";

// Purely local UI simulation — nothing here is ever sent anywhere (this app
// has no real payment gateway). The point is only that the fields are real
// and validated instead of decorative placeholder inputs nobody reads.

const METHODS = [
  { id: "card", label: "Card", icon: CreditCard },
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "qr", label: "QR", icon: QrCodeIcon },
  { id: "netbanking", label: "Net Banking", icon: Landmark },
];

const BANKS = ["SBI", "HDFC", "ICICI", "Axis", "Kotak"];

function isValidCardNumber(v) {
  return /^[\d ]{13,19}$/.test(v.trim()) && v.replace(/\s/g, "").length >= 13;
}
function isValidExpiry(v) {
  return /^(0[1-9]|1[0-2])\/\d{2}$/.test(v.trim());
}
function isValidCvv(v) {
  return /^\d{3,4}$/.test(v.trim());
}
function isValidUpi(v) {
  return /^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(v.trim());
}

export default function PaymentMethodPicker({ amount, onValidityChange }) {
  const [tab, setTab] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bank, setBank] = useState(BANKS[0]);
  const [qrDataUrl, setQrDataUrl] = useState(null);

  useEffect(() => {
    if (tab !== "qr") return;
    let cancelled = false;
    const payload = `upi://pay?pa=recoup.demo@fakebank&pn=Recoup&am=${amount}&cu=INR&tn=Recoup%20Booking`;
    QRCode.toDataURL(payload, { width: 220, margin: 1, color: { dark: "#1a1a1a", light: "#ffffff" } })
      .then((url) => { if (!cancelled) setQrDataUrl(url); })
      .catch(() => { if (!cancelled) setQrDataUrl(null); });
    return () => { cancelled = true; };
  }, [tab, amount]);

  const cardValid = isValidCardNumber(cardNumber) && isValidExpiry(expiry) && isValidCvv(cvv) && cardName.trim().length > 1;
  const upiValid = isValidUpi(upiId);
  const qrValid = !!qrDataUrl;
  const netbankingValid = !!bank;

  const isValid = tab === "card" ? cardValid : tab === "upi" ? upiValid : tab === "qr" ? qrValid : netbankingValid;

  useEffect(() => {
    onValidityChange?.(isValid);
  }, [isValid, onValidityChange]);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-semibold text-ink-dim uppercase tracking-wide block mb-2">
          <CreditCard className="inline h-3.5 w-3.5 mr-1" />Payment Method
        </label>
        <div className="grid grid-cols-2 gap-2">
          {METHODS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`py-2.5 rounded-sm text-xs font-semibold border transition inline-flex items-center justify-center gap-1.5 ${
                tab === id ? "border-brand bg-brand-dim text-brand" : "border-border text-ink-dim hover:border-border-strong"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />{label}
            </button>
          ))}
        </div>
      </div>

      {tab === "card" && (
        <div className="space-y-3">
          <input
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="e.g. 4242 4242 4242 4242"
            inputMode="numeric"
            className="w-full bg-surface-sunk border border-border rounded-sm px-4 py-3 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-brand/50 transition"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="MM/YY"
              className="bg-surface-sunk border border-border rounded-sm px-4 py-3 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-brand/50 transition"
            />
            <input
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              placeholder="CVV"
              inputMode="numeric"
              className="bg-surface-sunk border border-border rounded-sm px-4 py-3 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-brand/50 transition"
            />
          </div>
          <input
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="e.g. John Doe"
            className="w-full bg-surface-sunk border border-border rounded-sm px-4 py-3 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-brand/50 transition"
          />
        </div>
      )}

      {tab === "upi" && (
        <input
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          placeholder="e.g. yourname@upi"
          className="w-full bg-surface-sunk border border-border rounded-sm px-4 py-3 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-brand/50 transition"
        />
      )}

      {tab === "qr" && (
        <div className="flex flex-col items-center gap-2 py-2">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Scan to pay" className="h-40 w-40 rounded-sm border border-border" />
          ) : (
            <div className="h-40 w-40 rounded-sm border border-border bg-surface-sunk animate-pulse" />
          )}
          <p className="text-xs text-ink-faint text-center">Scan with any UPI app to pay ₹{amount?.toLocaleString?.() ?? amount}</p>
        </div>
      )}

      {tab === "netbanking" && (
        <select
          value={bank}
          onChange={(e) => setBank(e.target.value)}
          className="w-full bg-surface-sunk border border-border rounded-sm px-4 py-3 text-sm text-ink outline-none focus:border-brand/50 transition"
        >
          {BANKS.map((b) => <option key={b}>{b}</option>)}
        </select>
      )}
    </div>
  );
}
