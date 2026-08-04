import { TARGET_DAYS, REMINDER_WINDOW_DAYS } from '../constants/status';
import type { Applicant, EnrichedApplicant } from '../types';

export function daysBetween(a: string, b: string): number {
  const A = new Date(a + 'T00:00:00');
  const B = new Date(b + 'T00:00:00');
  return Math.round((B.getTime() - A.getTime()) / 86400000);
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
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

// Enrich a raw applicant record with computed fields (waiting/remaining days, urgency).
// Waiting time counts from the submitted date (not the created/applied date) —
// remaining is an estimate against TARGET_DAYS, not a guaranteed timeline.
// reminderDaysLeft counts down a 30-day window from the (manually-set) last-updated date.
// `submitted` can be blank for self-service applicants who haven't submitted
// yet — waiting/remaining/urgency have nothing to count from in that case.
export function enrichApplicant(a: Applicant, today: string = todayStr()): EnrichedApplicant {
  const waiting = a.submitted ? daysBetween(a.submitted, today) : null;
  const remaining = waiting === null ? null : TARGET_DAYS - waiting;
  const reminderDaysLeft = REMINDER_WINDOW_DAYS - daysBetween(a.lastUpdated, today);
  const effectiveReminderStatus = a.reminderMailSent === 'Not yet' && reminderDaysLeft <= 0 ? 'Urgent' : a.reminderMailSent;
  const urg = remaining === null ? { label: 'Not submitted', color: 'var(--muted)' } : urgency(remaining);
  return { ...a, waiting, remaining, urg, reminderDaysLeft, effectiveReminderStatus };
}
