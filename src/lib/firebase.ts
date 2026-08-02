import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Dummy config สำหรับให้ Vercel บิวด์ผ่าน
const dummyConfig = {
  apiKey: "AIzaSyDummyKeyForVercelPreview12345",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

export const app = initializeApp(dummyConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Mock ฟังก์ชันทั้งหมดที่ไฟล์อื่นเรียกใช้
export const createUserProfileInDb = async (...args: any[]) => { return null; };
export const getUserProfileFromDb = async (...args: any[]) => { return null; };
export const resetPasswordViaEmail = async (...args: any[]) => { return null; };

export default app;
