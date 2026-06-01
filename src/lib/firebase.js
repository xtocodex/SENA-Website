import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDA_Ge9JNtIIQOH4jJ99ll-vRcNb4Llfwc",
  authDomain: "crucial-summer-456605-p8.firebaseapp.com",
  projectId: "crucial-summer-456605-p8",
  storageBucket: "crucial-summer-456605-p8.firebasestorage.app",
  messagingSenderId: "332405485338",
  appId: "1:332405485338:web:42b32a4ffc90827ccd46a3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
