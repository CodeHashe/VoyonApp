import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCDcCamVCNE0At8o5RPsrvnytOKeqGfmdE",
  authDomain: "voyon-acb5a.firebaseapp.com",
  projectId: "voyon-acb5a",
  storageBucket: "voyon-acb5a.appspot.com",
  messagingSenderId: "344496715328",
  appId: "1:344496715328:web:497270bdca0078fc5851a5",
  measurementId: "G-G0VHZV6JJG",
};

// Check if Firebase app is already initialized
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("🔥 Firebase Initialized:", app.name);
} catch (error) {
  // If Firebase is already initialized, get the existing app
  if (error.code === "app/duplicate-app") {
    console.log("Firebase already initialized, using existing app");
    app = initializeApp();
  } else {
    console.error("Firebase initialization error:", error);
    throw error;
  }
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app;
