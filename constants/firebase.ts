// firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: 'AIzaSyAdW0g4yIPJIPc41YWJfUzcwe9yGuel6I8',
  authDomain: 'kiloai-bfbff.firebaseapp.com',
  projectId: 'kiloai-bfbff',
  storageBucket: 'kiloai-bfbff.appspot.com',
  messagingSenderId: '569468660678',
  appId: '1:569468660678:web:7d00581fd4d3a7923c20c7',
  measurementId: 'G-M200J29VKT',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
