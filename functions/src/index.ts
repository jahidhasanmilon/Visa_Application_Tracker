import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
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

// Must match REMINDER_WINDOW_DAYS in src/constants/status.ts — the 30-day
// countdown is measured to the millisecond from the applicant's lastUpdated
// timestamp, so this sweep fires as soon as possible after it actually
// expires rather than waiting for the next calendar day.
const REMINDER_WINDOW_DAYS = 30;
const REMINDER_WINDOW_MS = REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000;

// Mirrors src/constants/emailTemplate.ts — used only if the admin hasn't
// saved a custom template yet at meta/emailTemplate.
const DEFAULT_TEMPLATE = {
  subject: 'Confirm Application Request (30-Day): {{name}} — {{serialNo}}',
  body: `The 30-day follow-up window has passed for this application.

Name: {{name}}
Serial No: {{serialNo}}
Status: {{status}}
Last Edited: {{lastUpdated}}
Days overdue: {{daysOverdue}}

Please review and follow up.`,
};

const GMAIL_USER = defineSecret('GMAIL_USER');
const GMAIL_APP_PASSWORD = defineSecret('GMAIL_APP_PASSWORD');

// "07.07.2026, 07:18 UTC" — mirrors fmtDateTimeUtc() in src/utils/dateHelpers.ts.
function fmtDateTimeUtc(iso: string): string {
  const dt = new Date(iso);
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const hh = String(dt.getUTCHours()).padStart(2, '0');
  const min = String(dt.getUTCMinutes()).padStart(2, '0');
  return `${dd}.${mm}.${dt.getUTCFullYear()}, ${hh}:${min} UTC`;
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
  const now = Date.now();
  const nowIso = new Date(now).toISOString();

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

    const lastUpdatedMs = new Date(a.lastUpdated).getTime();
    const deadlineMs = lastUpdatedMs + REMINDER_WINDOW_MS;
    if (now < deadlineMs) continue;

    // Already emailed for this cycle? (lastUpdated hasn't changed since the last send)
    if (a.reminderEmailSentAt && new Date(a.reminderEmailSentAt).getTime() >= lastUpdatedMs) continue;

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
      lastUpdated: fmtDateTimeUtc(a.lastUpdated),
      daysOverdue: String(Math.floor((now - deadlineMs) / 86400000)),
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
      await doc.ref.update({ reminderEmailSentAt: nowIso });
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
        text: `The 30-day reminder sweep sent ${sent} email(s) out of ${snapshot.size} applicant record(s) checked.`,
      });
    } catch (err) {
      logger.error('Failed to send admin digest email', err);
    }
  }

  logger.info(`Reminder sweep complete: ${sent} email(s) sent.`);
  return { sent, checked: snapshot.size };
}

// Runs every 15 minutes (rather than once a day) so the email goes out
// close to the exact moment the 30-day countdown reaches zero, not up to a
// day late. There's no per-document scheduling here — this is a polling
// sweep, so "close to" means within one 15-minute window, not the exact
// second.
export const sendReminderEmails = onSchedule(
  {
    schedule: '*/15 * * * *',
    secrets: [GMAIL_USER, GMAIL_APP_PASSWORD],
  },
  async () => {
    await runReminderSweep();
  },
);

// Called once from the client right after a signed-in applicant is found to
// own no applicant record yet (see App.tsx). Runs with the Admin SDK
// (bypasses firestore.rules) specifically so it can look up an admin's
// precreated "ghost" record(s) by email — something an applicant's own
// client can never do, since firestore.rules only lets them read records
// whose uid field already matches their own. One person can legitimately
// own MORE THAN ONE application record (e.g. a separate Student visa
// application and Opportunity Card application under the same email), so
// this claims EVERY unclaimed ghost matching the email — no merging into a
// single doc, no deleting — rather than picking just one. Idempotent: a
// returning login that already owns at least one record does nothing.
export const linkApplicantAccount = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in.');
  const uid = request.auth.uid;
  const email = (request.auth.token.email || '').toLowerCase();
  const name = (request.auth.token.name as string | undefined) || '';
  const db = getFirestore();

  const owned = await db.collection('applicants').where('uid', '==', uid).limit(1).get();
  if (!owned.empty) return { claimed: 0 };

  let claimed = 0;
  if (email) {
    const matches = await db.collection('applicants').where('email', '==', email).get();
    const ghosts = matches.docs.filter(d => !d.data().uid);
    for (const ghost of ghosts) {
      await ghost.ref.update({ uid, name: ghost.data().name || name });
      claimed++;
    }
    if (claimed > 0) logger.info(`Claimed ${claimed} ghost record(s) for ${uid} (${email})`);
  }

  if (claimed === 0) {
    await db.collection('applicants').add({
      uid, email, name,
      serialNo: '', created: '', submitted: '', notes: '',
      lastUpdated: new Date().toISOString().slice(0, 10),
      reminderMailSent: 'Not yet',
    });
  }

  return { claimed };
});
