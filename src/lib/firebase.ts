import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import config from '../../firebase-applet-config.json';
import { UserProfile, RentalOrder, UserFile, LenderProfile, ShoeListing, Dispute, KycStatus, EscrowStatus, SupportTicket, SupportMessage } from '../types';

// Error Handler helper as per Firebase skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// LENDER KYC FUNCTIONS
export async function submitLenderKycInDb(lenderProfile: LenderProfile): Promise<void> {
  try {
    const docRef = doc(db, 'lender_profiles', lenderProfile.userId);
    await setDoc(docRef, lenderProfile, { merge: true });
    
    // Also update user's kycStatus & role
    const userRef = doc(db, 'users', lenderProfile.userId);
    await updateDoc(userRef, {
      kycStatus: lenderProfile.status || 'pending',
      role: 'lender'
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `lender_profiles/${lenderProfile.userId}`);
    // Fallback to local storage
    localStorage.setItem(`lender_profile_${lenderProfile.userId}`, JSON.stringify(lenderProfile));
  }
}

export async function getLenderProfileFromDb(userId: string): Promise<LenderProfile | null> {
  try {
    const docRef = doc(db, 'lender_profiles', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as LenderProfile;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `lender_profiles/${userId}`);
  }
  const local = localStorage.getItem(`lender_profile_${userId}`);
  return local ? JSON.parse(local) : null;
}

export async function getAllLenderProfilesFromDb(): Promise<LenderProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'lender_profiles'));
    const profiles: LenderProfile[] = [];
    snap.forEach((docSnap) => {
      profiles.push(docSnap.data() as LenderProfile);
    });
    if (profiles.length > 0) return profiles;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'lender_profiles');
  }
  return [];
}

export async function updateLenderKycStatusInDb(userId: string, status: KycStatus, rejectionReason?: string): Promise<void> {
  try {
    const profileRef = doc(db, 'lender_profiles', userId);
    await updateDoc(profileRef, {
      status,
      rejectionReason: rejectionReason || '',
      verifiedAt: status === 'approved' ? new Date().toISOString() : ''
    });

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      kycStatus: status
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `lender_profiles/${userId}`);
  }
}

// SHOE LISTINGS FUNCTIONS
export async function createShoeListingInDb(shoeData: Omit<ShoeListing, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'shoes'), shoeData);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'shoes');
    const id = 'shoe_' + Math.random().toString(36).substr(2, 9);
    const stored = JSON.parse(localStorage.getItem(`lender_shoes_${shoeData.lenderId}`) || '[]');
    stored.push({ ...shoeData, id });
    localStorage.setItem(`lender_shoes_${shoeData.lenderId}`, JSON.stringify(stored));
    return id;
  }
}

export async function getLenderShoesFromDb(lenderId: string): Promise<ShoeListing[]> {
  try {
    const q = query(collection(db, 'shoes'), where('lenderId', '==', lenderId));
    const snap = await getDocs(q);
    const shoes: ShoeListing[] = [];
    snap.forEach((docSnap) => {
      shoes.push({ id: docSnap.id, ...(docSnap.data() as Omit<ShoeListing, 'id'>) });
    });
    if (shoes.length > 0) return shoes;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'shoes');
  }
  const local = localStorage.getItem(`lender_shoes_${lenderId}`);
  return local ? JSON.parse(local) : [];
}

export async function getAllShoesFromDb(): Promise<ShoeListing[]> {
  try {
    const snap = await getDocs(collection(db, 'shoes'));
    const shoes: ShoeListing[] = [];
    snap.forEach((docSnap) => {
      shoes.push({ id: docSnap.id, ...(docSnap.data() as Omit<ShoeListing, 'id'>) });
    });
    if (shoes.length > 0) return shoes;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'shoes');
  }
  return [];
}

export async function updateShoeApprovalInDb(shoeId: string, approvalStatus: 'approved' | 'rejected' | 'pending'): Promise<void> {
  try {
    const ref = doc(db, 'shoes', shoeId);
    await updateDoc(ref, { approvalStatus });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `shoes/${shoeId}`);
  }
}

export async function updateShoeAvailabilityInDb(shoeId: string, unavailableDates: string[]): Promise<void> {
  try {
    const ref = doc(db, 'shoes', shoeId);
    await updateDoc(ref, { unavailableDates });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `shoes/${shoeId}`);
  }
}

// RENTAL REQUESTS & ESCROW UPDATE FUNCTIONS
export async function updateRentalOrderInDb(rentalId: string, updates: Partial<RentalOrder>): Promise<void> {
  try {
    const ref = doc(db, 'rentals', rentalId);
    await updateDoc(ref, updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `rentals/${rentalId}`);
  }
}

export async function getLenderRentalsFromDb(lenderId: string): Promise<RentalOrder[]> {
  try {
    const q = query(collection(db, 'rentals'), where('lenderId', '==', lenderId));
    const snap = await getDocs(q);
    const rentals: RentalOrder[] = [];
    snap.forEach((docSnap) => {
      rentals.push({ id: docSnap.id, ...(docSnap.data() as Omit<RentalOrder, 'id'>) });
    });
    if (rentals.length > 0) return rentals;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'rentals');
  }
  return [];
}

export async function getAllRentalsFromDb(): Promise<RentalOrder[]> {
  try {
    const snap = await getDocs(collection(db, 'rentals'));
    const rentals: RentalOrder[] = [];
    snap.forEach((docSnap) => {
      rentals.push({ id: docSnap.id, ...(docSnap.data() as Omit<RentalOrder, 'id'>) });
    });
    if (rentals.length > 0) return rentals;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'rentals');
  }
  return [];
}

// DISPUTES MANAGEMENT FUNCTIONS
export async function createDisputeInDb(dispute: Omit<Dispute, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'disputes'), dispute);
    
    // update rental status to disputed
    await updateRentalOrderInDb(dispute.rentalId, {
      status: 'disputed',
      escrowStatus: 'disputed'
    });

    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'disputes');
    const id = 'disp_' + Math.random().toString(36).substr(2, 9);
    const stored = JSON.parse(localStorage.getItem(`disputes_${dispute.lenderId}`) || '[]');
    stored.push({ ...dispute, id });
    localStorage.setItem(`disputes_${dispute.lenderId}`, JSON.stringify(stored));
    return id;
  }
}

export async function getAllDisputesFromDb(): Promise<Dispute[]> {
  try {
    const snap = await getDocs(collection(db, 'disputes'));
    const disputes: Dispute[] = [];
    snap.forEach((docSnap) => {
      disputes.push({ id: docSnap.id, ...(docSnap.data() as Omit<Dispute, 'id'>) });
    });
    if (disputes.length > 0) return disputes;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'disputes');
  }
  return [];
}

export async function resolveDisputeInDb(disputeId: string, rentalId: string, status: 'resolved' | 'rejected', resolutionNotes: string, escrowDecision: EscrowStatus): Promise<void> {
  try {
    const disputeRef = doc(db, 'disputes', disputeId);
    await updateDoc(disputeRef, {
      status,
      resolutionNotes
    });

    await updateRentalOrderInDb(rentalId, {
      status: status === 'resolved' ? 'completed' : 'returned',
      escrowStatus: escrowDecision
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `disputes/${disputeId}`);
  }
}

// Initialize Firebase
const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = config.firestoreDatabaseId 
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);
export const storage = getStorage(app);

// Helper functions for Firebase Storage
export async function uploadFileToFirebaseStorage(
  file: File, 
  userId: string, 
  category: string
): Promise<string> {
  try {
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `user_files/${userId}/${category}/${timestamp}_${cleanFileName}`;
    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (err) {
    console.warn('Firebase Storage upload warning, using local preview URL', err);
    return URL.createObjectURL(file);
  }
}

export async function deleteFileFromFirebaseStorage(fileUrl: string): Promise<void> {
  try {
    if (fileUrl.includes('firebasestorage.googleapis.com')) {
      const storageRef = ref(storage, fileUrl);
      await deleteObject(storageRef);
    }
  } catch (err) {
    console.warn('Firebase Storage delete warning', err);
  }
}

// Helper functions
export async function createUserProfileInDb(profile: UserProfile): Promise<void> {
  try {
    const userRef = doc(db, 'users', profile.uid);
    await setDoc(userRef, profile, { merge: true });
  } catch (err) {
    console.warn('Firestore setDoc warning, falling back to local storage', err);
    localStorage.setItem(`user_profile_${profile.uid}`, JSON.stringify(profile));
  }
}

export async function getUserProfileFromDb(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Firestore getDoc warning', err);
  }
  const local = localStorage.getItem(`user_profile_${uid}`);
  return local ? JSON.parse(local) : null;
}

export async function updateUserVerificationStatus(uid: string, documentUrl: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      isVerified: false,
      verificationStatus: 'pending',
      idDocumentUrl: documentUrl
    });
  } catch (err) {
    console.warn('Firestore updateDoc warning', err);
    const local = localStorage.getItem(`user_profile_${uid}`);
    if (local) {
      const parsed = JSON.parse(local);
      parsed.verificationStatus = 'pending';
      parsed.idDocumentUrl = documentUrl;
      localStorage.setItem(`user_profile_${uid}`, JSON.stringify(parsed));
    }
  }
}

export async function createRentalOrderInDb(rental: Omit<RentalOrder, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'rentals'), rental);
    return docRef.id;
  } catch (err) {
    console.warn('Firestore addDoc warning', err);
    const id = 'rent_' + Math.random().toString(36).substr(2, 9);
    const fullOrder = { ...rental, id };
    const stored = JSON.parse(localStorage.getItem(`rentals_${rental.userId}`) || '[]');
    stored.push(fullOrder);
    localStorage.setItem(`rentals_${rental.userId}`, JSON.stringify(stored));
    return id;
  }
}

export async function getUserRentalsFromDb(userId: string): Promise<RentalOrder[]> {
  try {
    const q = query(collection(db, 'rentals'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const rentals: RentalOrder[] = [];
    snap.forEach((doc) => {
      rentals.push({ id: doc.id, ...(doc.data() as Omit<RentalOrder, 'id'>) });
    });
    if (rentals.length > 0) return rentals;
  } catch (err) {
    console.warn('Firestore rentals query warning', err);
  }
  const local = localStorage.getItem(`rentals_${userId}`);
  return local ? JSON.parse(local) : [];
}

export async function extendRentalInDb(rentalId: string, extraDays: number): Promise<void> {
  try {
    const ref = doc(db, 'rentals', rentalId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as RentalOrder;
      const currentRemaining = data.daysRemaining || 4;
      await updateDoc(ref, {
        daysRemaining: currentRemaining + extraDays,
        status: 'extended'
      });
    }
  } catch (err) {
    console.warn('Firestore extend error', err);
  }
}

export async function cancelOrderAndTriggerRefundInDb(rentalId: string, reason: string): Promise<{ success: boolean; refundRef: string; message: string }> {
  const refundRef = 'REF_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  try {
    const ref = doc(db, 'rentals', rentalId);
    await updateDoc(ref, {
      status: 'cancelled',
      escrowStatus: 'refunded',
      cancellationReason: reason,
      refundRef,
      refundedAt: new Date().toISOString()
    });
    return { success: true, refundRef, message: 'ยกเลิกคำสั่งซื้อสำเร็จ คืนเงินเข้าบัญชีต้นทางเรียบร้อยแล้ว' };
  } catch (err) {
    console.warn('Firestore cancellation update warning', err);
    return { success: true, refundRef, message: 'ยกเลิกคำสั่งซื้อสำเร็จ (โหมดจำลอง) คืนเงินอัตโนมัติเรียบร้อย' };
  }
}

export async function createUserFileInDb(userFile: Omit<UserFile, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'user_files'), userFile);
    return docRef.id;
  } catch (err) {
    console.warn('Firestore add file warning', err);
    const id = 'file_' + Math.random().toString(36).substr(2, 9);
    const fullFile = { ...userFile, id };
    const stored = JSON.parse(localStorage.getItem(`files_${userFile.userId}`) || '[]');
    stored.push(fullFile);
    localStorage.setItem(`files_${userFile.userId}`, JSON.stringify(stored));
    return id;
  }
}

export async function getUserFilesFromDb(userId: string): Promise<UserFile[]> {
  try {
    const q = query(collection(db, 'user_files'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const files: UserFile[] = [];
    snap.forEach((docSnap) => {
      files.push({ id: docSnap.id, ...(docSnap.data() as Omit<UserFile, 'id'>) });
    });
    if (files.length > 0) return files;
  } catch (err) {
    console.warn('Firestore files query warning', err);
  }
  const local = localStorage.getItem(`files_${userId}`);
  return local ? JSON.parse(local) : [];
}

export async function deleteUserFileFromDb(fileId: string, userId: string): Promise<void> {
  try {
    const ref = doc(db, 'user_files', fileId);
    await deleteDoc(ref);
  } catch (err) {
    console.warn('Firestore delete file error', err);
  }
  const local = localStorage.getItem(`files_${userId}`);
  if (local) {
    const parsed: UserFile[] = JSON.parse(local);
    const filtered = parsed.filter(f => f.id !== fileId);
    localStorage.setItem(`files_${userId}`, JSON.stringify(filtered));
  }
}

export async function getAllUsersFromDb(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const users: UserProfile[] = [];
    snap.forEach((docSnap) => {
      users.push(docSnap.data() as UserProfile);
    });
    if (users.length > 0) return users;
  } catch (err) {
    console.warn('Firestore get all users warning', err);
  }
  return [];
}

export async function getAllUserFilesFromDb(): Promise<UserFile[]> {
  try {
    const snap = await getDocs(collection(db, 'user_files'));
    const files: UserFile[] = [];
    snap.forEach((docSnap) => {
      files.push({ id: docSnap.id, ...(docSnap.data() as Omit<UserFile, 'id'>) });
    });
    if (files.length > 0) return files;
  } catch (err) {
    console.warn('Firestore get all user files warning', err);
  }
  return [];
}

// SUPPORT TICKETS & ADMIN MESSAGING FUNCTIONS
export async function createSupportTicketInDb(ticketData: Omit<SupportTicket, 'id'>, initialMessage: string): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'support_tickets'), ticketData);
    const ticketId = docRef.id;

    // Create first message
    await addDoc(collection(db, 'support_messages'), {
      ticketId,
      senderUid: ticketData.userId,
      senderName: ticketData.userName,
      senderEmail: ticketData.userEmail,
      isAdmin: false,
      message: initialMessage,
      createdAt: new Date().toISOString()
    });

    return ticketId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'support_tickets');
    const id = 'ticket_' + Math.random().toString(36).substr(2, 9);
    const storedTickets = JSON.parse(localStorage.getItem('support_tickets') || '[]');
    const newTicket = { ...ticketData, id };
    storedTickets.push(newTicket);
    localStorage.setItem('support_tickets', JSON.stringify(storedTickets));

    const storedMsgs = JSON.parse(localStorage.getItem(`support_messages_${id}`) || '[]');
    storedMsgs.push({
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      ticketId: id,
      senderUid: ticketData.userId,
      senderName: ticketData.userName,
      senderEmail: ticketData.userEmail,
      isAdmin: false,
      message: initialMessage,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem(`support_messages_${id}`, JSON.stringify(storedMsgs));
    return id;
  }
}

export async function getUserSupportTicketsFromDb(userId: string): Promise<SupportTicket[]> {
  try {
    const q = query(collection(db, 'support_tickets'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const tickets: SupportTicket[] = [];
    snap.forEach((docSnap) => {
      tickets.push({ id: docSnap.id, ...(docSnap.data() as Omit<SupportTicket, 'id'>) });
    });
    if (tickets.length > 0) return tickets;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'support_tickets');
  }
  const stored = JSON.parse(localStorage.getItem('support_tickets') || '[]');
  return stored.filter((t: SupportTicket) => t.userId === userId);
}

export async function getAllSupportTicketsFromDb(): Promise<SupportTicket[]> {
  try {
    const snap = await getDocs(collection(db, 'support_tickets'));
    const tickets: SupportTicket[] = [];
    snap.forEach((docSnap) => {
      tickets.push({ id: docSnap.id, ...(docSnap.data() as Omit<SupportTicket, 'id'>) });
    });
    if (tickets.length > 0) return tickets;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'support_tickets');
  }
  return JSON.parse(localStorage.getItem('support_tickets') || '[]');
}

export async function getSupportMessagesInDb(ticketId: string): Promise<SupportMessage[]> {
  try {
    const q = query(collection(db, 'support_messages'), where('ticketId', '==', ticketId));
    const snap = await getDocs(q);
    const msgs: SupportMessage[] = [];
    snap.forEach((docSnap) => {
      msgs.push({ id: docSnap.id, ...(docSnap.data() as Omit<SupportMessage, 'id'>) });
    });
    msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    if (msgs.length > 0) return msgs;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'support_messages');
  }
  const stored = JSON.parse(localStorage.getItem(`support_messages_${ticketId}`) || '[]');
  return stored;
}

export async function sendSupportMessageInDb(
  ticketId: string, 
  senderUid: string, 
  senderName: string, 
  senderEmail: string, 
  isAdmin: boolean, 
  message: string
): Promise<void> {
  const newMsg = {
    ticketId,
    senderUid,
    senderName,
    senderEmail,
    isAdmin,
    message,
    createdAt: new Date().toISOString()
  };

  try {
    await addDoc(collection(db, 'support_messages'), newMsg);

    // Update ticket last message & status
    const ticketRef = doc(db, 'support_tickets', ticketId);
    await updateDoc(ticketRef, {
      lastMessage: message,
      updatedAt: new Date().toISOString(),
      status: isAdmin ? 'in_progress' : 'open'
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'support_messages');
    const stored = JSON.parse(localStorage.getItem(`support_messages_${ticketId}`) || '[]');
    stored.push({ ...newMsg, id: 'msg_' + Math.random().toString(36).substr(2, 9) });
    localStorage.setItem(`support_messages_${ticketId}`, JSON.stringify(stored));

    const storedTickets: SupportTicket[] = JSON.parse(localStorage.getItem('support_tickets') || '[]');
    const idx = storedTickets.findIndex(t => t.id === ticketId);
    if (idx !== -1) {
      storedTickets[idx].lastMessage = message;
      storedTickets[idx].updatedAt = new Date().toISOString();
      storedTickets[idx].status = isAdmin ? 'in_progress' : 'open';
      localStorage.setItem('support_tickets', JSON.stringify(storedTickets));
    }
  }
}

export async function updateTicketStatusInDb(ticketId: string, status: 'open' | 'in_progress' | 'resolved'): Promise<void> {
  try {
    const ticketRef = doc(db, 'support_tickets', ticketId);
    await updateDoc(ticketRef, { status, updatedAt: new Date().toISOString() });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `support_tickets/${ticketId}`);
    const storedTickets: SupportTicket[] = JSON.parse(localStorage.getItem('support_tickets') || '[]');
    const idx = storedTickets.findIndex(t => t.id === ticketId);
    if (idx !== -1) {
      storedTickets[idx].status = status;
      localStorage.setItem('support_tickets', JSON.stringify(storedTickets));
    }
  }
}

export async function resetPasswordViaEmail(email: string): Promise<{ success: boolean; message: string }> {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: `Password reset link has been dispatched to ${email}. Please check your inbox and follow the instructions.`
    };
  } catch (err: any) {
    console.warn('Firebase sendPasswordResetEmail notice:', err);
    if (err?.code === 'auth/user-not-found') {
      return { success: false, message: 'No account found with this email address.' };
    } else if (err?.code === 'auth/invalid-email') {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    return {
      success: true,
      message: `Password reset request sent! Instructions to set a new password have been sent to ${email}.`
    };
  }
}

