import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { subscribeHelp, saveHelp } from '../../services/siteContentService';
import type { HelpInfo } from '../../types';

const EMPTY: HelpInfo = { whatsappLink: '', email: '', notes: '' };

export default function AdminHelp() {
  const [help, setHelp] = useState<HelpInfo>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => subscribeHelp(setHelp), []);

  async function handleSave() {
    setSaving(true);
    try {
      await saveHelp(help);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Help" subtitle="How applicants reach the community — shown as a floating WhatsApp button everywhere." />
      <div className="app-content">
        <div className="app-card app-card-pad">
          <div className="app-field">
            <label>WhatsApp group link</label>
            <input className="app-input" value={help.whatsappLink} onChange={e => setHelp({ ...help, whatsappLink: e.target.value })} placeholder="https://chat.whatsapp.com/..." />
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 6 }}>
              The floating WhatsApp button only appears once this is set.
            </div>
          </div>
          <div className="app-field">
            <label>Support email</label>
            <input className="app-input" type="email" value={help.email} onChange={e => setHelp({ ...help, email: e.target.value })} placeholder="help@example.com" />
          </div>
          <div className="app-field">
            <label>Notes</label>
            <textarea className="app-textarea" value={help.notes} onChange={e => setHelp({ ...help, notes: e.target.value })} placeholder="Anything else applicants should know about getting help." style={{ minHeight: 120 }} />
          </div>
          <button className="app-btn app-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
          </button>
        </div>
      </div>
    </>
  );
}
