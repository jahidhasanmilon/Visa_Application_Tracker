import { useEffect, useMemo, useState } from 'react';
import { todayStr, enrichApplicant, serialNumberValue } from '../utils/dateHelpers';
import { subscribeApplicants } from '../services/applicantsService';
import { useRoadmapTemplate } from './useTemplates';
import type { Applicant, EnrichedApplicant, StatCounts, PieDatum } from '../types';

// The full, ordered list of status values that can occur — 'Not started'
// plus the roadmap template's step labels, in order. Used to build admin
// Tracker columns, Analytics funnel, and the Applications status filter.
export function statusOptionsFromRoadmap(roadmapTemplate: { label: string }[]): string[] {
  return ['Not started', ...roadmapTemplate.map(s => s.label)];
}

export function useApplicants() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const roadmapTemplate = useRoadmapTemplate();

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeApplicants((data) => {
      setApplicants(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const enriched: EnrichedApplicant[] = useMemo(() => {
    if (roadmapTemplate === null) return [];
    const t = todayStr();
    return applicants
      .map(a => enrichApplicant(a, t, roadmapTemplate))
      .sort((a, b) => serialNumberValue(a.serialNo) - serialNumberValue(b.serialNo));
  }, [applicants, roadmapTemplate]);

  const stats: StatCounts = useMemo(() => ({
    total: enriched.length,
    urgent: enriched.filter(a => a.remaining !== null && a.remaining <= 30 && a.remaining > 0).length,
    overdue: enriched.filter(a => a.remaining !== null && a.remaining <= 0).length,
    approved: enriched.filter(a => a.isComplete).length,
  }), [enriched]);

  const pieData: PieDatum[] = useMemo(() => {
    const counts: Record<string, number> = {};
    enriched.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });
    return Object.keys(counts)
      .map(s => ({ name: s, value: counts[s] }))
      .filter(d => d.value > 0);
  }, [enriched]);

  return { enriched, stats, pieData, loading: loading || roadmapTemplate === null };
}
