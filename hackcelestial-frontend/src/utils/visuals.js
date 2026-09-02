import {
  Plane,
  Building2,
  CarFront,
  Compass,
  TrainFront,
  Clock,
  AlertTriangle,
  CloudLightning,
  XCircle,
  UserCheck,
  Car,
} from "lucide-react";

export const TYPE_ICON = {
  flight: Plane,
  train: TrainFront,
  hotel: Building2,
  transfer: CarFront,
  activity: Compass,
};

export const TYPE_LABEL = {
  flight: "Flight",
  train: "High-Speed Rail",
  hotel: "Stay",
  transfer: "Transfer",
  activity: "Experience",
};

export const TYPE_GRADIENT = {
  flight: "linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)",
  train: "linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)",
  hotel: "linear-gradient(135deg, #fbbf6d 0%, #ff5a5f 100%)",
  transfer: "linear-gradient(135deg, #34d399 0%, #00a699 100%)",
  activity: "linear-gradient(135deg, #c084fc 0%, #e31c5f 100%)",
};

export const STATUS_STYLES = {
  confirmed: {
    badgeBg: "bg-surface-sunk",
    badgeText: "text-ink-dim",
    dot: "bg-ink-faint",
    label: "On track",
  },
  "at-risk": {
    badgeBg: "bg-amber-dim",
    badgeText: "text-amber",
    dot: "bg-amber",
    label: "At risk",
  },
  disrupted: {
    badgeBg: "bg-pink-dim",
    badgeText: "text-pink",
    dot: "bg-pink",
    label: "Disrupted",
  },
  resolved: {
    badgeBg: "bg-teal-dim",
    badgeText: "text-teal",
    dot: "bg-teal",
    label: "Resolved",
  },
};

export const DISRUPTION_ICONS = {
  delay: Clock,
  cancellation_transport: XCircle,
  missed_connection: AlertTriangle,
  cancellation_hotel_activity: Building2,
  transfer_failure: Car,
  weather: CloudLightning,
  traveler_change: UserCheck,
};

export function formatCurrency(amount, currency = "INR") {
  if (amount === 0) {
    const sym = currency === "INR" ? "₹" : currency === "EUR" ? "€" : currency === "JPY" ? "¥" : "$";
    return `${sym}0`;
  }
  const sign = amount > 0 ? "+" : "−";
  const abs = Math.abs(amount);
  const sym = currency === "INR" ? "₹" : currency === "EUR" ? "€" : currency === "JPY" ? "¥" : "$";
  return `${sign}${sym}${abs.toLocaleString()}`;
}

export function formatINR(amount) {
  return formatCurrency(amount, "INR");
}

export function formatMinutes(mins) {
  if (mins === 0) return "no change";
  const sign = mins > 0 ? "+" : "−";
  const abs = Math.abs(mins);
  if (abs < 60) return `${sign}${abs}m`;
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${h}h${m ? ` ${m}m` : ""}`;
}
