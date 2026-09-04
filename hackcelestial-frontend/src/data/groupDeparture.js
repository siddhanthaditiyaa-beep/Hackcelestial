// Shared "minimum group size before it's real" bookings — the teammate's
// idea: for low-frequency/remote items, a booking doesn't confirm instantly,
// it joins a shared pool that only becomes real once enough travelers join.
// One doc per item (not per booking) holds the whole group's state, so every
// traveler booking the same item sees and contributes to the same count —
// mirrors the exact Firestore-with-localStorage-fallback pattern already
// established in community.js (demo account has no real Firebase Auth
// session, so it gets a local-only simulation of the same mechanic instead).
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION = "groupDepartures";
const LS_KEY = "recoup_group_departures";

function readLS() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; }
}
function writeLS(all) {
  localStorage.setItem(LS_KEY, JSON.stringify(all));
}

function deriveStatus(data) {
  const joinedCount = data.participants?.length || 0;
  const filled = joinedCount >= data.minGroupSize;
  const expired = !filled && Date.now() > data.deadline;
  return { joinedCount, minGroupSize: data.minGroupSize, deadline: data.deadline, filled, expired };
}

export async function joinGroupDeparture(itemId, bookingId, minGroupSize, deadlineDays, canSyncFirestore) {
  if (!canSyncFirestore) {
    const all = readLS();
    const existing = all[itemId];
    const entry = existing || { minGroupSize, deadline: Date.now() + deadlineDays * 86_400_000, participants: [] };
    entry.participants.push({ bookingId, joinedAt: Date.now() });
    all[itemId] = entry;
    writeLS(all);
    return deriveStatus(entry);
  }

  const ref = doc(db, COLLECTION, itemId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const entry = { minGroupSize, deadline: Date.now() + deadlineDays * 86_400_000, participants: [{ bookingId, joinedAt: Date.now() }] };
    await setDoc(ref, entry);
    return deriveStatus(entry);
  }
  await updateDoc(ref, { participants: arrayUnion({ bookingId, joinedAt: Date.now() }) });
  const updated = await getDoc(ref);
  return deriveStatus(updated.data());
}

export async function checkGroupDepartureStatus(itemId, canSyncFirestore) {
  if (!canSyncFirestore) {
    const entry = readLS()[itemId];
    return entry ? deriveStatus(entry) : null;
  }
  const snap = await getDoc(doc(db, COLLECTION, itemId));
  return snap.exists() ? deriveStatus(snap.data()) : null;
}
