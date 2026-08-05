import { FileText, Send, Clock, XCircle, PenLine } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReminderStatus } from '../types';

// Total assumed processing window in days, used to estimate "remaining time".
// This is a planning assumption (the day a decision call might realistically come),
// not a guarantee — always label figures derived from it as an estimate.
export const TARGET_DAYS = 365;
export const TARGET_DAYS_NOTE = `Estimate, based on a ${TARGET_DAYS}-day target window`;

interface StatusMeta {
  icon: LucideIcon;
  color: string;
  bg: string;
}

// Status is now free-form — derived from whichever roadmap step is furthest
// along (see deriveStatus() in utils/dateHelpers.ts), so this only covers
// the handful of well-known labels. Anything else (a custom roadmap step
// label) falls back to DEFAULT_STATUS_META below.
const STATUS_META: Record<string, StatusMeta> = {
  'Not started': { icon: PenLine,  color: '#7C6FE0', bg: '#EDEBFC' },
  'Applied':     { icon: FileText, color: '#8B899E', bg: '#ECEBF2' },
  'Submitted':   { icon: Send,     color: '#3E7BFA', bg: '#E4ECFE' },
  'Rejected':    { icon: XCircle,  color: '#F04438', bg: '#FCE7E5' },
};

const DEFAULT_STATUS_META: StatusMeta = { icon: Clock, color: '#F5A524', bg: '#FDF0DA' };

// Safe lookup for status display (icon/color) — falls back gracefully for
// roadmap step labels that aren't in the well-known map above.
export function getStatusMeta(status: string): StatusMeta {
  return STATUS_META[status] || DEFAULT_STATUS_META;
}

// Selectable by admin/applicant. 'Urgent' isn't offered here — it's a
// computed display-only badge (see effectiveReminderStatus in
// utils/dateHelpers.ts) that appears once the window is overdue, never
// something anyone picks directly.
export const REMINDER_OPTIONS: ReminderStatus[] = ['Not yet', 'Done'];

// The reminder day-count counts down from the last-updated date: 30 - (today - lastUpdated).
export const REMINDER_WINDOW_DAYS = 30;

export const REMINDER_META: Record<ReminderStatus, { color: string; bg: string }> = {
  'Not yet': { color: 'var(--neutral)', bg: 'var(--neutral-soft)' },
  'Urgent':  { color: 'var(--danger)',  bg: 'var(--danger-soft)' },
  'Done':    { color: 'var(--success)', bg: 'var(--success-soft)' },
};
