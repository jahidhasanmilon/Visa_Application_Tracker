import { useEffect, useState } from 'react';
import { Pencil, MessageCircle, Mail } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { subscribeHelp, saveHelp } from '../services/siteContentService';
import type { AppRole } from '../constants/roles';
import type { HelpInfo } from '../types';

const EMPTY: HelpInfo = { whatsappLink: '', email: '', notes: '' };

interface HelpProps {
  role: AppRole;
}

export default function Help({ role }: HelpProps) {
  const [help, setHelp] = useState<HelpInfo>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<HelpInfo>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeHelp(setHelp), []);

  function startEdit() {
    setDraft(help);
    setEditing(true);
  }

  async function save() {
    setSaving(true);
    try {
      await saveHelp(draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Help"
        subtitle="How to reach the community and get support."
        actions={role === 'admin' && !editing ? (
          <button className="app-btn app-btn-ghost app-btn-sm" onClick={startEdit}><Pencil size={14} /> Edit</button>
        ) : undefined}
      />
      <div className="app-content">
        {editing ? (
          <div className="app-card app-card-pad">
            <div className="app-field">
              <label>WhatsApp group link</label>
              <input className="app-input" value={draft.whatsappLink} onChange={e => setDraft({ ...draft, whatsappLink: e.target.value })} placeholder="https://chat.whatsapp.com/..." />
              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 6 }}>
                The floating WhatsApp button only appears once this is set.
              </div>
            </div>
            <div className="app-field">
              <label>Support email</label>
              <input className="app-input" type="email" value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} placeholder="help@example.com" />
            </div>
            <div className="app-field">
              <label>Notes</label>
              <textarea className="app-textarea" value={draft.notes} onChange={e => setDraft({ ...draft, notes: e.target.value })} placeholder="Anything else applicants should know about getting help." style={{ minHeight: 120 }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="app-btn app-btn-ghost app-btn-sm" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
              <button className="app-btn app-btn-primary app-btn-sm" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {help.whatsappLink && (
              <a href={help.whatsappLink} target="_blank" rel="noreferrer" className="app-card app-card-pad" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', color: 'inherit' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#25D36622', color: '#25D366' }}>
                  <MessageCircle size={18} />
                </div>
                <div>
                  <div className="app-card-title">Join the WhatsApp group</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>Chat with the community directly</div>
                </div>
              </a>
            )}
            {help.email && (
              <a href={`mailto:${help.email}`} className="app-card app-card-pad" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', color: 'inherit' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--violet-soft)', color: 'var(--violet)' }}>
                  <Mail size={18} />
                </div>
                <div>
                  <div className="app-card-title">{help.email}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>Email for support</div>
                </div>
              </a>
            )}
            {help.notes && (
              <div className="app-card app-card-pad">
                <div className="app-card-title" style={{ marginBottom: 8 }}>Notes</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>{help.notes}</div>
              </div>
            )}
            {!help.whatsappLink && !help.email && !help.notes && (
              <div className="app-card app-card-pad">
                <div className="app-empty">{role === 'admin' ? 'Nothing set yet — click Edit to add a WhatsApp link, email, or notes.' : 'No contact info published yet.'}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
