// src/integrations/firebase/client.ts

import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth'; // Import Auth service
import { getFirestore } from 'firebase/firestore'; // Import Firestore service
import { getFunctions } from 'firebase/functions'; // Import Functions service

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAMUbSCfl3RDYwDoQe1sBFvEdLxGcD2aIc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smaranai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "smaranai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "smaranai.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "940718167808",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:940718167808:web:79ec5692bb1e62504ac5e5",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XQYH02SDBX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get service instances
export const storage = getStorage(app);
export const auth = getAuth(app); // Export Auth service
export const db = getFirestore(app); // Export Firestore service
export const functions = getFunctions(app); // Export Functions service

// You can export other services if needed later
