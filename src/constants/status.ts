import { FileText, Send, Clock, CheckCircle2, XCircle, Tag, PenLine } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { StatusOption, ReminderStatus } from '../types';

// Base statuses always offered. Admins can add further custom ones (see
// services/statusOptionsService.ts) — those fall back to DEFAULT_STATUS_META below.
// 'Preparing' is the default for self-signed-up applicants who haven't
// applied yet — most of the community group starts here, not at 'Applied'.
export const STATUS_OPTIONS: StatusOption[] = ['Preparing', 'Applied', 'Submitted', 'Under Review', 'Approved', 'Rejected'];

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

const STATUS_META: Record<string, StatusMeta> = {
  'Preparing':    { icon: PenLine,      color: '#7C6FE0', bg: '#EDEBFC' },
  'Applied':      { icon: FileText,     color: '#8B899E', bg: '#ECEBF2' },
  'Submitted':    { icon: Send,         color: '#3E7BFA', bg: '#E4ECFE' },
  'Under Review': { icon: Clock,        color: '#F5A524', bg: '#FDF0DA' },
  'Approved':     { icon: CheckCircle2, color: '#12B76A', bg: '#DFF7EB' },
  'Rejected':     { icon: XCircle,      color: '#F04438', bg: '#FCE7E5' },
};

const DEFAULT_STATUS_META: StatusMeta = { icon: Tag, color: '#8B899E', bg: '#ECEBF2' };

// Safe lookup for status display (icon/color) — falls back gracefully for
// custom statuses an admin has added that aren't in the base map above.
export function getStatusMeta(status: string): StatusMeta {
  return STATUS_META[status] || DEFAULT_STATUS_META;
}

export const REMINDER_OPTIONS: ReminderStatus[] = ['Not yet', 'Urgent', 'Done'];

// The reminder day-count counts down from the last-updated date: 30 - (today - lastUpdated).
export const REMINDER_WINDOW_DAYS = 30;

export const REMINDER_META: Record<ReminderStatus, { color: string; bg: string }> = {
  'Not yet': { color: 'var(--neutral)', bg: 'var(--neutral-soft)' },
  'Urgent':  { color: 'var(--danger)',  bg: 'var(--danger-soft)' },
  'Done':    { color: 'var(--success)', bg: 'var(--success-soft)' },
};
