// client/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config with fallback values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCiGu_0_91mSDlqNpy9S3qVP44IdMwDlp4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "signsync-e53e0.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "signsync-e53e0",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "signsync-e53e0.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "315437917985",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:315437917985:web:7188e1ec95162fd1478060",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-46H6V45WRJ",
};

// Initialize Firebase
let app;
let auth;
let db;
let provider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
  db = getFirestore(app);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Create dummy auth object to prevent app crash
  auth = null;
  provider = null;
  db = null;
}

export { auth, provider, db };

export const signInWithGoogle = async () => {
  if (!auth || !provider) {
    throw new Error("Firebase not initialized properly");
  }
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("User signed in:", result.user.email);
    return result;
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
};

export const logout = async () => {
  if (!auth) {
    throw new Error("Firebase not initialized properly");
  }
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};