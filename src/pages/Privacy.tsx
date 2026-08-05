import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { subscribePrivacy, savePrivacy } from '../services/siteContentService';
import { useAuth } from '../hooks/useAuth';

const FALLBACK_PRIVACY = 'Content coming soon.';

// Reachable from /login (signed out) as well as /app — resolves its own
// admin status via useAuth() instead of taking a role prop, since it's
// mounted from the shared publicRoutes block in App.tsx.
export default function Privacy() {
  const { role } = useAuth();
  const [body, setBody] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribePrivacy(setBody), []);

  function startEdit() {
    setDraft(body || '');
    setEditing(true);
  }

  async function save() {
    setSaving(true);
    try {
      await savePrivacy(draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Privacy & Terms"
        actions={role === 'admin' && !editing ? (
          <button className="app-btn app-btn-ghost app-btn-sm" onClick={startEdit}><Pencil size={14} /> Edit</button>
        ) : undefined}
      />
      <div className="app-content">
        <div className="app-card app-card-pad">
          {editing ? (
            <>
              <textarea className="app-textarea" value={draft} onChange={e => setDraft(e.target.value)} style={{ minHeight: 260 }} placeholder="Privacy policy and terms of use…" />
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="app-btn app-btn-ghost app-btn-sm" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
                <button className="app-btn app-btn-primary app-btn-sm" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>
              {body === null ? '' : (body || FALLBACK_PRIVACY)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
