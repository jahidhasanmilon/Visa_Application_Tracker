import { useEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import RichTextToolbar from '../components/RichTextToolbar';
import { subscribePrivacy, savePrivacy, DEFAULT_PRIVACY } from '../services/siteContentService';
import { renderSectionBody } from '../utils/richText';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../i18n/LanguageContext';
import type { PrivacyContent } from '../types';

type Tab = 'privacy' | 'terms';

// Reachable from /login (signed out) as well as /app — resolves its own
// admin status via useAuth() instead of taking a role prop, since it's
// mounted from the shared publicRoutes block in App.tsx.
export default function Privacy() {
  const { t } = useLanguage();
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const [content, setContent] = useState<PrivacyContent>(DEFAULT_PRIVACY);
  const [tab, setTab] = useState<Tab>('privacy');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<PrivacyContent>(DEFAULT_PRIVACY);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => subscribePrivacy(setContent), []);

  function startEdit() {
    setDraft(content);
    setSaveError('');
    setEditing(true);
  }

  async function save() {
    setSaving(true);
    setSaveError('');
    try {
      await savePrivacy(draft);
      setEditing(false);
    } catch (err) {
      console.error('savePrivacy failed', err);
      setSaveError('Could not save — check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  const activeBody = tab === 'privacy' ? content.privacyBody : content.termsBody;
  const draftBody = tab === 'privacy' ? draft.privacyBody : draft.termsBody;

  function setDraftBody(value: string) {
    setDraft(d => tab === 'privacy' ? { ...d, privacyBody: value } : { ...d, termsBody: value });
  }

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title={t('privacy.title')}
        subtitle={t('privacy.subtitle')}
        actions={isAdmin && !editing ? (
          <button className="app-btn app-btn-ghost app-btn-sm" onClick={startEdit}><Pencil size={14} /> {t('common.edit')}</button>
        ) : undefined}
      />
      <div className="app-content">
        {editing && (
          <div className="app-field" style={{ maxWidth: 260, margin: 0 }}>
            <label>Last updated <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(shown at the top)</span></label>
            <input className="app-input" value={draft.lastUpdated} onChange={e => setDraft({ ...draft, lastUpdated: e.target.value })} placeholder="e.g. May 2026" />
          </div>
        )}
        {!editing && content.lastUpdated && (
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)' }}>
            Last updated: {content.lastUpdated}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="app-btn app-btn-sm"
            style={{
              background: tab === 'privacy' ? 'var(--violet-soft)' : 'var(--surface)',
              color: tab === 'privacy' ? 'var(--violet)' : 'var(--ink)',
              border: '1px solid var(--border)',
            }}
            onClick={() => setTab('privacy')}
          >
            Privacy policy
          </button>
          <button
            type="button"
            className="app-btn app-btn-sm"
            style={{
              background: tab === 'terms' ? 'var(--violet-soft)' : 'var(--surface)',
              color: tab === 'terms' ? 'var(--violet)' : 'var(--ink)',
              border: '1px solid var(--border)',
            }}
            onClick={() => setTab('terms')}
          >
            Terms &amp; conditions
          </button>
        </div>

        <div className="app-card app-card-pad">
          {editing ? (
            <>
              <RichTextToolbar textareaRef={textareaRef} onChange={setDraftBody} />
              <textarea
                ref={textareaRef}
                className="app-textarea"
                value={draftBody}
                onChange={e => setDraftBody(e.target.value)}
                style={{ minHeight: 320 }}
                placeholder={tab === 'privacy' ? 'Privacy policy…' : 'Terms & conditions…'}
              />
              {saveError && <div style={{ color: 'var(--danger)', fontSize: 12.5, marginTop: 10 }}>{saveError}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="app-btn app-btn-ghost app-btn-sm" onClick={() => setEditing(false)} disabled={saving}>{t('common.cancel')}</button>
                <button className="app-btn app-btn-primary app-btn-sm" onClick={save} disabled={saving}>{saving ? t('common.saving') : t('common.save')}</button>
              </div>
            </>
          ) : activeBody ? (
            <div
              className="app-section-body"
              style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink)' }}
              dangerouslySetInnerHTML={{ __html: renderSectionBody(activeBody) }}
            />
          ) : (
            <div className="app-empty">Content coming soon.</div>
          )}
        </div>
      </div>
    </>
  );
}
