// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMF4BW6PA0887oPPVda_j1vmpYIHth-rg",
  authDomain: "central-cinema-218106.firebaseapp.com",
  databaseURL: "https://central-cinema-218106.firebaseio.com",
  projectId: "central-cinema-218106",
  storageBucket: "central-cinema-218106.firebasestorage.app",
  messagingSenderId: "828543108648",
  appId: "1:828543108648:web:54ac7894d1fb93d001971d",
  measurementId: "G-HJDZELETYT"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const db = getFirestore(app);