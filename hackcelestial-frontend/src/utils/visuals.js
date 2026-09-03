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

export const STATUS_STYLES = {
  confirmed: {
    badgeBg: "bg-surface-sunk",
    badgeText: "text-ink-dim",
    dot: "bg-ink-faint",
    label: "On track",
  },
  "at-risk": {
    badgeBg: "bg-status-risk-dim",
    badgeText: "text-status-risk",
    dot: "bg-status-risk",
    label: "At risk",
  },
  disrupted: {
    badgeBg: "bg-status-disrupted-dim",
    badgeText: "text-status-disrupted",
    dot: "bg-status-disrupted",
    label: "Disrupted",
  },
  resolved: {
    badgeBg: "bg-status-resolved-dim",
    badgeText: "text-status-resolved",
    dot: "bg-status-resolved",
    label: "Resolved",
  },
};

export const CATEGORY_TINT = {
  flight: { text: "text-flight", bg: "bg-flight", dim: "bg-flight/10", badgeBg: "bg-flight/90" },
  train: { text: "text-train", bg: "bg-train", dim: "bg-train/10", badgeBg: "bg-train/90" },
  hotel: { text: "text-hotel", bg: "bg-hotel", dim: "bg-hotel/10", badgeBg: "bg-hotel/90" },
  hostel: { text: "text-hostel", bg: "bg-hostel", dim: "bg-hostel/10", badgeBg: "bg-hostel/90" },
  activity: { text: "text-activity", bg: "bg-activity", dim: "bg-activity/10", badgeBg: "bg-activity/90" },
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
