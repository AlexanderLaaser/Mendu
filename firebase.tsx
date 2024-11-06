// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAd8eiwPfJ586R_X06VQT-nayZEYpphfJU",
  authDomain: "bewerberplattform.firebaseapp.com",
  projectId: "bewerberplattform",
  storageBucket: "bewerberplattform.firebasestorage.app",
  messagingSenderId: "459107193100",
  appId: "1:459107193100:web:6acf2d84dae1cba1b13929",
  measurementId: "G-WJDKHTKRT8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
