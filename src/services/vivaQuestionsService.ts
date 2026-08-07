import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { VivaQuestion } from '../types';

const COL = 'vivaQuestions';
const SECTION_ORDER_DOC = doc(db, 'meta', 'vivaSectionOrder');

// Falls back to "General" for any question saved before sections existed,
// so nothing already published disappears.
const UNSECTIONED = 'General';

export function subscribeVivaQuestions(onData: (questions: VivaQuestion[]) => void): () => void {
  const q = query(collection(db, COL), orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    onData(snapshot.docs.map(d => {
      const data = d.data() as Omit<VivaQuestion, 'id'>;
      return { ...data, section: data.section || UNSECTIONED, id: d.id };
    }));
  });
}

export interface VivaQuestionFormData {
  question: string;
  note: string;
  order: number;
  section: string;
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

// Array of section names, in the order admin wants them shown. null = no
// customization saved yet — sections then just show in whatever order they
// were first seen among the questions.
export function subscribeVivaSectionOrder(onData: (order: string[] | null) => void): () => void {
  return onSnapshot(SECTION_ORDER_DOC, (snap) => {
    onData(snap.exists() ? ((snap.data() as { order?: string[] }).order || null) : null);
  });
}

export async function saveVivaSectionOrder(order: string[]): Promise<void> {
  await setDoc(SECTION_ORDER_DOC, { order });
}
