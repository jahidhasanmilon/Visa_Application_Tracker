import { collection, doc, deleteDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const ADMINS_COL = 'admins';

// Doc id = lowercase email; content is just a marker (see firestore.rules'
// isAdminEmail(), which checks doc existence, not content).
export function subscribeAdmins(onData: (emails: string[]) => void): () => void {
  return onSnapshot(collection(db, ADMINS_COL), (snap) => {
    onData(snap.docs.map(d => d.id).sort());
  });
}

// Used by useAuth to resolve the signed-in user's own role live.
export function subscribeIsAdmin(email: string, onData: (isAdmin: boolean) => void): () => void {
  return onSnapshot(doc(db, ADMINS_COL, email.toLowerCase()), (snap) => onData(snap.exists()));
}

export async function addAdmin(email: string): Promise<void> {
  await setDoc(doc(db, ADMINS_COL, email.toLowerCase()), { addedAt: serverTimestamp() });
}

export async function removeAdmin(email: string): Promise<void> {
  await deleteDoc(doc(db, ADMINS_COL, email.toLowerCase()));
}
