import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase';
import type { Applicant, ApplicantFormData, ReminderStatus, ChecklistItem } from '../types';

const APPLICANTS_COL = 'applicants';

export function subscribeApplicants(onData: (applicants: Applicant[]) => void): () => void {
  const q = query(collection(db, APPLICANTS_COL), orderBy('created', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const applicants: Applicant[] = snapshot.docs.map((d) => {
      const data = d.data() as Omit<Applicant, 'id'>;
      return { ...data, id: d.id };
    });
    onData(applicants);
  });
}

// Applicant-portal view: one signed-in person can own more than one
// application record (see linkApplicantAccount below), so this is a query
// filtered by the `uid` field, not a lookup at a fixed doc id — sorted
// client-side rather than via orderBy(), since a where()+orderBy() on a
// different field needs a composite index that doesn't exist here.
export function subscribeMyApplicants(uid: string, onData: (applicants: Applicant[]) => void): () => void {
  const q = query(collection(db, APPLICANTS_COL), where('uid', '==', uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map(d => ({ ...(d.data() as Omit<Applicant, 'id'>), id: d.id }));
      list.sort((a, b) => (a.created || '').localeCompare(b.created || ''));
      onData(list);
    },
    (err) => console.error('subscribeMyApplicants failed', err),
  );
}

// Called once, right after sign-up (or first sign-in with no record yet), to
// set up the applicant's own uid-keyed record — no blocking onboarding step
// (see pages/applicant/Onboarding having been replaced by the dismissible
// ApplicantDetailsModal). Runs through a Cloud Function (see
// linkApplicantAccount in functions/src/index.ts) rather than a plain
// client-side setDoc, because it first needs to check — with Admin SDK
// privileges the applicant's own client doesn't have — whether an admin
// already precreated a "ghost" record for this email, and if so carry its
// details over instead of leaving them orphaned next to a fresh blank one.
const linkApplicantAccountFn = httpsCallable(functions, 'linkApplicantAccount');
export async function linkApplicantAccount(): Promise<void> {
  await linkApplicantAccountFn();
}

// lastUpdated is a plain field on the form now — admin sets it to whatever
// date they intend, it is never overwritten automatically on save.
export async function addApplicant(form: ApplicantFormData): Promise<void> {
  await addDoc(collection(db, APPLICANTS_COL), { ...form });
}

export async function updateApplicant(id: string, form: ApplicantFormData): Promise<void> {
  await updateDoc(doc(db, APPLICANTS_COL, id), { ...form });
}

export async function deleteApplicant(id: string): Promise<void> {
  await deleteDoc(doc(db, APPLICANTS_COL, id));
}

// Narrow updates usable by an applicant on their own record (see
// firestore.rules). Only marking the reminder as "Done" stamps lastUpdated
// — that's the action that actually resets the 30-day countdown. Setting it
// back to "Not yet" must NOT touch lastUpdated, otherwise the countdown
// would restart every time without the applicant actually having done
// anything. Checklist/roadmap toggles also deliberately do NOT stamp it
// (see updateChecklist/updateRoadmap below) — ticking a box isn't "an
// update" either.
export async function updateReminderStatus(id: string, reminderMailSent: ReminderStatus): Promise<void> {
  const patch: Record<string, unknown> = { reminderMailSent };
  if (reminderMailSent === 'Done') {
    // A full timestamp, not just a date — the countdown is precise to the
    // second, not just the day.
    patch.lastUpdated = new Date().toISOString();
  }
  await updateDoc(doc(db, APPLICANTS_COL, id), patch);
}

// Used by ApplicantDetailsModal ("Add your details" / "Edit my details") —
// the only place name/serialNo/created/submitted/lastUpdated get
// self-edited directly. `lastUpdated` here is whatever the user set in the
// form — not silently forced to today — since it's what the 30-day
// reminder countdown counts down from (see enrichApplicant/deriveStatus
// logic in utils/dateHelpers.ts, and REMINDER_WINDOW_DAYS-based math).
export interface MyDetails {
  name: string;
  serialNo: string;
  created: string;
  submitted: string;
  lastUpdated: string;
}

export async function updateMyDetails(id: string, details: MyDetails): Promise<void> {
  await updateDoc(doc(db, APPLICANTS_COL, id), { ...details });
}

// Whole-array replace — callers compute the new array (add/remove/toggle)
// client-side and pass the full replacement. Usable by admin and the
// applicant themselves (see firestore.rules).
export async function updateChecklist(id: string, checklist: ChecklistItem[]): Promise<void> {
  await updateDoc(doc(db, APPLICANTS_COL, id), { checklist });
}

export async function updateRoadmap(id: string, roadmap: ChecklistItem[]): Promise<void> {
  await updateDoc(doc(db, APPLICANTS_COL, id), { roadmap });
}
