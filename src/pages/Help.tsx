import { useEffect, useRef, useState } from 'react';
import { Pencil, Mail, Landmark, ArrowRight, Plus, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import RichTextToolbar from '../components/RichTextToolbar';
import { subscribeHelp, saveHelp, DEFAULT_HELP } from '../services/siteContentService';
import { renderSectionBody } from '../utils/richText';
import type { AppRole } from '../constants/roles';
import type { HelpInfo, HelpLink } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface HelpProps {
  role: AppRole;
}

export default function Help({ role }: HelpProps) {
  const { t } = useLanguage();
  const isAdmin = role === 'admin';
  const [help, setHelp] = useState<HelpInfo>(DEFAULT_HELP);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<HelpInfo>(DEFAULT_HELP);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const removingEntryRef = useRef<HTMLTextAreaElement>(null);
  const emailDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const embassyAddressRef = useRef<HTMLTextAreaElement>(null);
  const embassyDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const communityDescriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => subscribeHelp(setHelp), []);

  function startEdit() {
    setDraft(help);
    setSaveError('');
    setEditing(true);
  }

  async function save() {
    setSaving(true);
    setSaveError('');
    try {
      await saveHelp(draft);
      setEditing(false);
    } catch (err) {
      console.error('saveHelp failed', err);
      setSaveError('Could not save — check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  function updateCommunityLink(i: number, patch: Partial<HelpLink>) {
    setDraft(d => ({ ...d, communityLinks: d.communityLinks.map((l, idx) => idx === i ? { ...l, ...patch } : l) }));
  }
  function addCommunityLink() {
    setDraft(d => ({ ...d, communityLinks: [...d.communityLinks, { label: '', url: '' }] }));
  }
  function removeCommunityLink(i: number) {
    setDraft(d => ({ ...d, communityLinks: d.communityLinks.filter((_, idx) => idx !== i) }));
  }

  return (
    <>
      <PageHeader
        title={t('help.title')}
        subtitle={help.subtitle}
        actions={isAdmin && !editing ? (
          <button className="app-btn app-btn-ghost app-btn-sm" onClick={startEdit}><Pencil size={14} /> {t('common.edit')}</button>
        ) : undefined}
      />
      <div className="app-content">
        {editing ? (
          <div className="app-card app-card-pad">
            <div className="app-field">
              <label>Page subtitle</label>
              <input className="app-input" value={draft.subtitle} onChange={e => setDraft({ ...draft, subtitle: e.target.value })} placeholder="Found a bug? Have a question or feedback? Reach out." />
            </div>

            <div className="app-field">
              <label>{t('help.supportEmailLabel')}</label>
              <input className="app-input" type="email" value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} placeholder="help@example.com" />
            </div>
            <div className="app-field">
              <label>Email description</label>
              <RichTextToolbar textareaRef={emailDescriptionRef} onChange={emailDescription => setDraft({ ...draft, emailDescription })} />
              <textarea ref={emailDescriptionRef} className="app-textarea" value={draft.emailDescription} onChange={e => setDraft({ ...draft, emailDescription: e.target.value })} style={{ minHeight: 60 }} />
            </div>

            <div className="app-field">
              <label>Germany Embassy support email</label>
              <input className="app-input" type="email" value={draft.embassyEmail} onChange={e => setDraft({ ...draft, embassyEmail: e.target.value })} placeholder="info@dhaka.diplo.de" />
            </div>
            <div className="app-field">
              <label>Germany Embassy address</label>
              <RichTextToolbar textareaRef={embassyAddressRef} onChange={embassyAddress => setDraft({ ...draft, embassyAddress })} />
              <textarea ref={embassyAddressRef} className="app-textarea" value={draft.embassyAddress} onChange={e => setDraft({ ...draft, embassyAddress: e.target.value })} style={{ minHeight: 60 }} placeholder="Address of the German Embassy" />
            </div>
            <div className="app-field">
              <label>Embassy card description</label>
              <RichTextToolbar textareaRef={embassyDescriptionRef} onChange={embassyDescription => setDraft({ ...draft, embassyDescription })} />
              <textarea ref={embassyDescriptionRef} className="app-textarea" value={draft.embassyDescription} onChange={e => setDraft({ ...draft, embassyDescription: e.target.value })} style={{ minHeight: 60 }} />
            </div>

            <div className="app-field">
              <label>Section title</label>
              <input className="app-input" value={draft.removingEntryTitle} onChange={e => setDraft({ ...draft, removingEntryTitle: e.target.value })} placeholder="Removing an entry" />
            </div>
            <div className="app-field">
              <label>Section content</label>
              <RichTextToolbar textareaRef={removingEntryRef} onChange={removingEntryBody => setDraft({ ...draft, removingEntryBody })} />
              <textarea
                ref={removingEntryRef}
                className="app-textarea"
                value={draft.removingEntryBody}
                onChange={e => setDraft({ ...draft, removingEntryBody: e.target.value })}
                placeholder="How someone can ask you to remove or correct an entry."
                style={{ minHeight: 100 }}
              />
            </div>

            <div className="app-field">
              <label>Community description</label>
              <RichTextToolbar textareaRef={communityDescriptionRef} onChange={communityDescription => setDraft({ ...draft, communityDescription })} />
              <textarea ref={communityDescriptionRef} className="app-textarea" value={draft.communityDescription} onChange={e => setDraft({ ...draft, communityDescription: e.target.value })} style={{ minHeight: 60 }} />
            </div>
            <div className="app-field">
              <label>Community links</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {draft.communityLinks.map((link, i) => (
                  <div key={i} className="app-card app-card-pad" style={{ position: 'relative' }}>
                    <button type="button" className="app-icon-btn" style={{ position: 'absolute', top: 8, right: 8 }} onClick={() => removeCommunityLink(i)} aria-label="Remove link">
                      <X size={14} />
                    </button>
                    <input
                      className="app-input"
                      value={link.label}
                      onChange={e => updateCommunityLink(i, { label: e.target.value })}
                      placeholder="Link title, e.g. Facebook group"
                      style={{ marginBottom: 8, fontWeight: 600 }}
                    />
                    <input
                      className="app-input"
                      value={link.url}
                      onChange={e => updateCommunityLink(i, { url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                ))}
              </div>
              <button type="button" className="app-btn app-btn-ghost app-btn-sm" style={{ marginTop: 10 }} onClick={addCommunityLink}>
                <Plus size={14} /> Add link
              </button>
            </div>

            {saveError && <div style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 10 }}>{saveError}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="app-btn app-btn-ghost app-btn-sm" onClick={() => setEditing(false)} disabled={saving}>{t('common.cancel')}</button>
              <button className="app-btn app-btn-primary app-btn-sm" onClick={save} disabled={saving}>{saving ? t('common.saving') : t('common.save')}</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {help.email && (
              <div className="app-card app-card-pad">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <Mail size={16} color="var(--violet)" />
                  <div className="app-card-title">{t('help.email')}</div>
                </div>
                {help.emailDescription && (
                  <div
                    className="app-section-body"
                    style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 14 }}
                    dangerouslySetInnerHTML={{ __html: renderSectionBody(help.emailDescription) }}
                  />
                )}
                <a href={`mailto:${help.email}`} className="app-btn app-btn-primary app-btn-block">{help.email}</a>
              </div>
            )}

            {(help.embassyEmail || help.embassyAddress) && (
              <div className="app-card app-card-pad">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <Landmark size={16} color="var(--violet)" />
                  <div className="app-card-title">Germany Embassy</div>
                </div>
                {help.embassyDescription && (
                  <div
                    className="app-section-body"
                    style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 14 }}
                    dangerouslySetInnerHTML={{ __html: renderSectionBody(help.embassyDescription) }}
                  />
                )}
                {help.embassyAddress && (
                  <div
                    className="app-section-body"
                    style={{ fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.6, marginBottom: 14 }}
                    dangerouslySetInnerHTML={{ __html: renderSectionBody(help.embassyAddress) }}
                  />
                )}
                {help.embassyEmail && (
                  <a href={`mailto:${help.embassyEmail}`} className="app-btn app-btn-primary app-btn-block">{help.embassyEmail}</a>
                )}
              </div>
            )}

            {help.removingEntryBody && (
              <div>
                <div className="app-card-title" style={{ marginBottom: 8 }}>{help.removingEntryTitle}</div>
                <div
                  className="app-section-body"
                  style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--ink)' }}
                  dangerouslySetInnerHTML={{ __html: renderSectionBody(help.removingEntryBody) }}
                />
              </div>
            )}

            {help.communityLinks.length > 0 && (
              <div>
                <div className="app-card-title" style={{ marginBottom: 8 }}>{t('help.community')}</div>
                {help.communityDescription && (
                  <div
                    className="app-section-body"
                    style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 12 }}
                    dangerouslySetInnerHTML={{ __html: renderSectionBody(help.communityDescription) }}
                  />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {help.communityLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="app-card app-card-pad"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', color: 'inherit' }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{link.label}</div>
                      <ArrowRight size={16} color="var(--violet)" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {!help.email && !help.embassyEmail && !help.embassyAddress && !help.removingEntryBody && help.communityLinks.length === 0 && (
              <div className="app-card app-card-pad">
                <div className="app-empty">{isAdmin ? t('help.emptyAdmin') : t('help.emptyApplicant')}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
