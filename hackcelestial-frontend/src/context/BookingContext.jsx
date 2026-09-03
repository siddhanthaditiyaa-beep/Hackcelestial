import { createContext, useContext, useState } from "react";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const { user } = useAuth();
  const [confirmedBookings, setConfirmedBookings] = useState(() => {
    try { return JSON.parse(localStorage.getItem("recoup_bookings") || "[]"); } catch { return []; }
  });
  const [savedDestinations, setSavedDestinations] = useState(() => {
    try { return JSON.parse(localStorage.getItem("recoup_saved") || "[]"); } catch { return []; }
  });

  // The demo account (AuthContext's signInAsDemo) has a fake uid and no real
  // Firebase Auth session — Firestore writes for it are rejected by security
  // rules and, worse, can hang indefinitely under offline persistence rather
  // than rejecting promptly. Never attempt Firestore sync for it.
  const canSyncFirestore = !!user?.uid && !user?.isDemo;

  // All mutations use the functional setState form so concurrent calls
  // (e.g. Promise.all-ing several addBooking calls for a bundle checkout)
  // don't race on a stale closure of confirmedBookings and clobber each other.

  const addBooking = async (booking) => {
    const newBooking = { ...booking, id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, bookedAt: new Date().toISOString() };
    setConfirmedBookings((prev) => {
      const updated = [newBooking, ...prev];
      localStorage.setItem("recoup_bookings", JSON.stringify(updated));
      return updated;
    });

    if (canSyncFirestore) {
      try {
        const ref = doc(db, "users", user.uid);
        await updateDoc(ref, { bookings: arrayUnion(newBooking) });
      } catch (e) { console.warn("Firestore write failed, stored locally", e); }
    }
    return newBooking;
  };

  const removeBooking = async (bookingId) => {
    const removed = confirmedBookings.find(b => b.id === bookingId) || null;
    setConfirmedBookings((prev) => {
      const updated = prev.filter(b => b.id !== bookingId);
      localStorage.setItem("recoup_bookings", JSON.stringify(updated));
      return updated;
    });

    if (canSyncFirestore && removed) {
      try {
        const ref = doc(db, "users", user.uid);
        await updateDoc(ref, { bookings: arrayRemove(removed) });
      } catch (e) { console.warn("Firestore removal failed, removed locally", e); }
    }
  };

  const updateBooking = async (bookingId, patch) => {
    const existing = confirmedBookings.find(b => b.id === bookingId) || null;
    if (!existing) return;
    const updatedBooking = { ...existing, ...patch };

    setConfirmedBookings((prev) => {
      const updated = prev.map(b => b.id === bookingId ? { ...b, ...patch } : b);
      localStorage.setItem("recoup_bookings", JSON.stringify(updated));
      return updated;
    });

    if (canSyncFirestore) {
      try {
        const ref = doc(db, "users", user.uid);
        await updateDoc(ref, { bookings: arrayRemove(existing) });
        await updateDoc(ref, { bookings: arrayUnion(updatedBooking) });
      } catch (e) { console.warn("Firestore update failed, updated locally", e); }
    }
    return updatedBooking;
  };

  const toggleSaved = async (destId) => {
    setSavedDestinations((prev) => {
      const isSaved = prev.includes(destId);
      const updated = isSaved ? prev.filter(id => id !== destId) : [...prev, destId];
      localStorage.setItem("recoup_saved", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <BookingContext.Provider value={{ confirmedBookings, savedDestinations, addBooking, removeBooking, updateBooking, toggleSaved }}>
      {children}
    </BookingContext.Provider>
  );
}

export const useBooking = () => useContext(BookingContext);
