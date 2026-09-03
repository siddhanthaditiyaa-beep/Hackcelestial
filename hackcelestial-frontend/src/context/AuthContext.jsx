import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const demo = sessionStorage.getItem("recoup_demo_user");
      return demo ? JSON.parse(demo) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const ref = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(ref);
          setUser({ ...firebaseUser, profile: snap.data() || {} });
        } catch {
          setUser(firebaseUser);
        }
      } else {
        const demo = sessionStorage.getItem("recoup_demo_user");
        if (demo) {
          try { setUser(JSON.parse(demo)); } catch { setUser(null); }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Create/update user document in Firestore
  const upsertUser = async (firebaseUser) => {
    try {
      const ref = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || "",
          photoURL: firebaseUser.photoURL || "",
          createdAt: serverTimestamp(),
          bookings: [],
          savedDestinations: [],
        });
      }
    } catch (e) {
      console.warn("Firestore user creation skipped:", e);
    }
  };

  const signInWithGoogle = async () => {
    sessionStorage.removeItem("recoup_demo_user");
    const result = await signInWithPopup(auth, googleProvider);
    await upsertUser(result.user);
    return result.user;
  };

  const signInWithEmail = async (email, password) => {
    sessionStorage.removeItem("recoup_demo_user");
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const signUpWithEmail = async (name, email, password) => {
    sessionStorage.removeItem("recoup_demo_user");
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    await upsertUser({ ...result.user, displayName: name });
    return result.user;
  };

  const signInAsDemo = () => {
    const demoUser = {
      uid: "demo-traveler-888",
      email: "demo@recoup.travel",
      displayName: "Demo Traveler",
      photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80",
      isDemo: true,
    };
    sessionStorage.setItem("recoup_demo_user", JSON.stringify(demoUser));
    setUser(demoUser);
    return demoUser;
  };

  const logout = async () => {
    sessionStorage.removeItem("recoup_demo_user");
    setUser(null);
    try { await signOut(auth); } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
