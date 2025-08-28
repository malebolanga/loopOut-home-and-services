// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "loupeout-home.firebaseapp.com",
  projectId: "loupeout-home",
  storageBucket: "loupeout-home.appspot.com",
  messagingSenderId: "968747879274",
  appId: "1:968747879274:web:d8c7eab0cd90a10dc13313"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);