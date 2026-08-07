import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const NAV_ORDER_DOC = doc(db, 'meta', 'navOrder');
const NAV_HIDDEN_DOC = doc(db, 'meta', 'navHidden');
const NAV_LABELS_DOC = doc(db, 'meta', 'navLabels');

// Array of nav `to` keys, in the order admin wants the applicant sidebar to
// show them. null = no customization saved yet, use the built-in default order.
export function subscribeApplicantNavOrder(onData: (order: string[] | null) => void): () => void {
  return onSnapshot(NAV_ORDER_DOC, (snap) => {
    onData(snap.exists() ? ((snap.data() as { order?: string[] }).order || null) : null);
  });
}

export async function saveApplicantNavOrder(order: string[]): Promise<void> {
  await setDoc(NAV_ORDER_DOC, { order });
}

// Sidebar links (built-in or custom pages) admin has hidden from the
// applicant sidebar without removing the underlying page/route entirely.
export function subscribeApplicantNavHidden(onData: (keys: string[]) => void): () => void {
  return onSnapshot(NAV_HIDDEN_DOC, (snap) => {
    onData(snap.exists() ? ((snap.data() as { keys?: string[] }).keys || []) : []);
  });
}

export async function saveApplicantNavHidden(keys: string[]): Promise<void> {
  await setDoc(NAV_HIDDEN_DOC, { keys });
}

// Admin-renamed labels for built-in sidebar links (custom pages already
// have their own freely-editable title — this is just for the fixed ones,
// keyed by route "to"). Falls back to the normal i18n label when absent.
export function subscribeApplicantNavLabels(onData: (labels: Record<string, string>) => void): () => void {
  return onSnapshot(NAV_LABELS_DOC, (snap) => {
    onData(snap.exists() ? ((snap.data() as { labels?: Record<string, string> }).labels || {}) : {});
  });
}

export async function saveApplicantNavLabels(labels: Record<string, string>): Promise<void> {
  await setDoc(NAV_LABELS_DOC, { labels });
}
