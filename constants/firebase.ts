// firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyAdW0g4yIPJIPc41YWJfUzcwe9yGuel6I8",
  authDomain: "kiloai-bfbff.firebaseapp.com",
  projectId: "kiloai-bfbff",
  storageBucket: "kiloai-bfbff.appspot.com",
  messagingSenderId: "569468660678",
  appId: "1:569468660678:web:7d00581fd4d3a7923c20c7",
  measurementId: "G-M200J29VKT",
};

// Initialize Firebase app only once
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// In-memory auth (no AsyncStorage, no persistence)
export const auth = getAuth(app);

// Firestore
export const db = getFirestore(app);
