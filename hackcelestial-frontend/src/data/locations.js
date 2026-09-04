// Curated location list for autocomplete — merges destination names, flight
// airport codes actually used in RESULTS, and the free-text city strings
// already present in the trains/hotels/hostels/activities inventory.
// Not a geocoding API — a small static list sufficient for this demo.

const AIRPORTS = [
  { code: "BOM", city: "Mumbai", country: "India" },
  { code: "DPS", city: "Denpasar (Bali)", country: "Indonesia" },
  { code: "DEL", city: "Delhi", country: "India" },
  { code: "DXB", city: "Dubai", country: "UAE" },
  { code: "COK", city: "Kochi", country: "India" },
  { code: "LHR", city: "London", country: "UK" },
];

const DESTINATIONS = [
  { name: "Goa", country: "India" }, { name: "Kerala", country: "India" },
  { name: "Rajasthan", country: "India" }, { name: "Manali", country: "India" },
  { name: "Varanasi", country: "India" }, { name: "Andaman Islands", country: "India" },
  { name: "Leh Ladakh", country: "India" }, { name: "Darjeeling", country: "India" },
  { name: "Jaipur", country: "India" }, { name: "Mumbai", country: "India" },
  { name: "Bali", country: "Indonesia" }, { name: "Bangkok", country: "Thailand" },
  { name: "Phuket", country: "Thailand" }, { name: "Hanoi", country: "Vietnam" },
  { name: "Singapore", country: "Singapore" }, { name: "Kuala Lumpur", country: "Malaysia" },
  { name: "Colombo", country: "Sri Lanka" }, { name: "Bagan", country: "Myanmar" },
  { name: "Tokyo", country: "Japan" }, { name: "Kyoto", country: "Japan" },
  { name: "Seoul", country: "South Korea" }, { name: "Shanghai", country: "China" },
  { name: "Dubai", country: "UAE" }, { name: "Abu Dhabi", country: "UAE" },
  { name: "Istanbul", country: "Turkey" }, { name: "Doha", country: "Qatar" },
  { name: "Paris", country: "France" }, { name: "Rome", country: "Italy" },
  { name: "Barcelona", country: "Spain" }, { name: "Amsterdam", country: "Netherlands" },
  { name: "Santorini", country: "Greece" }, { name: "London", country: "UK" },
  { name: "Zurich", country: "Switzerland" }, { name: "Prague", country: "Czech Republic" },
  { name: "New York", country: "USA" }, { name: "Miami", country: "USA" },
  { name: "Maldives", country: "Maldives" }, { name: "Rio de Janeiro", country: "Brazil" },
  { name: "Cape Town", country: "South Africa" }, { name: "Marrakech", country: "Morocco" },
];

// Free-text city strings already used in RESULTS (trains/hotels/hostels/activities)
// that aren't already covered by DESTINATIONS above.
const EXTRA_CITIES = [
  { name: "Delhi", country: "India" }, { name: "Pune", country: "India" },
  { name: "Trivandrum", country: "India" }, { name: "Dehradun", country: "India" },
  { name: "Lucknow", country: "India" }, { name: "Kolkata", country: "India" },
  { name: "Bangalore", country: "India" }, { name: "Ubud", country: "Indonesia" },
  { name: "Seminyak", country: "Indonesia" }, { name: "Kuta", country: "Indonesia" },
  { name: "Agra", country: "India" }, { name: "Alleppey", country: "India" },
  { name: "Anjuna", country: "India" }, { name: "Montmartre", country: "France" },
  { name: "Shinjuku", country: "Japan" }, { name: "Bugis", country: "Singapore" },
  { name: "Sultanahmet", country: "Turkey" }, { name: "New Delhi", country: "India" },
  { name: "Midtown", country: "Japan" }, { name: "Oia", country: "Greece" },
];

// Exposed for matching flight routes (BOM/DPS/etc.) against a destination name.
export const AIRPORT_CITY = Object.fromEntries(AIRPORTS.map((a) => [a.code, a.city]));

// Airport city names are seeded into `seen` first so a plain-city entry
// never duplicates one already covered by an airport (e.g. "Mumbai" was
// appearing twice — once as the BOM airport, once as a bare destination —
// since the old dedupe only checked DESTINATIONS/EXTRA_CITIES against each
// other, never against AIRPORTS).
const seen = new Set(AIRPORTS.map((a) => a.city.toLowerCase()));
export const LOCATIONS = [
  ...AIRPORTS.map((a) => ({ id: `air_${a.code}`, label: a.city, sublabel: `${a.code} · ${a.country}`, code: a.code })),
  ...[...DESTINATIONS, ...EXTRA_CITIES].filter((d) => {
    const key = d.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map((d) => ({ id: `city_${d.name}`, label: d.name, sublabel: d.country })),
];

export function searchLocations(query, limit = 8) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return LOCATIONS.filter(
    (l) => l.label.toLowerCase().includes(q) || l.sublabel.toLowerCase().includes(q) || l.code?.toLowerCase() === q
  ).slice(0, limit);
}
