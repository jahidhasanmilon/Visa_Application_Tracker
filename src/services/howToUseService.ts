import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { HowToUseSection } from '../types';

const DOC_REF = doc(db, 'meta', 'howToUse');

// Seeded once, the first time this doc doesn't exist yet — same starting
// content the page used to show as hardcoded i18n text, now just the
// admin-editable starting point instead of the only option.
export const DEFAULT_HOW_TO_USE_SECTIONS: HowToUseSection[] = [
  {
    id: 's1', fixed: true, heading: '1. My Status',
    body: "Your dashboard shows your progress. Tap a step on the roadmap once you've completed it — your status badge updates automatically to match the furthest step you've finished. There's no separate \"status\" to set.",
  },
  {
    id: 's2', fixed: true, heading: '2. Edit my details',
    body: 'Use "Edit my details" (on your dashboard or Profile) to keep your name, Creation date, and Waiting List Joined Date accurate — check your German embassy account for these. These drive your waiting-time estimate, so keep them current.',
  },
  {
    id: 's3', fixed: true, heading: '3. Checklist',
    body: 'A to-do list of documents and steps to prepare. Tap an item to mark it done — this is your own personal checklist, separate from the roadmap.',
  },
  {
    id: 's4', fixed: true, heading: '4. Confirm Application Request (30-Day)',
    body: 'A live countdown — days, hours, minutes, and seconds — tracks the 30-day window since your record was last edited. Mark it "Done" once you\'ve checked in with the embassy; that\'s the only thing that resets it. Switching it back to "Not yet" won\'t restart the clock.',
  },
  {
    id: 's5', fixed: true, heading: '5. Guides & Resources',
    body: 'Step-by-step write-ups on applying for the visa, understanding the checklist, and applying for jobs — organized by category. No login needed to browse them.',
  },
  {
    id: 's6', fixed: true, heading: '6. Interview Questions',
    body: 'Common interview questions, grouped by topic (Personal Introduction, Education, Professional Background, and more), with notes on how to approach each one — worth reviewing before your embassy appointment.',
  },
];

export function subscribeHowToUse(onData: (sections: HowToUseSection[]) => void): () => void {
  return onSnapshot(DOC_REF, (snap) => {
    const data = snap.data() as { sections?: HowToUseSection[] } | undefined;
    onData(data?.sections && data.sections.length > 0 ? data.sections : DEFAULT_HOW_TO_USE_SECTIONS);
  });
}

export async function saveHowToUse(sections: HowToUseSection[]): Promise<void> {
  await setDoc(DOC_REF, { sections });
}
