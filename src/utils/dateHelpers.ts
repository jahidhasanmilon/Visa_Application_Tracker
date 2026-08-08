import { TARGET_DAYS, REMINDER_WINDOW_DAYS } from '../constants/status';
import type { Applicant, ChecklistItem, EnrichedApplicant } from '../types';

// Works with both bare dates ('2026-07-07') and full UTC timestamps
// ('2026-07-07T07:18:00.000Z') — both parse correctly via the Date
// constructor, so no special-casing is needed either way.
export function daysBetween(a: string, b: string): number {
  const A = new Date(a);
  const B = new Date(b);
  return Math.round((B.getTime() - A.getTime()) / 86400000);
}

// UTC calendar date — deliberately not the visitor's own browser timezone,
// so every applicant and admin (wherever they are) computes the same
// day-based countdowns off the same clock. Must match todayStr() in
// functions/src/index.ts.
export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// Works with both bare dates and full UTC timestamps (see daysBetween) —
// rendered in UTC explicitly so the calendar date shown doesn't drift with
// the viewer's own browser timezone.
export function fmtDate(d?: string): string {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

// "07.07.2026, 07:18 UTC" — used for lastUpdated, which now carries a real
// time-of-day (not just a calendar date) so the 30-day reminder countdown
// can be precise to the minute/second, not just the day.
export function fmtDateTimeUtc(d?: string): string {
  if (!d) return '—';
  const dt = new Date(d);
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const hh = String(dt.getUTCHours()).padStart(2, '0');
  const min = String(dt.getUTCMinutes()).padStart(2, '0');
  return `${dd}.${mm}.${dt.getUTCFullYear()}, ${hh}:${min} UTC`;
}

// Splits a lastUpdated value into separate <input type="date"> /
// <input type="time"> values, both read as UTC — so a manual edit shows
// (and lets you set) the exact UTC time, not just the date.
export function splitDateTimeUtc(d?: string): { date: string; time: string } {
  if (!d) return { date: '', time: '00:00' };
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return { date: '', time: '00:00' };
  const hh = String(dt.getUTCHours()).padStart(2, '0');
  const min = String(dt.getUTCMinutes()).padStart(2, '0');
  return { date: d.slice(0, 10), time: `${hh}:${min}` };
}

// Inverse of splitDateTimeUtc — combines a date/time pair (both entered as
// UTC) back into a single ISO timestamp for storage.
export function combineDateTimeUtc(date: string, time: string): string {
  return `${date}T${time || '00:00'}:00.000Z`;
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

// Ticking a single box writes a FULL item-array snapshot into the
// applicant's own record (see updateRoadmap/updateChecklist) — every item
// copied straight from the template keeps the template's own id. So an
// applicant's saved list is "genuinely customized" only if it contains an
// item whose id isn't in the current template at all — that only happens
// via the admin's "customize this one applicant" editor, which always
// mints a fresh id. A plain progress snapshot (every id still traces back
// to the template) is NOT a customization, just ticked/unticked state.
export function isCustomizedList(stored: ChecklistItem[] | undefined, template: ChecklistItem[]): boolean {
  if (!stored || stored.length === 0) return false;
  const templateIds = new Set(template.map(t => t.id));
  return stored.some(s => !templateIds.has(s.id));
}

// Non-customized applicants get re-derived from the LIVE template every
// time — so admin edits (new/removed/reordered/renamed steps) show up
// immediately for anyone who has only ever ticked boxes — while keeping
// each item's own done/not-done state where it still exists. Customized
// applicants keep their own custom steps too, but the shared-default steps
// among them are ALSO always re-derived from the live template (so new
// default steps still reach them) and always sort first, in template
// order — this applicant's own custom-only steps always trail after.
function mergeWithTemplate(stored: ChecklistItem[] | undefined, template: ChecklistItem[]): ChecklistItem[] {
  if (!stored || stored.length === 0) return template;
  const doneById = new Map(stored.map(s => [s.id, s.done]));
  const templateDerived = template.map(t => ({ ...t, done: doneById.get(t.id) ?? false }));
  if (!isCustomizedList(stored, template)) return templateDerived;
  const templateIds = new Set(template.map(t => t.id));
  const custom = stored.filter(s => !templateIds.has(s.id));
  return [...templateDerived, ...custom];
}

export function effectiveRoadmap(a: Applicant, roadmapTemplate: ChecklistItem[]): ChecklistItem[] {
  return mergeWithTemplate(a.roadmap, roadmapTemplate);
}

export function effectiveChecklist(a: Applicant, checklistTemplate: ChecklistItem[]): ChecklistItem[] {
  return mergeWithTemplate(a.checklist, checklistTemplate);
}

// The furthest-along completed roadmap step, or null if none are done yet.
function furthestDoneStep(a: Applicant, roadmapTemplate: ChecklistItem[]): ChecklistItem | null {
  const done = effectiveRoadmap(a, roadmapTemplate).filter(s => s.done);
  return done.length > 0 ? done[done.length - 1] : null;
}

export function deriveStatus(a: Applicant, roadmapTemplate: ChecklistItem[]): string {
  return furthestDoneStep(a, roadmapTemplate)?.label ?? 'Not started';
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
  const currentStep = furthestDoneStep(a, roadmapTemplate);
  const status = currentStep?.label ?? 'Not started';
  const statusNote = currentStep?.note;
  const isComplete = roadmap.length > 0 && roadmap.every(s => s.done);
  const waiting = a.submitted ? daysBetween(a.submitted, today) : null;
  const remaining = waiting === null ? null : TARGET_DAYS - waiting;
  // Deliberately NOT daysBetween(a.lastUpdated, today) — today is only a
  // midnight-UTC calendar date, so rounding a full lastUpdated timestamp
  // against it can be off by up to a whole day (e.g. an edit made in the
  // evening UTC reads as "1 day left" here while the applicant's own
  // second-precise LiveCountdown already shows it overdue). Match
  // LiveCountdown.tsx's math exactly: real elapsed milliseconds against
  // the real current instant, floored to whole days.
  const remainingMs = new Date(a.lastUpdated).getTime() + REMINDER_WINDOW_DAYS * 86400000 - Date.now();
  const reminderWholeDays = Math.floor(Math.abs(remainingMs) / 86400000);
  const reminderDaysLeft = remainingMs >= 0 ? reminderWholeDays : -reminderWholeDays;
  const effectiveReminderStatus = a.reminderMailSent === 'Not yet' && reminderDaysLeft <= 0 ? 'Urgent' : a.reminderMailSent;
  const urg = remaining === null ? { label: 'Not submitted', color: 'var(--muted)' } : urgency(remaining);
  return { ...a, status, statusNote, isComplete, waiting, remaining, urg, reminderDaysLeft, effectiveReminderStatus };
}
