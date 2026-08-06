import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import type { FaqItem } from '../types';

const COL = 'aboutFaqs';

export function subscribeFaqs(onData: (faqs: FaqItem[]) => void): () => void {
  const q = query(collection(db, COL), orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    onData(snapshot.docs.map(d => ({ ...(d.data() as Omit<FaqItem, 'id'>), id: d.id })));
  });
}

export interface FaqFormData {
  question: string;
  answer: string;
  order: number;
}

export async function addFaq(form: FaqFormData): Promise<void> {
  await addDoc(collection(db, COL), form);
}

export async function updateFaq(id: string, form: FaqFormData): Promise<void> {
  await updateDoc(doc(db, COL, id), { ...form });
}

export async function deleteFaq(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
