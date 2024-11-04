// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
