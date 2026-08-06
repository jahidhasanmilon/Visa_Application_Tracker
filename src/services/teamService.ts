import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import type { TeamMember } from '../types';

const COL = 'teamMembers';

export function subscribeTeam(onData: (team: TeamMember[]) => void): () => void {
  const q = query(collection(db, COL), orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    onData(snapshot.docs.map(d => ({ ...(d.data() as Omit<TeamMember, 'id'>), id: d.id })));
  });
}

export interface TeamMemberFormData {
  name: string;
  role: string;
  bio: string;
  linkedinUrl: string;
  order: number;
}

export async function addTeamMember(form: TeamMemberFormData): Promise<void> {
  await addDoc(collection(db, COL), form);
}

export async function updateTeamMember(id: string, form: TeamMemberFormData): Promise<void> {
  await updateDoc(doc(db, COL, id), { ...form });
}

export async function deleteTeamMember(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
