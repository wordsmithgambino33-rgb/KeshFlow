
// src/firebase/config.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBi8gXy5Vgl2ioGl0RIkk7eMECgLNkj5XE",
  authDomain: "keshflow-e033a.firebaseapp.com",
  projectId: "keshflow-e033a",
  storageBucket: "keshflow-e033a.appspot.com",
  messagingSenderId: "433232152835",
  appId: "1:433232152835:web:2cba760d0b0f3a239b4136",
  measurementId: "G-Q35G5GRSX6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics only if supported
export let analytics: ReturnType<typeof getAnalytics> | null = null;
isSupported().then((yes) => {
  if (yes) analytics = getAnalytics(app);
});
