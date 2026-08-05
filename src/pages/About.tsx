import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { subscribeAbout, saveAbout } from '../services/siteContentService';
import type { AppRole } from '../constants/roles';

const FALLBACK_ABOUT = `VisaTrack helps this community track Germany Opportunity Card applications — from preparing your documents through to the day you land.

Built by and for the group, not an official service.`;

interface AboutProps {
  role: AppRole;
}

export default function About({ role }: AboutProps) {
  const [body, setBody] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeAbout(setBody), []);

  function startEdit() {
    setDraft(body || FALLBACK_ABOUT);
    setEditing(true);
  }

  async function save() {
    setSaving(true);
    try {
      await saveAbout(draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="About"
        subtitle="What VisaTrack is, and who it's for."
        actions={role === 'admin' && !editing ? (
          <button className="app-btn app-btn-ghost app-btn-sm" onClick={startEdit}><Pencil size={14} /> Edit</button>
        ) : undefined}
      />
      <div className="app-content">
        <div className="app-card app-card-pad">
          {editing ? (
            <>
              <textarea className="app-textarea" value={draft} onChange={e => setDraft(e.target.value)} style={{ minHeight: 220 }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="app-btn app-btn-ghost app-btn-sm" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
                <button className="app-btn app-btn-primary app-btn-sm" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>
              {body === null ? '' : (body || FALLBACK_ABOUT)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
