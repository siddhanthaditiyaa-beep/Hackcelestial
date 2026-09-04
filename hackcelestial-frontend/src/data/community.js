// Shared review/suggestion storage. Real signed-in users write to Firestore
// (so content is visible to every visitor); the demo account transparently
// falls back to localStorage, mirroring the exact `canSyncFirestore` pattern
// already established in BookingContext.jsx (the demo account has no real
// Firebase Auth session, so Firestore writes for it would be rejected by
// security rules and can hang rather than fail promptly).
//
// Queries deliberately avoid `orderBy` alongside a `where` on a different
// field — that combination needs a Firestore composite index created
// per-query in the console, another manual setup step. Sorting by recency
// happens client-side instead, which is plenty fast at this data scale.
import { collection, addDoc, doc, updateDoc, increment, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const REVIEWS_COL = "reviews";
const SUGGESTIONS_COL = "suggestions";
const LS_REVIEWS_KEY = "recoup_reviews";
const LS_SUGGESTIONS_KEY = "recoup_suggestions";

function readLS(key) {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function writeLS(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}
function toMillis(createdAt) {
  if (typeof createdAt === "number") return createdAt;
  return createdAt?.toMillis?.() ?? 0;
}
function byRecency(a, b) {
  return toMillis(b.createdAt) - toMillis(a.createdAt);
}

export async function fetchReviews(itemKey, canSyncFirestore) {
  if (!canSyncFirestore) {
    return readLS(LS_REVIEWS_KEY).filter((r) => r.itemKey === itemKey).sort(byRecency);
  }
  const snap = await getDocs(query(collection(db, REVIEWS_COL), where("itemKey", "==", itemKey)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byRecency);
}

export async function addReview(itemKey, itemName, review, canSyncFirestore) {
  if (!canSyncFirestore) {
    const entry = { id: `local_${Date.now()}`, itemKey, itemName, ...review, createdAt: Date.now() };
    writeLS(LS_REVIEWS_KEY, [entry, ...readLS(LS_REVIEWS_KEY)]);
    return entry;
  }
  const ref = await addDoc(collection(db, REVIEWS_COL), { itemKey, itemName, ...review, createdAt: serverTimestamp() });
  return { id: ref.id, itemKey, itemName, ...review, createdAt: Date.now() };
}

export async function fetchSuggestions(destinationId, canSyncFirestore) {
  if (!canSyncFirestore) {
    return readLS(LS_SUGGESTIONS_KEY).filter((s) => s.destinationId === destinationId).sort(byRecency);
  }
  const snap = await getDocs(query(collection(db, SUGGESTIONS_COL), where("destinationId", "==", destinationId)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byRecency);
}

export async function addSuggestion(destinationId, destinationName, suggestion, canSyncFirestore) {
  if (!canSyncFirestore) {
    const entry = { id: `local_${Date.now()}`, destinationId, destinationName, ...suggestion, upvotes: 0, createdAt: Date.now() };
    writeLS(LS_SUGGESTIONS_KEY, [entry, ...readLS(LS_SUGGESTIONS_KEY)]);
    return entry;
  }
  const ref = await addDoc(collection(db, SUGGESTIONS_COL), { destinationId, destinationName, ...suggestion, upvotes: 0, createdAt: serverTimestamp() });
  return { id: ref.id, destinationId, destinationName, ...suggestion, upvotes: 0, createdAt: Date.now() };
}

export async function upvoteSuggestion(suggestionId, canSyncFirestore) {
  if (!canSyncFirestore || suggestionId.startsWith("local_")) {
    const list = readLS(LS_SUGGESTIONS_KEY).map((s) => (s.id === suggestionId ? { ...s, upvotes: (s.upvotes || 0) + 1 } : s));
    writeLS(LS_SUGGESTIONS_KEY, list);
    return;
  }
  await updateDoc(doc(db, SUGGESTIONS_COL, suggestionId), { upvotes: increment(1) });
}

// Resizes an image file client-side and returns a small base64 JPEG data
// URL — keeps review photo attachments well under Firestore's 1MB document
// limit without needing Firebase Storage (a separate Console setup step).
export function resizeImageToDataUrl(file, maxWidth = 400) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => { img.src = reader.result; };
    reader.onerror = reject;
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}
