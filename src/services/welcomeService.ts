import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import type { WelcomeContent } from '../types';

const WELCOME_DOC = doc(db, 'meta', 'welcome');
const IMAGE_PATH = 'meta/welcomeImage';

export const DEFAULT_WELCOME: WelcomeContent = {
  enabled: false,
  message: "Welcome! Here's a quick tour of how to use this app before you get started.",
  imageUrl: '',
};

export function subscribeWelcome(onData: (content: WelcomeContent) => void): () => void {
  return onSnapshot(WELCOME_DOC, (snap) => {
    onData(snap.exists() ? { ...DEFAULT_WELCOME, ...(snap.data() as Partial<WelcomeContent>) } : DEFAULT_WELCOME);
  });
}

export async function saveWelcome(content: WelcomeContent): Promise<void> {
  await setDoc(WELCOME_DOC, content);
}

// Single overwritable file — only the owner email can write here (see
// storage.rules; Storage rules can't check the Firestore admins collection,
// same constraint as guide attachments).
export async function uploadWelcomeImage(file: File): Promise<string> {
  const fileRef = ref(storage, IMAGE_PATH);
  await uploadBytes(fileRef, file, { contentType: file.type });
  return getDownloadURL(fileRef);
}

export async function deleteWelcomeImage(): Promise<void> {
  await deleteObject(ref(storage, IMAGE_PATH)).catch(() => {});
}
