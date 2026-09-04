// Client-side executors for the chat agent's tools. The backend only reasons
// (Gemini function-calling); every tool that touches bookings or inventory
// runs here, against the same BookingContext functions and api.js calls the
// rest of the UI already uses — the agent isn't a parallel booking system.
import { RESULTS } from "../data/inventory";
import { AIRPORT_CITY } from "../data/locations";
import { disruptRealBooking, disruptBundleBooking } from "../data/api";

const CATEGORY_TO_ENGINE_TYPE = { flights: "flight", trains: "train", hotels: "hotel", hostels: "hotel", activities: "activity" };

function normalize(str) {
  return (str || "").toLowerCase();
}

function parsePrice(price) {
  return parseInt(String(price || "0").replace(/[^0-9]/g, ""), 10) || 0;
}

function itemLabel(category, item) {
  if (category === "flights") return `${item.airline} · ${item.from} → ${item.to}`;
  if (category === "trains") return `${item.name} · ${item.from} → ${item.to}`;
  return item.name;
}

function itemHaystack(category, item) {
  if (category === "flights") return `${AIRPORT_CITY[item.from] || item.from} ${AIRPORT_CITY[item.to] || item.to}`;
  if (category === "trains") return `${item.from} ${item.to}`;
  return item.loc || "";
}

function readStoredBookings() {
  try {
    return JSON.parse(localStorage.getItem("recoup_bookings") || "[]");
  } catch {
    return [];
  }
}

function toEngineBooking(b) {
  return {
    id: b.id,
    type: CATEGORY_TO_ENGINE_TYPE[b.category] || "flight",
    title: b.itemName,
    vendor: b.itemName,
    cost: b.totalPrice,
    location: b.loc || b.itemName,
    dependsOn: Array.isArray(b.dependsOn) ? b.dependsOn : [],
  };
}

function defaultDisruptionParams(booking) {
  if (booking.category === "flights" || booking.category === "trains") {
    return { disruptionType: "delay", delayMinutes: 45 + Math.floor(Math.random() * 90) };
  }
  return { disruptionType: "cancellation_hotel_activity", delayMinutes: 0 };
}

/**
 * @param ctx.addBooking/removeBooking/updateBooking - from useBooking()
 * @param ctx.planStash - a Map<bookingId, recoveryOption[]> that must persist
 *   across the whole chat session (held in a ref by ChatWidget), so a later
 *   apply_recovery_plan call can resolve the planId a prior
 *   simulate_disruption call returned.
 */
export function createChatTools({ addBooking, removeBooking, updateBooking, planStash }) {
  return {
    search_destinations({ query, category }) {
      const keywords = new Set(normalize(query).split(/\s+/).filter((w) => w.length > 2));
      keywords.add(normalize(query));
      const categories = category ? [category] : Object.keys(RESULTS);

      const results = [];
      for (const cat of categories) {
        const items = RESULTS[cat] || [];
        for (const item of items) {
          const haystack = normalize(itemHaystack(cat, item));
          if (![...keywords].some((k) => k && haystack.includes(k))) continue;
          results.push({
            category: cat,
            id: item.id,
            title: itemLabel(cat, item),
            price: item.price,
            rating: item.rating,
            duration: item.duration,
            img: item.img,
          });
          if (results.length >= 8) break;
        }
        if (results.length >= 8) break;
      }

      return { query, resultCount: results.length, results };
    },

    get_my_bookings() {
      const bookings = readStoredBookings().map((b) => ({
        id: b.id,
        category: b.category,
        itemName: b.itemName,
        date: b.date || null,
        guests: b.guests,
        totalPrice: b.totalPrice,
        status: b.status || "confirmed",
        bundleId: b.bundleId || null,
        img: b.img || null,
      }));
      return { bookingCount: bookings.length, bookings };
    },

    async book_item({ category, itemId, guests }) {
      const item = (RESULTS[category] || []).find((i) => i.id === itemId);
      if (!item) {
        return { success: false, error: `No ${category} item with id "${itemId}" — call search_destinations first to get a valid id.` };
      }
      const booking = await addBooking({
        category,
        itemId: item.id,
        itemName: itemLabel(category, item),
        date: "",
        guests: guests || 1,
        totalPrice: parsePrice(item.price),
        img: item.img,
        phone: item.phone,
        loc: item.loc,
        dependsOn: [],
      });
      return { success: true, bookingId: booking.id, itemName: booking.itemName, totalPrice: booking.totalPrice };
    },

    async cancel_booking({ bookingId }) {
      const exists = readStoredBookings().some((b) => b.id === bookingId);
      if (!exists) {
        return { success: false, error: `No booking with id "${bookingId}" — call get_my_bookings first to get a valid id.` };
      }
      await removeBooking(bookingId);
      return { success: true };
    },

    async simulate_disruption({ bookingId, disruptionType, delayMinutes }) {
      const all = readStoredBookings();
      const booking = all.find((b) => b.id === bookingId);
      if (!booking) {
        return { success: false, error: `No booking with id "${bookingId}" — call get_my_bookings first to get a valid id.` };
      }

      const params = defaultDisruptionParams(booking);
      const finalType = disruptionType || params.disruptionType;
      const finalDelay = delayMinutes ?? params.delayMinutes;

      const siblings = booking.bundleId ? all.filter((b) => b.bundleId === booking.bundleId) : [booking];
      const engineGroup = siblings.map(toEngineBooking);

      const result = engineGroup.length > 1
        ? await disruptBundleBooking(engineGroup, booking.id, finalType, finalDelay, "balanced")
        : await disruptRealBooking(engineGroup[0], finalType, finalDelay, "balanced");

      planStash.set(bookingId, result.recoveryOptions);

      await updateBooking(booking.id, { status: "disrupted" });
      await Promise.all(
        (result.impact?.downstreamImpacts || []).map((id) => updateBooking(id, { status: "at-risk" }))
      );

      return {
        success: true,
        bookingId: booking.id,
        bookingLabel: booking.itemName,
        disruptionType: finalType,
        delayMinutes: finalDelay,
        severityScore: result.impact?.severityScore,
        downstreamAffectedCount: result.impact?.downstreamImpacts?.length || 0,
        totalValueAtRiskINR: result.impact?.financialMetrics?.totalAtRisk,
        recoverableViaPolicyINR: result.impact?.financialMetrics?.recoverableViaPolicy,
        recoveryOptions: (result.recoveryOptions || []).map((p) => ({
          planId: p.id,
          label: p.label,
          badge: p.badge,
          costDeltaINR: p.costDelta,
          refundEstimatedINR: p.refundEstimated,
          scheduleImpactMinutes: p.timeDeltaMinutes,
          convenienceScore: p.convenienceScore,
          recommended: p.recommended,
        })),
      };
    },

    async apply_recovery_plan({ bookingId, planId }) {
      const options = planStash.get(bookingId);
      const plan = options?.find((p) => p.id === planId);
      if (!plan) {
        return { success: false, error: `No plan "${planId}" for booking "${bookingId}" — call simulate_disruption on this booking first.` };
      }

      await updateBooking(bookingId, { status: "resolved", itemName: plan.label || undefined });

      const all = readStoredBookings();
      const booking = all.find((b) => b.id === bookingId);
      if (booking?.bundleId) {
        await Promise.all(
          all
            .filter((b) => b.bundleId === booking.bundleId && b.id !== bookingId && b.status === "at-risk")
            .map((b) => updateBooking(b.id, { status: "resolved" }))
        );
      }

      return {
        success: true,
        appliedPlan: plan.label,
        netCostDeltaINR: (plan.costDelta || 0) - (plan.refundEstimated || 0),
      };
    },
  };
}
