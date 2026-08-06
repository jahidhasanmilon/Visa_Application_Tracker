import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { AboutContent, HelpInfo, PrivacyContent } from '../types';

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

export const DEFAULT_PRIVACY: PrivacyContent = { privacyBody: '', termsBody: '', lastUpdated: '' };

// Reads the old single `body` field (from before Privacy/Terms were split
// into tabs) into privacyBody, so nothing already written disappears —
// saving from the new editor moves it into the proper shape for good.
export function subscribePrivacy(onData: (content: PrivacyContent) => void): () => void {
  return onSnapshot(PRIVACY_DOC, (snap) => {
    if (!snap.exists()) { onData(DEFAULT_PRIVACY); return; }
    const data = snap.data() as Partial<PrivacyContent> & { body?: string };
    onData({
      privacyBody: data.privacyBody ?? data.body ?? '',
      termsBody: data.termsBody ?? '',
      lastUpdated: data.lastUpdated ?? '',
    });
  });
}

export async function savePrivacy(content: PrivacyContent): Promise<void> {
  await setDoc(PRIVACY_DOC, content);
}
