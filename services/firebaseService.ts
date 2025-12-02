import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuration provided in the prompt
const firebaseConfig = {
  apiKey: "AIzaSyB1JZxhlMGxBeR6t417NPQ4VfyaYbxoXSY",
  authDomain: "villageshow-backend.firebaseapp.com",
  projectId: "villageshow-backend",
  storageBucket: "villageshow-backend.firebasestorage.app",
  messagingSenderId: "1050127581160",
  appId: "1:1050127581160:web:e7e552e45fd4641fb36e5d"
};

let app;
let auth: any;
let db: any;
let storage: any;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log("🔥 Firebase initialized:", firebaseConfig.projectId);
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export { auth, db, storage };