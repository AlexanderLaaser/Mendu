// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, onAuthStateChanged, doc, getDoc, setDoc };
