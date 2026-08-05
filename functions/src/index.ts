import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import nodemailer from 'nodemailer';

initializeApp();

// Keep in sync with OWNER_EMAIL in src/constants/roles.ts. Additional admins
// come from the `admins` Firestore collection (managed from
// src/pages/admin/Admins.tsx) — read dynamically below via the Admin SDK,
// which bypasses firestore.rules.
const OWNER_EMAIL = 'jahidhasanmilon999@gmail.com';

async function getAdminEmails(db: FirebaseFirestore.Firestore): Promise<string[]> {
  const snap = await db.collection('admins').get();
  return [OWNER_EMAIL, ...snap.docs.map(d => d.id)];
}

// Must match TARGET_DAYS-style logic in src/constants/status.ts (REMINDER_WINDOW_DAYS)
// and src/utils/dateHelpers.ts (enrichApplicant) — the 30-day countdown is measured
// from the applicant's lastUpdated date.
const REMINDER_WINDOW_DAYS = 30;

// Mirrors src/constants/emailTemplate.ts — used only if the admin hasn't
// saved a custom template yet at meta/emailTemplate.
const DEFAULT_TEMPLATE = {
  subject: 'Application Reminder (30-Day): {{name}} — {{serialNo}}',
  body: `The 30-day follow-up window has passed for this application.

Name: {{name}}
Serial No: {{serialNo}}
Status: {{status}}
Last updated: {{lastUpdated}}
Days overdue: {{daysOverdue}}

Please review and follow up.`,
};

const GMAIL_USER = defineSecret('GMAIL_USER');
const GMAIL_APP_PASSWORD = defineSecret('GMAIL_APP_PASSWORD');

function daysBetween(a: string, b: string): number {
  const A = new Date(`${a}T00:00:00`);
  const B = new Date(`${b}T00:00:00`);
  return Math.round((B.getTime() - A.getTime()) / 86400000);
}

// Mirrors src/utils/dateHelpers.ts — Bangladesh's calendar date
// (Asia/Dhaka), not raw UTC, so the server-side overdue check agrees with
// what applicants see client-side.
function todayStr(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? '');
}

interface RoadmapItem {
  id: string;
  label: string;
  done: boolean;
}

interface ApplicantDoc {
  name?: string;
  serialNo?: string;
  email?: string;
  lastUpdated?: string;
  reminderMailSent?: 'Not yet' | 'Urgent' | 'Done';
  reminderEmailSentAt?: string;
  roadmap?: RoadmapItem[];
}

// Mirrors deriveStatus() in src/utils/dateHelpers.ts — status is never
// stored, only ever derived from roadmap progress.
function deriveStatus(a: ApplicantDoc, roadmapTemplate: RoadmapItem[]): string {
  const roadmap = a.roadmap && a.roadmap.length > 0 ? a.roadmap : roadmapTemplate;
  const done = roadmap.filter(s => s.done);
  return done.length > 0 ? done[done.length - 1].label : 'Not started';
}

interface EmailTemplateDoc {
  subject?: string;
  body?: string;
}

async function runReminderSweep(): Promise<{ sent: number; checked: number }> {
  const db = getFirestore();
  const today = todayStr();

  const templateSnap = await db.doc('meta/emailTemplate').get();
  const templateDoc = templateSnap.data() as EmailTemplateDoc | undefined;
  const template = {
    subject: templateDoc?.subject || DEFAULT_TEMPLATE.subject,
    body: templateDoc?.body || DEFAULT_TEMPLATE.body,
  };

  const roadmapSnap = await db.doc('meta/roadmapTemplate').get();
  const roadmapTemplate = ((roadmapSnap.data() as { items?: RoadmapItem[] } | undefined)?.items) || [];

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER.value(), pass: GMAIL_APP_PASSWORD.value() },
  });

  const snapshot = await db.collection('applicants').get();
  let sent = 0;

  for (const doc of snapshot.docs) {
    const a = doc.data() as ApplicantDoc;
    if (!a.lastUpdated || a.reminderMailSent !== 'Not yet') continue;

    const reminderDaysLeft = REMINDER_WINDOW_DAYS - daysBetween(a.lastUpdated, today);
    if (reminderDaysLeft > 0) continue;

    // Already emailed for this cycle? (lastUpdated hasn't changed since the last send)
    if (a.reminderEmailSentAt && a.reminderEmailSentAt >= a.lastUpdated) continue;

    // No email on file (e.g. an admin-precreated ghost record for someone
    // who hasn't signed up yet) — nothing to send to.
    if (!a.email) {
      logger.warn(`Skipping reminder for ${doc.id}: no email on file.`);
      continue;
    }

    const vars = {
      name: a.name ?? 'Applicant',
      serialNo: a.serialNo ?? '',
      status: deriveStatus(a, roadmapTemplate),
      lastUpdated: a.lastUpdated,
      daysOverdue: String(Math.abs(reminderDaysLeft)),
    };

    try {
      // Only the applicant themselves — with ~1000 possible recipients,
      // cc'ing admin on every single one would flood their inbox. Admin
      // gets one digest email after the full sweep instead (see below).
      await transporter.sendMail({
        from: `VisaTrack <${GMAIL_USER.value()}>`,
        to: a.email,
        subject: renderTemplate(template.subject, vars),
        text: renderTemplate(template.body, vars),
      });
      await doc.ref.update({ reminderEmailSentAt: today });
      sent++;
    } catch (err) {
      logger.error(`Failed to send reminder email for ${doc.id}`, err);
    }
  }

  if (sent > 0) {
    try {
      const adminEmails = await getAdminEmails(db);
      await transporter.sendMail({
        from: `VisaTrack <${GMAIL_USER.value()}>`,
        to: adminEmails.join(', '),
        subject: `Reminder sweep: ${sent} email(s) sent`,
        text: `The daily 30-day reminder sweep sent ${sent} email(s) out of ${snapshot.size} applicant record(s) checked.`,
      });
    } catch (err) {
      logger.error('Failed to send admin digest email', err);
    }
  }

  logger.info(`Reminder sweep complete: ${sent} email(s) sent.`);
  return { sent, checked: snapshot.size };
}

export const sendReminderEmails = onSchedule(
  {
    schedule: '0 9 * * *',
    timeZone: 'Asia/Dhaka',
    secrets: [GMAIL_USER, GMAIL_APP_PASSWORD],
  },
  async () => {
    await runReminderSweep();
  },
);
