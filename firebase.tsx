// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, // API-Key aus .env.local
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
initializeFirestore(app, {
  experimentalAutoDetectLongPolling: false,
  experimentalForceLongPolling: false,
});
const auth = getAuth(app);
const db = initializeFirestore(app, {
  // Inline-Kommentar: Versuche, WebSockets unbedingt zu verwenden
  experimentalForceLongPolling: false,
  experimentalAutoDetectLongPolling: false,
});
const storage = getStorage(app);

export { auth, db, storage, onAuthStateChanged, doc, getDoc, setDoc };
