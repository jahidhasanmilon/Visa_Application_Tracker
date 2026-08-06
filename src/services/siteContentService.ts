import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { AboutContent, HelpInfo } from '../types';

const HELP_DOC = doc(db, 'meta', 'help');
const ABOUT_DOC = doc(db, 'meta', 'about');
const PRIVACY_DOC = doc(db, 'meta', 'privacy');

const DEFAULT_HELP: HelpInfo = { whatsappLink: '', email: '', notes: '' };

export function subscribeHelp(onData: (help: HelpInfo) => void): () => void {
  return onSnapshot(HELP_DOC, (snap) => {
    onData(snap.exists() ? (snap.data() as HelpInfo) : DEFAULT_HELP);
  });
}

export async function saveHelp(help: HelpInfo): Promise<void> {
  await setDoc(HELP_DOC, help);
}

export const DEFAULT_ABOUT: AboutContent = {
  subtitle: "Why this exists, who built it, and how it grew.",
  storyHeading: 'Our story',
  storyIntro: 'VisaTrack helps this community track Germany Opportunity Card applications — from preparing your documents through to the day you land. Built by and for the group, not an official service.',
  timeline: [],
};

export function subscribeAbout(onData: (content: AboutContent) => void): () => void {
  return onSnapshot(ABOUT_DOC, (snap) => {
    onData(snap.exists() ? { ...DEFAULT_ABOUT, ...(snap.data() as Partial<AboutContent>) } : DEFAULT_ABOUT);
  });
}

export async function saveAbout(content: AboutContent): Promise<void> {
  await setDoc(ABOUT_DOC, content);
}

// null means no custom text saved yet.
export function subscribePrivacy(onData: (body: string | null) => void): () => void {
  return onSnapshot(PRIVACY_DOC, (snap) => {
    onData(snap.exists() ? ((snap.data() as { body?: string }).body ?? '') : null);
  });
}

export async function savePrivacy(body: string): Promise<void> {
  await setDoc(PRIVACY_DOC, { body });
}
