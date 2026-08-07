// Base statuses always available; admins can add further custom ones at runtime,
// so this is intentionally a plain string rather than a closed union.
export type StatusOption = string;
export type ReminderStatus = 'Not yet' | 'Urgent' | 'Done';

export interface Applicant {
  id: string;
  // Firebase Auth uid of the owning applicant (also the doc id for
  // self-service records; admin-precreated "ghost" records may not have
  // one yet, until that person signs up and claims their own doc).
  uid?: string;
  serialNo: string;
  name: string;
  email: string;
  // No `status` field here — status is derived from roadmap progress, see
  // deriveStatus() in utils/dateHelpers.ts and EnrichedApplicant.status below.
  created: string;      // ISO date string, e.g. "2026-07-05" — application created date
  submitted: string;    // ISO date string — application submitted date (waiting time is measured from here)
  notes: string;
  lastUpdated: string;  // ISO date string, set manually by admin — not derived from anything
  reminderMailSent: ReminderStatus; // "Application Reminder (30-Day)" — editable by admin and the applicant
  // Server-only bookkeeping written by the sendReminderEmails Cloud Function
  // (functions/src/index.ts) so it emails once per 30-day cycle, not every day.
  // Never set by the client — Firestore rules only allow admin/applicant to
  // touch reminderMailSent.
  reminderEmailSentAt?: string;
  // Admin-managed per-applicant to-do list. Toggleable by both admin and applicant.
  checklist?: ChecklistItem[];
  // Admin-managed per-applicant progress stepper, shown at the top of the
  // applicant's dashboard in place of the fixed Applied/Submitted/... steps.
  // Toggleable by both admin and applicant.
  roadmap?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  // Admin-set on the shared template. Roadmap: also shown under the status
  // badge on the applicant's My Status page when this is their furthest
  // completed step — e.g. "Submitted — next you'll be contacted for
  // review." Checklist: shown in italics under the item on the applicant's
  // Checklist page.
  note?: string;
}

export interface EnrichedApplicant extends Applicant {
  // Derived, never stored: 'Not started' if no roadmap step is done yet,
  // else the label of the furthest-along completed roadmap step.
  // See deriveStatus() in utils/dateHelpers.ts.
  status: StatusOption;
  // The matching roadmap step's admin-written explainer, if one is set —
  // see deriveStatusNote() in utils/dateHelpers.ts.
  statusNote?: string;
  // True once every roadmap step is marked done — used where the app
  // previously checked status === 'Approved'.
  isComplete: boolean;
  // null when `submitted` isn't set yet (self-service applicants who
  // haven't submitted their application) — nothing to count from yet.
  waiting: number | null;
  remaining: number | null;
  urg: { label: string; color: string };
  reminderDaysLeft: number; // 30 - (days since lastUpdated); negative once overdue
  // Display-only: 'Not yet' becomes 'Urgent' once the window is up. Never
  // overrides 'Done', and never gets written back — reminderMailSent stays
  // whatever was explicitly chosen.
  effectiveReminderStatus: ReminderStatus;
}

export interface ApplicantFormData {
  serialNo: string;
  name: string;
  email: string;
  created: string;
  submitted: string;
  notes: string;
  lastUpdated: string;
  reminderMailSent: ReminderStatus;
}

export interface StatCounts {
  total: number;
  urgent: number;
  overdue: number;
  approved: number;
}

export interface PieDatum {
  name: StatusOption;
  value: number;
}

export interface EmailTemplate {
  subject: string;
  body: string;
}

export interface GuideSection {
  heading: string;
  body: string;
}

export interface GuideAttachment {
  url: string;
  name: string;
}

export interface Guide {
  id: string;
  title: string;
  slug: string;
  category: string;
  order: number;
  sections: GuideSection[];
  attachments?: GuideAttachment[];
  updatedAt?: string;
}

export interface VivaQuestion {
  id: string;
  question: string;
  note: string;
  order: number;
}

export interface HelpLink {
  label: string;
  url: string;
}

// A freeform admin-added block — title + rich-text body (see utils/richText.ts).
// Used for custom About/Help sections and custom sidebar pages, all the
// same shape since they're all just "a titled block of rich text" wherever
// they end up rendered.
export interface CustomSection {
  id: string;
  title: string;
  body: string;
}

export interface HelpInfo {
  subtitle: string;
  emailTitle: string;
  email: string;
  emailDescription: string;
  embassyTitle: string;
  embassyEmail: string;
  embassyAddress: string;
  embassyDescription: string;
  removingEntryTitle: string;
  removingEntryBody: string;
  communityTitle: string;
  communityDescription: string;
  communityLinks: HelpLink[];
}

export interface PrivacyContent {
  privacyBody: string;
  termsBody: string;
  lastUpdated: string;
}

export interface AboutTimelineItem {
  heading: string;
  body: string;
}

export interface AboutPartnerLink {
  label: string;
  description: string;
  url: string;
}

export interface AboutContent {
  subtitle: string;
  storyHeading: string;
  storyIntro: string;
  timeline: AboutTimelineItem[];
  partnerTitle: string;
  partnerName: string;
  partnerDescription: string;
  partnerLinks: AboutPartnerLink[];
  teamTitle: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  linkedinUrl: string;
  order: number;
}
