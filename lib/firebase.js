import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";  // <-- add this
import { getAuth } from "firebase/auth"; // ✅ this line was missing

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
const storage = getStorage(app);  // <-- initialize storage


const auth = getAuth(app); // ✅ initialize auth


export { app, db, storage, auth };  // <-- export both


