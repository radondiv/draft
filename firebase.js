// Firebase initialization using CDN ESM modules
// Keys provided by user (Firebase JS SDK v12)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-storage.js";

export const firebaseConfig = {
  apiKey: "AIzaSyBXqVfPkMqqQxNclyyYe0oM9o0eKIM2VwE",
  authDomain: "lr-jails.firebaseapp.com",
  projectId: "lr-jails",
  storageBucket: "lr-jails.firebasestorage.app",
  messagingSenderId: "716098447406",
  appId: "1:716098447406:web:3e21b38cb09772b44e97bf",
  measurementId: "G-M1QVW7SJTQ"
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
}

export async function signOutUser() { return await signOut(auth); }

export function watchAuth(callback) { onAuthStateChanged(auth, callback); }
