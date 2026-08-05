import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { HelpInfo } from '../types';

const HELP_DOC = doc(db, 'meta', 'help');
const ABOUT_DOC = doc(db, 'meta', 'about');

const DEFAULT_HELP: HelpInfo = { whatsappLink: '', email: '', notes: '' };

export function subscribeHelp(onData: (help: HelpInfo) => void): () => void {
  return onSnapshot(HELP_DOC, (snap) => {
    onData(snap.exists() ? (snap.data() as HelpInfo) : DEFAULT_HELP);
  });
}

export async function saveHelp(help: HelpInfo): Promise<void> {
  await setDoc(HELP_DOC, help);
}

// null means no custom text saved yet.
export function subscribeAbout(onData: (body: string | null) => void): () => void {
  return onSnapshot(ABOUT_DOC, (snap) => {
    onData(snap.exists() ? ((snap.data() as { body?: string }).body ?? '') : null);
  });
}

export async function saveAbout(body: string): Promise<void> {
  await setDoc(ABOUT_DOC, { body });
}
