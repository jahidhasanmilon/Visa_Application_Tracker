import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase web config — this is safe to keep in client code.
// Real protection comes from Firestore security rules (see firestore.rules),
// not from hiding this object.
const firebaseConfig = {
  apiKey: 'AIzaSyDYOlSu6lrLX5n6ttY2BYUeLNMQf7hlS44',
  authDomain: 'opportunity-card.firebaseapp.com',
  projectId: 'opportunity-card',
  storageBucket: 'opportunity-card.firebasestorage.app',
  messagingSenderId: '805003694923',
  appId: '1:805003694923:web:d5f27af8e1baa2c913cece',
  measurementId: 'G-MKM9WB5DHY',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
