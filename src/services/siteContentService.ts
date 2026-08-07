import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { AboutContent, HelpInfo, PrivacyContent, CustomSection } from '../types';

const HELP_DOC = doc(db, 'meta', 'help');
const ABOUT_DOC = doc(db, 'meta', 'about');
const PRIVACY_DOC = doc(db, 'meta', 'privacy');
const ABOUT_SECTION_ORDER_DOC = doc(db, 'meta', 'aboutSectionOrder');
const HELP_SECTION_ORDER_DOC = doc(db, 'meta', 'helpSectionOrder');
const ABOUT_CUSTOM_SECTIONS_DOC = doc(db, 'meta', 'aboutCustomSections');
const HELP_CUSTOM_SECTIONS_DOC = doc(db, 'meta', 'helpCustomSections');
const ABOUT_HIDDEN_SECTIONS_DOC = doc(db, 'meta', 'aboutHiddenSections');
const HELP_HIDDEN_SECTIONS_DOC = doc(db, 'meta', 'helpHiddenSections');

export const DEFAULT_HELP: HelpInfo = {
  subtitle: 'Found a bug? Have a question or feedback? Reach out.',
  emailTitle: 'Email',
  email: '',
  emailDescription: 'For corrections, questions, or feedback — email us. We read every message.',
  embassyTitle: 'Germany Embassy',
  embassyEmail: '',
  embassyAddress: '',
  embassyDescription: 'Official contact details for the German Embassy, for visa-related queries.',
  removingEntryTitle: 'Removing an entry',
  removingEntryBody: '',
  communityTitle: 'Community',
  communityDescription: 'Day-to-day discussion, questions, and feedback live in our community.',
  communityLinks: [],
};

// Reads the old shape (whatsappLink + notes) so nothing already saved
// disappears — communityLinks gets seeded from whatsappLink, notes becomes
// removingEntryBody. Saving from the new editor moves it into the proper
// shape for good.
export function subscribeHelp(onData: (help: HelpInfo) => void): () => void {
  return onSnapshot(HELP_DOC, (snap) => {
    if (!snap.exists()) { onData(DEFAULT_HELP); return; }
    const data = snap.data() as Partial<HelpInfo> & { whatsappLink?: string; notes?: string };
    onData({
      subtitle: data.subtitle ?? DEFAULT_HELP.subtitle,
      emailTitle: data.emailTitle ?? DEFAULT_HELP.emailTitle,
      email: data.email ?? '',
      emailDescription: data.emailDescription ?? DEFAULT_HELP.emailDescription,
      embassyTitle: data.embassyTitle ?? DEFAULT_HELP.embassyTitle,
      embassyEmail: data.embassyEmail ?? '',
      embassyAddress: data.embassyAddress ?? '',
      embassyDescription: data.embassyDescription ?? DEFAULT_HELP.embassyDescription,
      removingEntryTitle: data.removingEntryTitle ?? DEFAULT_HELP.removingEntryTitle,
      removingEntryBody: data.removingEntryBody ?? data.notes ?? '',
      communityTitle: data.communityTitle ?? DEFAULT_HELP.communityTitle,
      communityDescription: data.communityDescription ?? DEFAULT_HELP.communityDescription,
      communityLinks: data.communityLinks ?? (data.whatsappLink ? [{ label: 'WhatsApp group', url: data.whatsappLink }] : []),
    });
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
  partnerTitle: 'Official partner',
  partnerName: 'Rubalif',
  partnerDescription: '',
  partnerLinks: [],
  teamTitle: 'The people behind the platform',
  teamSubtitle: '',
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

// Array of About-page section keys, in the order admin wants them shown.
// null = no customization saved yet, use DEFAULT_ABOUT_SECTION_ORDER.
export function subscribeAboutSectionOrder(onData: (order: string[] | null) => void): () => void {
  return onSnapshot(ABOUT_SECTION_ORDER_DOC, (snap) => {
    onData(snap.exists() ? ((snap.data() as { order?: string[] }).order || null) : null);
  });
}

export async function saveAboutSectionOrder(order: string[]): Promise<void> {
  await setDoc(ABOUT_SECTION_ORDER_DOC, { order });
}

// Array of Help-page section keys, in the order admin wants them shown.
// null = no customization saved yet, use DEFAULT_HELP_SECTION_ORDER.
export function subscribeHelpSectionOrder(onData: (order: string[] | null) => void): () => void {
  return onSnapshot(HELP_SECTION_ORDER_DOC, (snap) => {
    onData(snap.exists() ? ((snap.data() as { order?: string[] }).order || null) : null);
  });
}

export async function saveHelpSectionOrder(order: string[]): Promise<void> {
  await setDoc(HELP_SECTION_ORDER_DOC, { order });
}

// Admin-added freeform sections (title + rich-text body) shown alongside
// the built-in About sections — their ids live in the same
// aboutSectionOrder array as the built-in keys (see mergeSectionOrder).
export function subscribeAboutCustomSections(onData: (items: CustomSection[]) => void): () => void {
  return onSnapshot(ABOUT_CUSTOM_SECTIONS_DOC, (snap) => {
    onData(snap.exists() ? ((snap.data() as { items?: CustomSection[] }).items || []) : []);
  });
}

export async function saveAboutCustomSections(items: CustomSection[]): Promise<void> {
  await setDoc(ABOUT_CUSTOM_SECTIONS_DOC, { items });
}

// Same idea as above, for the Help page.
export function subscribeHelpCustomSections(onData: (items: CustomSection[]) => void): () => void {
  return onSnapshot(HELP_CUSTOM_SECTIONS_DOC, (snap) => {
    onData(snap.exists() ? ((snap.data() as { items?: CustomSection[] }).items || []) : []);
  });
}

export async function saveHelpCustomSections(items: CustomSection[]): Promise<void> {
  await setDoc(HELP_CUSTOM_SECTIONS_DOC, { items });
}

// Fixed (built-in) sections can't be deleted — they're wired to specific
// content fields, not freeform items — so "remove" for them means "hide
// from the page" instead. Works for custom section/page ids too, in case
// admin wants to temporarily hide one without deleting it.
export function subscribeAboutHiddenSections(onData: (keys: string[]) => void): () => void {
  return onSnapshot(ABOUT_HIDDEN_SECTIONS_DOC, (snap) => {
    onData(snap.exists() ? ((snap.data() as { keys?: string[] }).keys || []) : []);
  });
}

export async function saveAboutHiddenSections(keys: string[]): Promise<void> {
  await setDoc(ABOUT_HIDDEN_SECTIONS_DOC, { keys });
}

export function subscribeHelpHiddenSections(onData: (keys: string[]) => void): () => void {
  return onSnapshot(HELP_HIDDEN_SECTIONS_DOC, (snap) => {
    onData(snap.exists() ? ((snap.data() as { keys?: string[] }).keys || []) : []);
  });
}

export async function saveHelpHiddenSections(keys: string[]): Promise<void> {
  await setDoc(HELP_HIDDEN_SECTIONS_DOC, { keys });
}
