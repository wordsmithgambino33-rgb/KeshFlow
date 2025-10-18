//firebase/config.js

// Import the core Firebase SDK and required services
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBi8gXy5Vgl2ioGl0RIkk7eMECgLNkj5XE",
  authDomain: "keshflow-e033a.firebaseapp.com",
  projectId: "keshflow-e033a",
  storageBucket: "keshflow-e033a.appspot.com", // ✅ fixed .app to .appspot.com
  messagingSenderId: "433232152835",
  appId: "1:433232152835:web:2cba760d0b0f3a239b4136",
  measurementId: "G-Q35G5GRSX6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics only if supported (avoids browser errors)
let analytics;
isSupported().then((yes) => {
  if (yes) analytics = getAnalytics(app);
});

// Export for use in your app
export { app, auth, db, storage, analytics };
