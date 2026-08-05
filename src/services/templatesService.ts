import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { ChecklistItem } from '../types';
import { DEFAULT_CHECKLIST_LABELS } from '../constants/checklist';
import { DEFAULT_ROADMAP_LABELS } from '../constants/roadmap';

const CHECKLIST_DOC = doc(db, 'meta', 'checklistTemplate');
const ROADMAP_DOC = doc(db, 'meta', 'roadmapTemplate');

function toItems(labels: string[]): ChecklistItem[] {
  return labels.map(label => ({ id: label, label, done: false }));
}

// Shared, admin-editable default checklist/roadmap — every applicant who
// hasn't been individually customized by admin sees these live. Seeds from
// the original hardcoded labels until admin saves a template of their own.
export function subscribeChecklistTemplate(onData: (items: ChecklistItem[]) => void): () => void {
  return onSnapshot(CHECKLIST_DOC, (snap) => {
    const items = (snap.data() as { items?: ChecklistItem[] } | undefined)?.items;
    onData(items && items.length > 0 ? items : toItems(DEFAULT_CHECKLIST_LABELS));
  });
}

export function subscribeRoadmapTemplate(onData: (items: ChecklistItem[]) => void): () => void {
  return onSnapshot(ROADMAP_DOC, (snap) => {
    const items = (snap.data() as { items?: ChecklistItem[] } | undefined)?.items;
    onData(items && items.length > 0 ? items : toItems(DEFAULT_ROADMAP_LABELS));
  });
}

export async function saveChecklistTemplate(items: ChecklistItem[]): Promise<void> {
  await setDoc(CHECKLIST_DOC, { items });
}

export async function saveRoadmapTemplate(items: ChecklistItem[]): Promise<void> {
  await setDoc(ROADMAP_DOC, { items });
}
