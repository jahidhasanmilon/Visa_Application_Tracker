import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { Pencil, Plus, X, Trash2, ArrowUp, ArrowDown, ArrowRight, Sparkles, Handshake, Users } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import CustomSectionForm from '../components/CustomSectionForm';
import { subscribeAbout, saveAbout, DEFAULT_ABOUT, saveAboutCustomSections, saveAboutSectionOrder } from '../services/siteContentService';
import { subscribeTeam, addTeamMember, updateTeamMember, deleteTeamMember, type TeamMemberFormData } from '../services/teamService';
import { useAboutSectionOrder } from '../hooks/useAboutSectionOrder';
import { useAboutCustomSections } from '../hooks/useCustomSections';
import { useAboutHiddenSections } from '../hooks/useHiddenSections';
import { mergeSectionOrder } from '../utils/sectionOrder';
import { renderSectionBody } from '../utils/richText';
import { DEFAULT_ABOUT_SECTION_ORDER, type AboutSectionKey } from '../constants/aboutSections';
import type { AppRole } from '../constants/roles';
import type { AboutContent, AboutPartnerLink, TeamMember } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface AboutProps {
  role: AppRole;
}

const EMPTY_MEMBER: TeamMemberFormData = { name: '', role: '', bio: '', linkedinUrl: '', order: 0 };

export default function About({ role }: AboutProps) {
  const { t } = useLanguage();
  const isAdmin = role === 'admin';

  const [content, setContent] = useState<AboutContent>(DEFAULT_ABOUT);
  const [team, setTeam] = useState<TeamMember[] | null>(null);

  useEffect(() => subscribeAbout(setContent), []);
  useEffect(() => subscribeTeam(setTeam), []);

  // ---- Story + timeline editing (single block, saved together) ----
  const [editingStory, setEditingStory] = useState(false);
  const [draft, setDraft] = useState<AboutContent>(DEFAULT_ABOUT);
  const [savingStory, setSavingStory] = useState(false);
  const [storyError, setStoryError] = useState('');

  function startEditStory() {
    setDraft(content);
    setStoryError('');
    setEditingStory(true);
  }

  async function saveStory() {
    setSavingStory(true);
    setStoryError('');
    try {
      await saveAbout(draft);
      setEditingStory(false);
    } catch (err) {
      console.error('saveAbout failed', err);
      setStoryError('Could not save — check your connection and try again.');
    } finally {
      setSavingStory(false);
    }
  }

  function updateTimelineItem(i: number, patch: Partial<{ heading: string; body: string }>) {
    setDraft(d => ({ ...d, timeline: d.timeline.map((it, idx) => idx === i ? { ...it, ...patch } : it) }));
  }
  function addTimelineItem() {
    setDraft(d => ({ ...d, timeline: [...d.timeline, { heading: '', body: '' }] }));
  }
  function removeTimelineItem(i: number) {
    setDraft(d => ({ ...d, timeline: d.timeline.filter((_, idx) => idx !== i) }));
  }

  function updatePartnerLink(i: number, patch: Partial<AboutPartnerLink>) {
    setDraft(d => ({ ...d, partnerLinks: d.partnerLinks.map((l, idx) => idx === i ? { ...l, ...patch } : l) }));
  }
  function addPartnerLink() {
    setDraft(d => ({ ...d, partnerLinks: [...d.partnerLinks, { label: '', description: '', url: '' }] }));
  }
  function removePartnerLink(i: number) {
    setDraft(d => ({ ...d, partnerLinks: d.partnerLinks.filter((_, idx) => idx !== i) }));
  }

  // ---- Team CRUD ----
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState(EMPTY_MEMBER);
  const [confirmDeleteMemberId, setConfirmDeleteMemberId] = useState<string | null>(null);
  const [memberSaving, setMemberSaving] = useState(false);
  const [memberError, setMemberError] = useState('');

  function openAddMember() {
    setMemberForm({ ...EMPTY_MEMBER, order: (team?.length ?? 0) + 1 });
    setEditingMemberId(null);
    setMemberError('');
    setMemberModalOpen(true);
  }
  function openEditMember(m: TeamMember) {
    setMemberForm({ name: m.name, role: m.role, bio: m.bio, linkedinUrl: m.linkedinUrl, order: m.order });
    setEditingMemberId(m.id);
    setMemberError('');
    setMemberModalOpen(true);
  }
  async function saveMember() {
    if (!memberForm.name.trim()) return;
    setMemberSaving(true);
    setMemberError('');
    try {
      if (editingMemberId) await updateTeamMember(editingMemberId, memberForm);
      else await addTeamMember(memberForm);
      setMemberModalOpen(false);
    } catch (err) {
      console.error('Team member save failed', err);
      setMemberError(err instanceof Error ? err.message : 'Could not save — check your connection and try again.');
    } finally {
      setMemberSaving(false);
    }
  }
  async function doDeleteMember(id: string) {
    try {
      await deleteTeamMember(id);
    } catch (err) {
      console.error('Team member delete failed', err);
    } finally {
      setConfirmDeleteMemberId(null);
    }
  }
  async function moveMember(index: number, dir: -1 | 1) {
    if (!team) return;
    const target = index + dir;
    if (target < 0 || target >= team.length) return;
    const a = team[index], b = team[target];
    try {
      await Promise.all([
        updateTeamMember(a.id, { name: a.name, role: a.role, bio: a.bio, linkedinUrl: a.linkedinUrl, order: b.order }),
        updateTeamMember(b.id, { name: b.name, role: b.role, bio: b.bio, linkedinUrl: b.linkedinUrl, order: a.order }),
      ]);
    } catch (err) {
      console.error('Team member reorder failed', err);
    }
  }

  const savedSectionOrder = useAboutSectionOrder();
  const customSections = useAboutCustomSections();
  const hiddenKeys = useAboutHiddenSections();
  const customById = new Map((customSections ?? []).map(s => [s.id, s]));
  // fullOrder (including hidden entries) is what gets saved back when a
  // custom section is deleted — sectionOrder (rendered on the page) drops
  // whatever's currently hidden.
  const fullOrder: string[] = mergeSectionOrder(savedSectionOrder, DEFAULT_ABOUT_SECTION_ORDER, [...customById.keys()]);
  const sectionOrder: string[] = fullOrder.filter(k => !hiddenKeys.includes(k));

  // ---- Custom section editing (admin add/edit/remove right on the page) ----
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [customSaving, setCustomSaving] = useState(false);

  function startEditCustom(id: string) {
    const s = customById.get(id);
    if (!s) return;
    setEditingCustomId(id);
    setCustomTitle(s.title);
    setCustomBody(s.body);
  }

  async function saveEditCustom() {
    const title = customTitle.trim();
    if (!title || !editingCustomId) return;
    setCustomSaving(true);
    try {
      await saveAboutCustomSections((customSections ?? []).map(s => s.id === editingCustomId ? { ...s, title, body: customBody } : s));
      setEditingCustomId(null);
    } finally {
      setCustomSaving(false);
    }
  }

  async function removeCustomSection(id: string) {
    if (!confirm('Remove this section from the About page?')) return;
    await saveAboutCustomSections((customSections ?? []).filter(s => s.id !== id));
    await saveAboutSectionOrder(fullOrder.filter(k => k !== id));
  }

  const storySection: ReactNode = (
        <div className="app-card app-card-pad">
          {editingStory ? (
            <>
              <div className="app-field">
                <label>Subtitle</label>
                <input className="app-input" value={draft.subtitle} onChange={e => setDraft({ ...draft, subtitle: e.target.value })} placeholder="Why this exists, who built it, and how it grew." />
              </div>
              <div className="app-field">
                <label>Story heading</label>
                <input className="app-input" value={draft.storyHeading} onChange={e => setDraft({ ...draft, storyHeading: e.target.value })} placeholder="e.g. The chicken and egg" />
              </div>
              <div className="app-field">
                <label>Story intro</label>
                <textarea className="app-textarea" value={draft.storyIntro} onChange={e => setDraft({ ...draft, storyIntro: e.target.value })} style={{ minHeight: 80 }} />
              </div>
              <div className="app-field">
                <label>Timeline</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {draft.timeline.map((item, i) => (
                    <div key={i} className="app-card app-card-pad" style={{ position: 'relative' }}>
                      <button type="button" className="app-icon-btn" style={{ position: 'absolute', top: 8, right: 8 }} onClick={() => removeTimelineItem(i)} aria-label="Remove milestone">
                        <X size={14} />
                      </button>
                      <input
                        className="app-input"
                        value={item.heading}
                        onChange={e => updateTimelineItem(i, { heading: e.target.value })}
                        placeholder="Milestone heading"
                        style={{ marginBottom: 8, fontWeight: 600 }}
                      />
                      <textarea
                        className="app-textarea"
                        value={item.body}
                        onChange={e => updateTimelineItem(i, { body: e.target.value })}
                        placeholder="What happened at this point"
                        style={{ minHeight: 70 }}
                      />
                    </div>
                  ))}
                </div>
                <button type="button" className="app-btn app-btn-ghost app-btn-sm" style={{ marginTop: 10 }} onClick={addTimelineItem}>
                  <Plus size={14} /> Add milestone
                </button>
              </div>

              {storyError && <div style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 10 }}>{storyError}</div>}

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="app-btn app-btn-ghost app-btn-sm" onClick={() => setEditingStory(false)} disabled={savingStory}>{t('common.cancel')}</button>
                <button className="app-btn app-btn-primary app-btn-sm" onClick={saveStory} disabled={savingStory}>{savingStory ? t('common.saving') : t('common.save')}</button>
              </div>
            </>
          ) : (
            <>
              <div className="app-about-section-head">
                <div className="app-about-section-icon" style={{ background: 'var(--violet-soft)', color: 'var(--violet)' }}>
                  <Sparkles size={16} />
                </div>
                <div className="app-about-section-title">{content.storyHeading || 'Our story'}</div>
              </div>
              {content.storyIntro && (
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink)', whiteSpace: 'pre-wrap', margin: 0 }}>{content.storyIntro}</p>
              )}
              {content.timeline.length > 0 && (
                <div className="app-about-timeline">
                  {content.timeline.map((item, i) => (
                    <div key={i} className="app-about-timeline-item">
                      <div className="app-about-timeline-dot" />
                      <div className="app-about-timeline-num">{String(i + 1).padStart(2, '0')}</div>
                      <div className="app-about-timeline-heading">{item.heading}</div>
                      <div className="app-about-timeline-body">{item.body}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
  );

  const partnerSection: ReactNode = (editingStory || content.partnerName) ? (
          <div className="app-card app-card-pad">
            {editingStory ? (
              <>
                <div className="app-field">
                  <label>Section title</label>
                  <input className="app-input" value={draft.partnerTitle} onChange={e => setDraft({ ...draft, partnerTitle: e.target.value })} placeholder="Official partner" />
                </div>
                <div className="app-field">
                  <label>Organization name <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(leave blank to hide this section)</span></label>
                  <input className="app-input" value={draft.partnerName} onChange={e => setDraft({ ...draft, partnerName: e.target.value })} placeholder="e.g. Rubalif" />
                </div>
                <div className="app-field">
                  <label>Description</label>
                  <textarea className="app-textarea" value={draft.partnerDescription} onChange={e => setDraft({ ...draft, partnerDescription: e.target.value })} style={{ minHeight: 70 }} />
                </div>
                <div className="app-field">
                  <label>Links</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {draft.partnerLinks.map((link, i) => (
                      <div key={i} className="app-card app-card-pad" style={{ position: 'relative' }}>
                        <button type="button" className="app-icon-btn" style={{ position: 'absolute', top: 8, right: 8 }} onClick={() => removePartnerLink(i)} aria-label="Remove link">
                          <X size={14} />
                        </button>
                        <input
                          className="app-input"
                          value={link.label}
                          onChange={e => updatePartnerLink(i, { label: e.target.value })}
                          placeholder="Link title, e.g. Facebook group"
                          style={{ marginBottom: 8, fontWeight: 600 }}
                        />
                        <input
                          className="app-input"
                          value={link.description}
                          onChange={e => updatePartnerLink(i, { description: e.target.value })}
                          placeholder="Short description"
                          style={{ marginBottom: 8 }}
                        />
                        <input
                          className="app-input"
                          value={link.url}
                          onChange={e => updatePartnerLink(i, { url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                    ))}
                  </div>
                  <button type="button" className="app-btn app-btn-ghost app-btn-sm" style={{ marginTop: 10 }} onClick={addPartnerLink}>
                    <Plus size={14} /> Add link
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="app-about-section-head" style={{ marginBottom: 8 }}>
                  <div className="app-about-section-icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent-ink)' }}>
                    <Handshake size={16} />
                  </div>
                  <div className="app-about-section-title">{content.partnerTitle}</div>
                </div>
                <div className="app-card-title" style={{ marginBottom: 8, marginLeft: 42 }}>{content.partnerName}</div>
                {content.partnerDescription && (
                  <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 14px' }}>{content.partnerDescription}</p>
                )}
                {content.partnerLinks.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {content.partnerLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="app-card app-card-pad"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', color: 'inherit' }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{link.label}</div>
                          {link.description && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{link.description}</div>}
                        </div>
                        <ArrowRight size={16} color="var(--accent)" />
                      </a>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
  ) : null;

  const teamSection: ReactNode = (
        <div>
          {editingStory && (
            <div className="app-field" style={{ maxWidth: 360 }}>
              <label>Team section title</label>
              <input className="app-input" value={draft.teamTitle} onChange={e => setDraft({ ...draft, teamTitle: e.target.value })} placeholder="The people behind the platform" />
            </div>
          )}
          <div className="app-card-head" style={{ marginBottom: 14 }}>
            <div className="app-about-section-head" style={{ marginBottom: 0 }}>
              <div className="app-about-section-icon" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                <Users size={16} />
              </div>
              <div className="app-about-section-title">{content.teamTitle}</div>
            </div>
            {isAdmin && (
              <button className="app-btn app-btn-ghost app-btn-sm" onClick={openAddMember}><Plus size={14} /> Add member</button>
            )}
          </div>
          {team === null ? (
            <div className="app-empty">{t('common.loading')}</div>
          ) : team.length === 0 ? (
            isAdmin ? (
              <div className="app-card app-card-pad"><div className="app-empty">No team members yet — add your first one.</div></div>
            ) : null
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              {team.map((m, i) => (
                <div key={m.id} className="app-card app-card-pad">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div className="app-about-avatar">{m.name.slice(0, 1).toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--violet)' }}>{m.role}</div>
                    </div>
                  </div>
                  {m.bio && <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 10px' }}>{m.bio}</p>}
                  {m.linkedinUrl && (
                    <a href={m.linkedinUrl} target="_blank" rel="noreferrer" className="app-card-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 800 }}>
                      Connect on LinkedIn <ArrowRight size={13} />
                    </a>
                  )}
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                      <button className="app-icon-btn" disabled={i === 0} onClick={() => moveMember(i, -1)} aria-label="Move up"><ArrowUp size={14} /></button>
                      <button className="app-icon-btn" disabled={i === team.length - 1} onClick={() => moveMember(i, 1)} aria-label="Move down"><ArrowDown size={14} /></button>
                      <button className="app-icon-btn" onClick={() => openEditMember(m)} aria-label="Edit member"><Pencil size={14} /></button>
                      {confirmDeleteMemberId === m.id ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="app-btn app-btn-danger app-btn-sm" onClick={() => doDeleteMember(m.id)}>Confirm</button>
                          <button className="app-btn app-btn-ghost app-btn-sm" onClick={() => setConfirmDeleteMemberId(null)}>Cancel</button>
                        </div>
                      ) : (
                        <button className="app-icon-btn" onClick={() => setConfirmDeleteMemberId(m.id)} aria-label="Delete member"><Trash2 size={14} /></button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
  );

  const sectionsByKey: Record<AboutSectionKey, ReactNode> = {
    story: storySection, partner: partnerSection, team: teamSection,
  };

  return (
    <>
      <PageHeader
        title={t('about.title')}
        subtitle={content.subtitle}
        actions={isAdmin && !editingStory ? (
          <button className="app-btn app-btn-ghost app-btn-sm" onClick={startEditStory}><Pencil size={14} /> {t('common.edit')}</button>
        ) : undefined}
      />
      <div className="app-content">
        {sectionOrder.map(key => {
          const custom = customById.get(key);
          return (
            <Fragment key={key}>
              {custom ? (
                editingCustomId === custom.id ? (
                  <CustomSectionForm
                    title={customTitle}
                    body={customBody}
                    onTitleChange={setCustomTitle}
                    onBodyChange={setCustomBody}
                    onSave={saveEditCustom}
                    onCancel={() => setEditingCustomId(null)}
                    saving={customSaving}
                    titlePlaceholder="Section title"
                  />
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div className="app-card-title" style={{ flex: 1 }}>{custom.title}</div>
                      {isAdmin && (
                        <>
                          <button type="button" className="app-icon-btn" onClick={() => startEditCustom(custom.id)} aria-label="Edit section">
                            <Pencil size={14} />
                          </button>
                          <button type="button" className="app-icon-btn" onClick={() => removeCustomSection(custom.id)} aria-label="Remove section">
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                    <div
                      className="app-section-body"
                      style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--ink)' }}
                      dangerouslySetInnerHTML={{ __html: renderSectionBody(custom.body) }}
                    />
                  </div>
                )
              ) : (
                sectionsByKey[key as AboutSectionKey]
              )}
            </Fragment>
          );
        })}
      </div>


      {memberModalOpen && (
        <div className="app-modal-backdrop" onClick={() => setMemberModalOpen(false)}>
          <div className="app-modal" onClick={e => e.stopPropagation()}>
            <h3>{editingMemberId ? 'Edit team member' : 'New team member'}</h3>
            <div className="app-field">
              <label>Name</label>
              <input className="app-input" value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} />
            </div>
            <div className="app-field">
              <label>Role</label>
              <input className="app-input" value={memberForm.role} onChange={e => setMemberForm({ ...memberForm, role: e.target.value })} placeholder="e.g. Creator & Developer" />
            </div>
            <div className="app-field">
              <label>Bio</label>
              <textarea className="app-textarea" value={memberForm.bio} onChange={e => setMemberForm({ ...memberForm, bio: e.target.value })} style={{ minHeight: 70 }} />
            </div>
            <div className="app-field">
              <label>LinkedIn URL <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional)</span></label>
              <input className="app-input" value={memberForm.linkedinUrl} onChange={e => setMemberForm({ ...memberForm, linkedinUrl: e.target.value })} placeholder="https://linkedin.com/in/..." />
            </div>
            {memberError && <div style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 10 }}>{memberError}</div>}
            <div className="app-modal-actions">
              <button className="app-btn app-btn-ghost" onClick={() => setMemberModalOpen(false)} disabled={memberSaving}>Cancel</button>
              <button className="app-btn app-btn-primary" onClick={saveMember} disabled={memberSaving}>{memberSaving ? 'Saving…' : editingMemberId ? 'Save changes' : 'Add member'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
