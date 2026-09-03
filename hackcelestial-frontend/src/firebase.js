import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyARAoOJel3bVbtE4bqI94QC89wgmCrypbw",
  authDomain: "hackcelestial-6fa70.firebaseapp.com",
  projectId: "hackcelestial-6fa70",
  storageBucket: "hackcelestial-6fa70.firebasestorage.app",
  messagingSenderId: "732830137615",
  appId: "1:732830137615:web:381b980854ccb868c5527a",
  measurementId: "G-QC0R1GE9YD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
