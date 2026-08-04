import { useEffect, useMemo, useState } from 'react';
import { STATUS_OPTIONS } from '../constants/status';
import { todayStr, enrichApplicant, serialNumberValue } from '../utils/dateHelpers';
import { subscribeApplicants } from '../services/applicantsService';
import type { Applicant, EnrichedApplicant, StatCounts, PieDatum } from '../types';

export function useApplicants() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeApplicants((data) => {
      setApplicants(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const enriched: EnrichedApplicant[] = useMemo(() => {
    const t = todayStr();
    return applicants
      .map(a => enrichApplicant(a, t))
      .sort((a, b) => serialNumberValue(a.serialNo) - serialNumberValue(b.serialNo));
  }, [applicants]);

  const stats: StatCounts = useMemo(() => ({
    total: enriched.length,
    urgent: enriched.filter(a => a.remaining !== null && a.remaining <= 30 && a.remaining > 0).length,
    overdue: enriched.filter(a => a.remaining !== null && a.remaining <= 0).length,
    approved: enriched.filter(a => a.status === 'Approved').length,
  }), [enriched]);

  const pieData: PieDatum[] = useMemo(() => {
    const counts: Record<string, number> = {};
    STATUS_OPTIONS.forEach(s => { counts[s] = 0; });
    enriched.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });
    return Object.keys(counts)
      .map(s => ({ name: s, value: counts[s] }))
      .filter(d => d.value > 0);
  }, [enriched]);

  return { enriched, stats, pieData, loading };
}
