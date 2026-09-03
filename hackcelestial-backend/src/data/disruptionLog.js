// In-memory registry of disruptions from BOTH the demo-trip dashboard and the
// real booking-platform flow. Lets /api/risk-check warn about a prospective
// booking based on disruptions triggered anywhere in the system. Not
// persisted — resets on server restart, same as the rest of the app's state.

const log = [];
const MAX_ENTRIES = 500;

export function recordDisruption({ type, location, vendor, bookingType }) {
  log.push({
    type,
    location: (location || "").toLowerCase(),
    vendor: (vendor || "").toLowerCase(),
    bookingType,
    createdAt: new Date().toISOString(),
  });
  if (log.length > MAX_ENTRIES) log.shift();
}

export function findMatchingDisruptions({ bookingType, location, vendor }) {
  const loc = (location || "").toLowerCase();
  const ven = (vendor || "").toLowerCase();

  return log.filter((entry) => {
    if (bookingType && entry.bookingType && entry.bookingType !== bookingType) return false;
    const locMatch = loc && entry.location && (entry.location.includes(loc) || loc.includes(entry.location));
    const venMatch = ven && entry.vendor && (entry.vendor.includes(ven) || ven.includes(entry.vendor));
    return locMatch || venMatch;
  });
}
