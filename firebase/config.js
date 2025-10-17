
// firebaseConfig.js

// Imported functions
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

//  web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFUFA8KT0fK20Pr-vyw67nKlFBh7Jolvg",
  authDomain: "keshflow-1bcc7.firebaseapp.com",
  projectId: "keshflow-1bcc7",
  storageBucket: "keshflow-1bcc7.appspot.com",  // correct format
  messagingSenderId: "146775562351",
  appId: "1:146775562351:web:3022c865fc6dc0535c159a",
  measurementId: "G-RQE56XEFQ7"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Optional: Initialize Analytics
const analytics = getAnalytics(app);

// Initialize Firebase services
const db = getFirestore(app);        // Firestore
const auth = getAuth(app);           // Firebase Authentication
const storage = getStorage(app);     // Firebase Storage

// Export for use in other parts of your app
export { app, analytics, db, auth, storage };
