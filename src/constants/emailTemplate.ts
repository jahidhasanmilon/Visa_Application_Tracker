import type { EmailTemplate } from '../types';

// Mirrors the default in functions/src/index.ts — keep both in sync.
export const DEFAULT_EMAIL_TEMPLATE: EmailTemplate = {
  subject: 'Application Reminder (30-Day): {{name}} — {{serialNo}}',
  body: `The 30-day follow-up window has passed for this application.

Name: {{name}}
Serial No: {{serialNo}}
Status: {{status}}
Last updated: {{lastUpdated}}
Days overdue: {{daysOverdue}}

Please review and follow up.`,
};

export const EMAIL_TEMPLATE_PLACEHOLDERS = ['{{name}}', '{{serialNo}}', '{{status}}', '{{lastUpdated}}', '{{daysOverdue}}'];
