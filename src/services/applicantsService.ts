import {
  collection, doc, addDoc, setDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { todayStr } from '../utils/dateHelpers';
import type { Applicant, ApplicantFormData, ReminderStatus, ChecklistItem, StatusOption } from '../types';

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

// Applicant-portal view: a self-service applicant's record lives at
// applicants/{uid} — a single doc, not a query, since the doc id IS their uid.
export function subscribeMyApplicant(uid: string, onData: (applicant: Applicant | null) => void): () => void {
  return onSnapshot(doc(db, APPLICANTS_COL, uid), (snap) => {
    if (!snap.exists()) { onData(null); return; }
    onData({ ...(snap.data() as Omit<Applicant, 'id'>), id: snap.id });
  });
}

// Called once, right after sign-up (or first sign-in with no record yet), to
// create the applicant's own uid-keyed record. See firestore.rules — a user
// may only create the doc at applicants/{their own uid}.
export async function createOwnApplicant(uid: string, email: string, name: string): Promise<void> {
  const today = todayStr();
  const applicant: Omit<Applicant, 'id'> = {
    uid, email, name,
    serialNo: '',
    status: 'Preparing',
    created: today,
    submitted: '',
    notes: '',
    lastUpdated: today,
    reminderMailSent: 'Not yet',
  };
  await setDoc(doc(db, APPLICANTS_COL, uid), applicant);
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
// firestore.rules). These are all self-reported, so each one also stamps
// lastUpdated — that's what resets the applicant's own 30-day reminder
// countdown. Checklist/roadmap toggles deliberately do NOT stamp it (see
// updateChecklist/updateRoadmap below) — ticking a box isn't "an update."
export async function updateReminderStatus(id: string, reminderMailSent: ReminderStatus): Promise<void> {
  await updateDoc(doc(db, APPLICANTS_COL, id), { reminderMailSent, lastUpdated: todayStr() });
}

export async function updateMyStatus(id: string, status: StatusOption): Promise<void> {
  await updateDoc(doc(db, APPLICANTS_COL, id), { status, lastUpdated: todayStr() });
}

export async function updateMySubmitted(id: string, submitted: string): Promise<void> {
  await updateDoc(doc(db, APPLICANTS_COL, id), { submitted, lastUpdated: todayStr() });
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
