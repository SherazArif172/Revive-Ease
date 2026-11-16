// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

// Conditionally initialize messaging only if browser supports it
// iOS Safari and some browsers don't support Firebase Messaging
let messaging = null;
try {
  // Check if we're in a browser environment and if required APIs are available
  if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
    messaging = getMessaging(app);
  } else {
    console.warn("Firebase Messaging is not supported in this browser");
  }
} catch (error) {
  console.warn("Firebase Messaging initialization failed:", error.message);
  messaging = null;
}

export { db, messaging };
