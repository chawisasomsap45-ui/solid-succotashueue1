import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// นำเข้าไฟล์ config จากโฟลเดอร์เดียวกัน (./)
import appletConfig from './firebase-applet-config.json';

const dummyConfig = {
  apiKey: "AIzaSyDummyKeyForVercelPreview12345",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  ...appletConfig
};

export const app = initializeApp(dummyConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Mock ฟังก์ชันกันแครช
export const createUserProfileInDb = async (...args: any[]) => { return null; };
export const getUserProfileFromDb = async (...args: any[]) => { return null; };
export const resetPasswordViaEmail = async (...args: any[]) => { return null; };

export default app;
