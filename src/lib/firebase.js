import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCbTbK_t04hnW1AUm21RddQY9dS8yRNqbM",
  authDomain: "ads-website-genesis.firebaseapp.com",
  projectId: "ads-website-genesis",
  storageBucket: "ads-website-genesis.firebasestorage.app",
  messagingSenderId: "326489979410",
  appId: "1:326489979410:web:9d424c3457129d4d1bb6cb",
  measurementId: "G-Y7FVSTJ1ZS"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);