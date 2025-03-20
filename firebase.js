import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBy5LqheWcRgmOSpVOxJXJTFSqPzsgQrD0",
  authDomain: "novva-9d5ef.firebaseapp.com",
  projectId: "novva-9d5ef",
  storageBucket: "novva-9d5ef.appspot.com", // ✅ Fixed URL
  messagingSenderId: "749482014758",
  appId: "1:749482014758:web:fe55a05860a0c6171f4ee7"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Setup persistent login with AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
