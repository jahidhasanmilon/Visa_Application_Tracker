import { TARGET_DAYS, REMINDER_WINDOW_DAYS } from '../constants/status';
import type { Applicant, ChecklistItem, EnrichedApplicant } from '../types';

export function daysBetween(a: string, b: string): number {
  const A = new Date(a + 'T00:00:00');
  const B = new Date(b + 'T00:00:00');
  return Math.round((B.getTime() - A.getTime()) / 86400000);
}

// Bangladesh's calendar date (Asia/Dhaka, UTC+6) — not the visitor's own
// browser timezone or raw UTC. Using UTC (the old `toISOString()` approach)
// could be off by a day for hours when Dhaka has already rolled over to a
// new date but UTC hasn't yet (or vice versa), throwing off every
// day-based countdown by up to a day right around midnight.
export function todayStr(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

export function fmtDate(d?: string): string {
  if (!d) return '—';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function urgency(remaining: number): { label: string; color: string } {
  if (remaining <= 0) return { label: 'Overdue', color: '#F04438' };
  if (remaining <= 30) return { label: 'Urgent', color: '#F04438' };
  if (remaining <= 90) return { label: 'Soon', color: '#F5A524' };
  return { label: 'On track', color: '#12B76A' };
}

// Extracts the trailing numeric part of a serial no (e.g. "AP/260/.../000000525" -> 525)
// so applicants sort by their actual serial number regardless of format/padding.
export function serialNumberValue(serialNo: string): number {
  const match = serialNo.match(/(\d+)\s*$/);
  return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
}

// status is never stored — always derived from roadmap progress.
// `roadmapTemplate` is the shared default; an applicant's own `roadmap`
// array (if non-empty) takes precedence, same fallback rule used
// everywhere else the roadmap is rendered.
export function effectiveRoadmap(a: Applicant, roadmapTemplate: ChecklistItem[]): ChecklistItem[] {
  return a.roadmap && a.roadmap.length > 0 ? a.roadmap : roadmapTemplate;
}

export function deriveStatus(a: Applicant, roadmapTemplate: ChecklistItem[]): string {
  const done = effectiveRoadmap(a, roadmapTemplate).filter(s => s.done);
  return done.length > 0 ? done[done.length - 1].label : 'Not started';
}

// Enrich a raw applicant record with computed fields (status, waiting/remaining
// days, urgency). Waiting time counts from the submitted date (not the
// created/applied date) — remaining is an estimate against TARGET_DAYS, not
// a guaranteed timeline. reminderDaysLeft counts down a 30-day window from
// the last-updated date. `submitted` can be blank for self-service
// applicants who haven't submitted yet — waiting/remaining/urgency have
// nothing to count from in that case.
export function enrichApplicant(a: Applicant, today: string, roadmapTemplate: ChecklistItem[]): EnrichedApplicant {
  const roadmap = effectiveRoadmap(a, roadmapTemplate);
  const status = deriveStatus(a, roadmapTemplate);
  const isComplete = roadmap.length > 0 && roadmap.every(s => s.done);
  const waiting = a.submitted ? daysBetween(a.submitted, today) : null;
  const remaining = waiting === null ? null : TARGET_DAYS - waiting;
  const reminderDaysLeft = REMINDER_WINDOW_DAYS - daysBetween(a.lastUpdated, today);
  const effectiveReminderStatus = a.reminderMailSent === 'Not yet' && reminderDaysLeft <= 0 ? 'Urgent' : a.reminderMailSent;
  const urg = remaining === null ? { label: 'Not submitted', color: 'var(--muted)' } : urgency(remaining);
  return { ...a, status, isComplete, waiting, remaining, urg, reminderDaysLeft, effectiveReminderStatus };
}
