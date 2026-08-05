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

// Used by useAuth to resolve the signed-in user's own role live. On error
// (shouldn't happen — see the `allow get` rule for this collection — but if
// it ever does) fail safe to "not admin" rather than hanging on a loading
// screen forever.
export function subscribeIsAdmin(email: string, onData: (isAdmin: boolean) => void): () => void {
  return onSnapshot(
    doc(db, ADMINS_COL, email.toLowerCase()),
    (snap) => onData(snap.exists()),
    (err) => { console.error('subscribeIsAdmin failed', err); onData(false); },
  );
}

export async function addAdmin(email: string): Promise<void> {
  await setDoc(doc(db, ADMINS_COL, email.toLowerCase()), { addedAt: serverTimestamp() });
}

export async function removeAdmin(email: string): Promise<void> {
  await deleteDoc(doc(db, ADMINS_COL, email.toLowerCase()));
}
