import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCDcCamVCNE0At8o5RPsrvnytOKeqGfmdE",
    authDomain: "voyon-acb5a.firebaseapp.com",
    projectId: "voyon-acb5a",
    storageBucket: "voyon-acb5a.firebasestorage.app",
    messagingSenderId: "344496715328",
    appId: "1:344496715328:web:497270bdca0078fc5851a5",
    measurementId: "G-G0VHZV6JJG"
  };


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

console.log("🔥 Firebase Initialized:", app.name);

export { auth };
