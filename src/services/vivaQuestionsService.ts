import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import type { VivaQuestion } from '../types';

const COL = 'vivaQuestions';

export function subscribeVivaQuestions(onData: (questions: VivaQuestion[]) => void): () => void {
  const q = query(collection(db, COL), orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    onData(snapshot.docs.map(d => ({ ...(d.data() as Omit<VivaQuestion, 'id'>), id: d.id })));
  });
}

export interface VivaQuestionFormData {
  question: string;
  note: string;
  order: number;
}

export async function addVivaQuestion(form: VivaQuestionFormData): Promise<void> {
  await addDoc(collection(db, COL), form);
}

export async function updateVivaQuestion(id: string, form: VivaQuestionFormData): Promise<void> {
  await updateDoc(doc(db, COL, id), { ...form });
}

export async function deleteVivaQuestion(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
