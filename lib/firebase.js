import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBeQ9zNaX7jzbXH5sh540BaCjSDDBtclLc",
  authDomain: "helloquip-80e20.firebaseapp.com",
  projectId: "helloquip-80e20",
  storageBucket: "helloquip-80e20.firebasestorage.app",
  messagingSenderId: "965108624313",
  appId: "1:965108624313:web:3eddc0e81340def539e468",
  measurementId: "G-JPHHJT50QC"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Initialize messaging only on the client side (browser)
const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export { app, db, storage, auth, messaging };
