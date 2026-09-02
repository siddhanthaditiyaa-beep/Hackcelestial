// High-res freely-licensed Unsplash photos mapped per booking and type
export const BOOKING_IMAGE = {
  // Bali Trip
  bk_flight_out: "https://images.unsplash.com/photo-1683518569933-c52fecde6640?w=800&q=80&auto=format&fit=crop",
  bk_transfer_1: "https://images.unsplash.com/photo-1712213248719-aade0e02a591?w=800&q=80&auto=format&fit=crop",
  bk_hotel: "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=800&q=80&auto=format&fit=crop",
  bk_trek: "https://images.unsplash.com/photo-1520308194076-a925e6d8fac8?w=800&q=80&auto=format&fit=crop",
  bk_uluwatu: "https://images.unsplash.com/photo-1742175257067-414cbe9033ff?w=800&q=80&auto=format&fit=crop",
  bk_flight_back: "https://images.unsplash.com/photo-1683518569933-c52fecde6640?w=800&q=80&auto=format&fit=crop",

  // Japan Trip
  bk_t2_shinkansen_out: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80&auto=format&fit=crop",
  bk_t2_transfer: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&q=80&auto=format&fit=crop",
  bk_t2_ryokan: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80&auto=format&fit=crop",
  bk_t2_tea: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80&auto=format&fit=crop",
  bk_t2_bamboo: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80&auto=format&fit=crop",
  bk_t2_shinkansen_back: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80&auto=format&fit=crop",

  // Europe Trip
  bk_t3_eurostar: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80&auto=format&fit=crop",
  bk_t3_transfer: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80&auto=format&fit=crop",
  bk_t3_hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&auto=format&fit=crop",
  bk_t3_summit: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80&auto=format&fit=crop",
  bk_t3_tgv: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80&auto=format&fit=crop",
};

export const TYPE_FALLBACK_IMAGE = {
  flight: "https://images.unsplash.com/photo-1683518569933-c52fecde6640?w=800&q=80&auto=format&fit=crop",
  train: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80&auto=format&fit=crop",
  hotel: "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=800&q=80&auto=format&fit=crop",
  transfer: "https://images.unsplash.com/photo-1712213248719-aade0e02a591?w=800&q=80&auto=format&fit=crop",
  activity: "https://images.unsplash.com/photo-1520308194076-a925e6d8fac8?w=800&q=80&auto=format&fit=crop",
};

export const TRIP_HERO_IMAGE = {
  trip_001: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=80&auto=format&fit=crop", // Bali landscape
  trip_002: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600&q=80&auto=format&fit=crop", // Kyoto / Japan
  trip_003: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80&auto=format&fit=crop", // Paris / Europe
};

export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1557093793-d149a38a1be8?w=1600&q=80&auto=format&fit=crop";

export function getTripHeroImage(tripId) {
  return TRIP_HERO_IMAGE[tripId] || HERO_IMAGE;
}

export function getBookingImage(booking) {
  if (booking?.id && BOOKING_IMAGE[booking.id]) {
    return BOOKING_IMAGE[booking.id];
  }
  return TYPE_FALLBACK_IMAGE[booking?.type] || TYPE_FALLBACK_IMAGE.flight;
}
