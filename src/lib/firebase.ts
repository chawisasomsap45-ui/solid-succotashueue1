import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ใส่ค่า dummy ป้องกันไม่ให้ Firebase SDK ร้อง error ตอน initialize
const dummyConfig = {
  apiKey: "AIzaSyDummyKeyForVercelPreview12345",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase ด้วยค่าหลอก
export const app = initializeApp(dummyConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
