import { useEffect, useState } from 'react';
import { subscribeMyApplicants } from '../services/applicantsService';
import type { Applicant } from '../types';

// undefined = still loading; [] = confirmed no records yet (briefly true
// right after a brand-new signup, before linkApplicantAccount's write lands).
export function useMyApplicants(uid: string | undefined): { myApplicants: Applicant[] | undefined } {
  const [myApplicants, setMyApplicants] = useState<Applicant[] | undefined>(undefined);

  useEffect(() => {
    if (!uid) { setMyApplicants(undefined); return; }
    setMyApplicants(undefined);
    const unsub = subscribeMyApplicants(uid, setMyApplicants);
    return unsub;
  }, [uid]);

  return { myApplicants };
}
