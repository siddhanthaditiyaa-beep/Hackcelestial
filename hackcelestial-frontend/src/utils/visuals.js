import { Plane, Building2, CarFront, Compass } from "lucide-react";

export const TYPE_ICON = {
  flight: Plane,
  hotel: Building2,
  transfer: CarFront,
  activity: Compass,
};

export const TYPE_LABEL = {
  flight: "Flight",
  hotel: "Stay",
  transfer: "Transfer",
  activity: "Experience",
};

// Airbnb-style colorful "cover" gradient per booking type, standing in for photography.
export const TYPE_GRADIENT = {
  flight: "linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)",
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

export function formatINR(amount) {
  if (amount === 0) return "₹0";
  const sign = amount > 0 ? "+" : "−";
  return `${sign}₹${Math.abs(amount).toLocaleString("en-IN")}`;
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
