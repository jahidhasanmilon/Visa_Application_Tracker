import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, where, limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Guide, GuideSection } from '../types';

const GUIDES_COL = 'guides';

export function subscribeGuides(onData: (guides: Guide[]) => void): () => void {
  const q = query(collection(db, GUIDES_COL), orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const guides: Guide[] = snapshot.docs.map((d) => ({ ...(d.data() as Omit<Guide, 'id'>), id: d.id }));
    onData(guides);
  });
}

// Public reader looks guides up by slug, not doc id, so URLs stay stable
// even if the admin edits the title later.
export function subscribeGuideBySlug(slug: string, onData: (guide: Guide | null) => void): () => void {
  const q = query(collection(db, GUIDES_COL), where('slug', '==', slug), limit(1));
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) { onData(null); return; }
    const d = snapshot.docs[0];
    onData({ ...(d.data() as Omit<Guide, 'id'>), id: d.id });
  });
}

export interface GuideFormData {
  title: string;
  slug: string;
  order: number;
  sections: GuideSection[];
}

export async function addGuide(form: GuideFormData): Promise<void> {
  await addDoc(collection(db, GUIDES_COL), { ...form, updatedAt: new Date().toISOString().slice(0, 10) });
}

export async function updateGuide(id: string, form: GuideFormData): Promise<void> {
  await updateDoc(doc(db, GUIDES_COL, id), { ...form, updatedAt: new Date().toISOString().slice(0, 10) });
}

export async function deleteGuide(id: string): Promise<void> {
  await deleteDoc(doc(db, GUIDES_COL, id));
}

export function slugify(title: string): string {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
