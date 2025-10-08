import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Optional: only load analytics if it's supported (web only)
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAAFTCjjZYFdS7QJ98342jWh3qkQrLp-mg",
  authDomain: "keshflow-web-app.firebaseapp.com",
  projectId: "keshflow-web-app",
  storageBucket: "keshflow-web-app.firebasestorage.app",
  messagingSenderId: "781964994617",
  appId: "1:781964994617:web:f848cd98ba29c2c73f05e8",
  measurementId: "G-L85430LECF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Optional analytics (works only in web builds)
isSupported().then((yes) => {
  if (yes) {
    getAnalytics(app);
  }
});

// Export main Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
