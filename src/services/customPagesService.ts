import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { CustomSection } from '../types';

// Admin-added static pages (title + rich-text body) that show up as extra
// items in the applicant sidebar, routed at /app/pages/:id. Kept as a
// single doc with an array, same shape/pattern as the checklist/roadmap
// templates — small enough lists that a single doc read is simplest.
const CUSTOM_PAGES_DOC = doc(db, 'meta', 'customPages');

export function subscribeCustomPages(onData: (items: CustomSection[]) => void): () => void {
  return onSnapshot(CUSTOM_PAGES_DOC, (snap) => {
    onData(snap.exists() ? ((snap.data() as { items?: CustomSection[] }).items || []) : []);
  });
}

export async function saveCustomPages(items: CustomSection[]): Promise<void> {
  await setDoc(CUSTOM_PAGES_DOC, { items });
}
