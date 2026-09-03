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

  const addBooking = async (booking) => {
    const newBooking = { ...booking, id: Date.now().toString(), bookedAt: new Date().toISOString() };
    const updated = [newBooking, ...confirmedBookings];
    setConfirmedBookings(updated);
    localStorage.setItem("recoup_bookings", JSON.stringify(updated));

    // Also persist to Firestore if logged in
    if (user?.uid) {
      try {
        const ref = doc(db, "users", user.uid);
        await updateDoc(ref, { bookings: arrayUnion(newBooking) });
      } catch (e) { console.warn("Firestore write failed, stored locally", e); }
    }
    return newBooking;
  };

  const removeBooking = async (bookingId) => {
    const removed = confirmedBookings.find(b => b.id === bookingId);
    const updated = confirmedBookings.filter(b => b.id !== bookingId);
    setConfirmedBookings(updated);
    localStorage.setItem("recoup_bookings", JSON.stringify(updated));

    if (user?.uid && removed) {
      try {
        const ref = doc(db, "users", user.uid);
        await updateDoc(ref, { bookings: arrayRemove(removed) });
      } catch (e) { console.warn("Firestore removal failed, removed locally", e); }
    }
  };

  const toggleSaved = async (destId) => {
    const isSaved = savedDestinations.includes(destId);
    const updated = isSaved
      ? savedDestinations.filter(id => id !== destId)
      : [...savedDestinations, destId];
    setSavedDestinations(updated);
    localStorage.setItem("recoup_saved", JSON.stringify(updated));
  };

  return (
    <BookingContext.Provider value={{ confirmedBookings, savedDestinations, addBooking, removeBooking, toggleSaved }}>
      {children}
    </BookingContext.Provider>
  );
}

export const useBooking = () => useContext(BookingContext);
