import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDzFxfouUSn3628WcqPUGSYUHis7aaz2uY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mediliv-b6e84.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mediliv-b6e84',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mediliv-b6e84.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '358415482175',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
