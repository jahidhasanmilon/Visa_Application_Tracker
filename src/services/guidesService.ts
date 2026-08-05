import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, where, limit,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import type { Guide, GuideAttachment, GuideSection } from '../types';

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
  category: string;
  order: number;
  sections: GuideSection[];
  attachments?: GuideAttachment[];
}

export async function addGuide(form: GuideFormData): Promise<string> {
  const ref = await addDoc(collection(db, GUIDES_COL), { ...form, updatedAt: new Date().toISOString().slice(0, 10) });
  return ref.id;
}

export async function updateGuide(id: string, form: GuideFormData): Promise<void> {
  await updateDoc(doc(db, GUIDES_COL, id), { ...form, updatedAt: new Date().toISOString().slice(0, 10) });
}

export async function deleteGuide(id: string): Promise<void> {
  await deleteDoc(doc(db, GUIDES_COL, id));
}

// Uploaded to guides/{guideId}/{storagePath} — see storage.rules. Any file
// type; PDFs get rendered in-app, other formats get an open/download link
// (see GuideDetail.tsx). Storage path is timestamp-prefixed so multiple
// files with the same original name don't collide.
export async function uploadGuideAttachment(guideId: string, file: File): Promise<GuideAttachment> {
  const storagePath = `guides/${guideId}/${Date.now()}-${file.name}`;
  const fileRef = ref(storage, storagePath);
  await uploadBytes(fileRef, file, { contentType: file.type || 'application/octet-stream' });
  const url = await getDownloadURL(fileRef);
  return { url, name: file.name };
}

export async function deleteGuideAttachment(url: string): Promise<void> {
  await deleteObject(ref(storage, url)).catch(() => {});
}

export function slugify(title: string): string {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
