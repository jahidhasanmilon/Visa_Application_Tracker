import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { EmailTemplate } from '../types';

const TEMPLATE_DOC = doc(db, 'meta', 'emailTemplate');

// null means no custom template has been saved yet — caller should fall back
// to DEFAULT_EMAIL_TEMPLATE (src/constants/emailTemplate.ts).
export function subscribeEmailTemplate(onData: (template: EmailTemplate | null) => void): () => void {
  return onSnapshot(TEMPLATE_DOC, (snap) => {
    onData(snap.exists() ? (snap.data() as EmailTemplate) : null);
  });
}

export async function saveEmailTemplate(template: EmailTemplate): Promise<void> {
  await setDoc(TEMPLATE_DOC, template);
}
