import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import type { EmailTemplate } from '../../types';
import { subscribeEmailTemplate, saveEmailTemplate } from '../../services/emailTemplateService';
import { DEFAULT_EMAIL_TEMPLATE, EMAIL_TEMPLATE_PLACEHOLDERS } from '../../constants/emailTemplate';

export default function AdminReminderEmail() {
  const [template, setTemplate] = useState<EmailTemplate>(DEFAULT_EMAIL_TEMPLATE);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => subscribeEmailTemplate(t => { if (t) setTemplate(t); }), []);

  async function handleSave() {
    setSaving(true);
    try {
      await saveEmailTemplate(template);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Reminder Email" subtitle="Customize the 30-day reminder email sent to admin and applicants." />
      <div className="app-content">
        <div className="app-card app-card-pad">
          <div className="app-card-head">
            <div className="app-card-title">Reminder email template</div>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: -8, marginBottom: 14 }}>
            Sent automatically once a 30-day reminder is overdue. Placeholders: {EMAIL_TEMPLATE_PLACEHOLDERS.join(', ')}
          </p>
          <div className="app-field">
            <label>Subject</label>
            <input className="app-input" value={template.subject} onChange={e => setTemplate({ ...template, subject: e.target.value })} />
          </div>
          <div className="app-field">
            <label>Body</label>
            <textarea
              className="app-textarea"
              style={{ minHeight: 220, fontFamily: 'inherit' }}
              value={template.body}
              onChange={e => setTemplate({ ...template, body: e.target.value })}
            />
          </div>
          <button className="app-btn app-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save template'}
          </button>
        </div>
      </div>
    </>
  );
}
