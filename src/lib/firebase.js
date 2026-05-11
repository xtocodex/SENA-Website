import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCscFIlUxTIMM3FgLqFfD2jHd-MLk_65zo",
  authDomain: "brand-advertisement-website.firebaseapp.com",
  projectId: "brand-advertisement-website",
  storageBucket: "brand-advertisement-website.firebasestorage.app",
  messagingSenderId: "293320927574",
  appId: "1:293320927574:web:d0a0c25429c6161754cef7",
  measurementId: "G-Y2XDC702J7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
