import { doc, onSnapshot, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

const META_DOC = doc(db, 'meta', 'statusOptions');

// Custom status names an admin has added, beyond the base STATUS_OPTIONS list.
export function subscribeCustomStatuses(onData: (statuses: string[]) => void): () => void {
  return onSnapshot(META_DOC, (snap) => {
    const data = snap.data() as { custom?: string[] } | undefined;
    onData(data?.custom || []);
  });
}

export async function addCustomStatus(name: string): Promise<void> {
  await setDoc(META_DOC, { custom: arrayUnion(name) }, { merge: true });
}
