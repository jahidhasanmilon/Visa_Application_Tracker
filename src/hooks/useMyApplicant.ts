import { useEffect, useState } from 'react';
import { subscribeMyApplicant } from '../services/applicantsService';
import type { Applicant } from '../types';

// undefined = still loading; null = confirmed no record yet (needs onboarding).
export function useMyApplicant(uid: string | undefined): { myApplicant: Applicant | null | undefined } {
  const [myApplicant, setMyApplicant] = useState<Applicant | null | undefined>(undefined);

  useEffect(() => {
    if (!uid) { setMyApplicant(undefined); return; }
    setMyApplicant(undefined);
    const unsub = subscribeMyApplicant(uid, setMyApplicant);
    return unsub;
  }, [uid]);

  return { myApplicant };
}
