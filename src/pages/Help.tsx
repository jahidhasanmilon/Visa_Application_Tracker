import { useEffect, useRef, useState } from 'react';
import { Pencil, MessageCircle, Mail } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import RichTextToolbar from '../components/RichTextToolbar';
import { subscribeHelp, saveHelp } from '../services/siteContentService';
import { renderSectionBody } from '../utils/richText';
import type { AppRole } from '../constants/roles';
import type { HelpInfo } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

const EMPTY: HelpInfo = { whatsappLink: '', email: '', notes: '' };

interface HelpProps {
  role: AppRole;
}

export default function Help({ role }: HelpProps) {
  const { t } = useLanguage();
  const [help, setHelp] = useState<HelpInfo>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<HelpInfo>(EMPTY);
  const [saving, setSaving] = useState(false);
  const notesRef = useRef<HTMLTextAreaElement>(null);

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
        title={t('help.title')}
        subtitle={t('help.subtitle')}
        actions={role === 'admin' && !editing ? (
          <button className="app-btn app-btn-ghost app-btn-sm" onClick={startEdit}><Pencil size={14} /> {t('common.edit')}</button>
        ) : undefined}
      />
      <div className="app-content">
        {editing ? (
          <div className="app-card app-card-pad">
            <div className="app-field">
              <label>{t('help.whatsappLinkLabel')}</label>
              <input className="app-input" value={draft.whatsappLink} onChange={e => setDraft({ ...draft, whatsappLink: e.target.value })} placeholder="https://chat.whatsapp.com/..." />
              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 6 }}>
                {t('help.whatsappLinkHint')}
              </div>
            </div>
            <div className="app-field">
              <label>{t('help.supportEmailLabel')}</label>
              <input className="app-input" type="email" value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} placeholder="help@example.com" />
            </div>
            <div className="app-field">
              <label>{t('help.notes')}</label>
              <RichTextToolbar textareaRef={notesRef} onChange={notes => setDraft({ ...draft, notes })} />
              <textarea
                ref={notesRef}
                className="app-textarea"
                value={draft.notes}
                onChange={e => setDraft({ ...draft, notes: e.target.value })}
                placeholder={t('help.notesPlaceholder')}
                style={{ minHeight: 140 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="app-btn app-btn-ghost app-btn-sm" onClick={() => setEditing(false)} disabled={saving}>{t('common.cancel')}</button>
              <button className="app-btn app-btn-primary app-btn-sm" onClick={save} disabled={saving}>{saving ? t('common.saving') : t('common.save')}</button>
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
                  <div className="app-card-title">{t('help.joinWhatsapp')}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{t('help.chatDirectly')}</div>
                </div>
              </a>
            )}
            {help.email && (
              <div className="app-card app-card-pad">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <Mail size={16} color="var(--violet)" />
                  <div className="app-card-title">{t('help.email')}</div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 14px' }}>{t('help.emailForSupport')}</p>
                <a href={`mailto:${help.email}`} className="app-btn app-btn-primary app-btn-block">{help.email}</a>
              </div>
            )}
            {help.notes && (
              <div className="app-card app-card-pad">
                <div
                  className="app-section-body"
                  style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--ink)' }}
                  dangerouslySetInnerHTML={{ __html: renderSectionBody(help.notes) }}
                />
              </div>
            )}
            {!help.whatsappLink && !help.email && !help.notes && (
              <div className="app-card app-card-pad">
                <div className="app-empty">{role === 'admin' ? t('help.emptyAdmin') : t('help.emptyApplicant')}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
