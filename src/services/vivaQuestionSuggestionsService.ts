import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { addVivaQuestion } from './vivaQuestionsService';
import type { VivaQuestionSuggestion } from '../types';

const COL = 'vivaQuestionSuggestions';

export interface VivaQuestionSuggestionFormData {
  question: string;
  note: string;
  section: string;
  suggestedByUid: string;
  suggestedByName: string;
  suggestedByEmail: string;
}

export async function addVivaQuestionSuggestion(form: VivaQuestionSuggestionFormData): Promise<void> {
  await addDoc(collection(db, COL), { ...form, status: 'pending', createdAt: new Date().toISOString() });
}

// Admin queue — every pending suggestion, oldest first. Sorted client-side
// (rather than an orderBy('createdAt') in the query) so this doesn't need a
// composite index — a where() equality filter plus an orderBy() on a
// different field only works once that index exists in Firestore.
export function subscribePendingVivaSuggestions(onData: (suggestions: VivaQuestionSuggestion[]) => void): () => void {
  const q = query(collection(db, COL), where('status', '==', 'pending'));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(d => ({ ...(d.data() as Omit<VivaQuestionSuggestion, 'id'>), id: d.id }));
    list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    onData(list);
  });
}

// Applicant's own submissions (any status), newest first — so they can see
// whether something they suggested was approved or rejected. Sorted
// client-side for the same composite-index reason as above.
export function subscribeMyVivaSuggestions(uid: string, onData: (suggestions: VivaQuestionSuggestion[]) => void): () => void {
  const q = query(collection(db, COL), where('suggestedByUid', '==', uid));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(d => ({ ...(d.data() as Omit<VivaQuestionSuggestion, 'id'>), id: d.id }));
    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    onData(list);
  });
}

// Approving publishes the question live (own doc in vivaQuestions) and marks
// the suggestion approved rather than deleting it, so the applicant still
// sees the outcome in their own submissions list.
export async function approveVivaSuggestion(suggestion: VivaQuestionSuggestion, order: number): Promise<void> {
  await addVivaQuestion({
    question: suggestion.question,
    note: suggestion.note,
    order,
    section: suggestion.section,
  });
  await updateDoc(doc(db, COL, suggestion.id), { status: 'approved' });
}

export async function rejectVivaSuggestion(id: string): Promise<void> {
  await updateDoc(doc(db, COL, id), { status: 'rejected' });
}

export async function deleteVivaSuggestion(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
