// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCiGu_0_91mSDlqNpy9S3qVP44IdMwDlp4",
  authDomain: "signsync-e53e0.firebaseapp.com",
  projectId: "signsync-e53e0",
  storageBucket: "signsync-e53e0.firebasestorage.app",
  messagingSenderId: "315437917985",
  appId: "1:315437917985:web:7188e1ec95162fd1478060",
  measurementId: "G-46H6V45WRJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
export const provider = new GoogleAuthProvider();


export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("User signed in:", result.user);
  } catch (error) {
    console.error(error);
  }
};
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error) {
    console.error(error);
  }
};

export { auth };