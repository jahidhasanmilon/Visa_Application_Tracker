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
  const reminderDaysLeft = REMINDER_WINDOW_DAYS - daysBetween(a.lastUpdated, today);
  const effectiveReminderStatus = a.reminderMailSent === 'Not yet' && reminderDaysLeft <= 0 ? 'Urgent' : a.reminderMailSent;
  const urg = remaining === null ? { label: 'Not submitted', color: 'var(--muted)' } : urgency(remaining);
  return { ...a, status, statusNote, isComplete, waiting, remaining, urg, reminderDaysLeft, effectiveReminderStatus };
}
