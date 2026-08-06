import { useEffect, useState } from 'react';
import { Pencil, Plus, X, Trash2, ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { subscribeAbout, saveAbout, DEFAULT_ABOUT } from '../services/siteContentService';
import { subscribeFaqs, addFaq, updateFaq, deleteFaq, type FaqFormData } from '../services/faqService';
import { subscribeTeam, addTeamMember, updateTeamMember, deleteTeamMember, type TeamMemberFormData } from '../services/teamService';
import type { AppRole } from '../constants/roles';
import type { AboutContent, FaqItem, TeamMember } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface AboutProps {
  role: AppRole;
}

const EMPTY_FAQ: FaqFormData = { question: '', answer: '', order: 0 };
const EMPTY_MEMBER: TeamMemberFormData = { name: '', role: '', bio: '', linkedinUrl: '', order: 0 };

export default function About({ role }: AboutProps) {
  const { t } = useLanguage();
  const isAdmin = role === 'admin';

  const [content, setContent] = useState<AboutContent>(DEFAULT_ABOUT);
  const [faqs, setFaqs] = useState<FaqItem[] | null>(null);
  const [team, setTeam] = useState<TeamMember[] | null>(null);

  useEffect(() => subscribeAbout(setContent), []);
  useEffect(() => subscribeFaqs(setFaqs), []);
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

  // ---- FAQ CRUD (mirrors admin/VivaQuestions.tsx) ----
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqForm, setFaqForm] = useState(EMPTY_FAQ);
  const [confirmDeleteFaqId, setConfirmDeleteFaqId] = useState<string | null>(null);

  function openAddFaq() {
    setFaqForm({ ...EMPTY_FAQ, order: (faqs?.length ?? 0) + 1 });
    setEditingFaqId(null);
    setFaqModalOpen(true);
  }
  function openEditFaq(f: FaqItem) {
    setFaqForm({ question: f.question, answer: f.answer, order: f.order });
    setEditingFaqId(f.id);
    setFaqModalOpen(true);
  }
  async function saveFaq() {
    if (!faqForm.question.trim()) return;
    if (editingFaqId) await updateFaq(editingFaqId, faqForm);
    else await addFaq(faqForm);
    setFaqModalOpen(false);
  }
  async function doDeleteFaq(id: string) {
    await deleteFaq(id);
    setConfirmDeleteFaqId(null);
  }
  async function moveFaq(index: number, dir: -1 | 1) {
    if (!faqs) return;
    const target = index + dir;
    if (target < 0 || target >= faqs.length) return;
    const a = faqs[index], b = faqs[target];
    await Promise.all([
      updateFaq(a.id, { question: a.question, answer: a.answer, order: b.order }),
      updateFaq(b.id, { question: b.question, answer: b.answer, order: a.order }),
    ]);
  }

  // ---- Team CRUD ----
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState(EMPTY_MEMBER);
  const [confirmDeleteMemberId, setConfirmDeleteMemberId] = useState<string | null>(null);

  function openAddMember() {
    setMemberForm({ ...EMPTY_MEMBER, order: (team?.length ?? 0) + 1 });
    setEditingMemberId(null);
    setMemberModalOpen(true);
  }
  function openEditMember(m: TeamMember) {
    setMemberForm({ name: m.name, role: m.role, bio: m.bio, linkedinUrl: m.linkedinUrl, order: m.order });
    setEditingMemberId(m.id);
    setMemberModalOpen(true);
  }
  async function saveMember() {
    if (!memberForm.name.trim()) return;
    if (editingMemberId) await updateTeamMember(editingMemberId, memberForm);
    else await addTeamMember(memberForm);
    setMemberModalOpen(false);
  }
  async function doDeleteMember(id: string) {
    await deleteTeamMember(id);
    setConfirmDeleteMemberId(null);
  }
  async function moveMember(index: number, dir: -1 | 1) {
    if (!team) return;
    const target = index + dir;
    if (target < 0 || target >= team.length) return;
    const a = team[index], b = team[target];
    await Promise.all([
      updateTeamMember(a.id, { name: a.name, role: a.role, bio: a.bio, linkedinUrl: a.linkedinUrl, order: b.order }),
      updateTeamMember(b.id, { name: b.name, role: b.role, bio: b.bio, linkedinUrl: b.linkedinUrl, order: a.order }),
    ]);
  }

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
              {content.storyHeading && <div className="app-card-title" style={{ marginBottom: 10 }}>{content.storyHeading}</div>}
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

        <div>
          <div className="app-card-head" style={{ marginBottom: 12 }}>
            <div className="app-page-title" style={{ fontSize: 18 }}>Frequently asked questions</div>
            {isAdmin && (
              <button className="app-btn app-btn-ghost app-btn-sm" onClick={openAddFaq}><Plus size={14} /> Add FAQ</button>
            )}
          </div>
          {faqs === null ? (
            <div className="app-empty">{t('common.loading')}</div>
          ) : faqs.length === 0 ? (
            isAdmin ? (
              <div className="app-card app-card-pad"><div className="app-empty">No FAQs yet — add your first one.</div></div>
            ) : null
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {faqs.map((f, i) => (
                <div key={f.id} className="app-card app-card-pad">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="app-card-title">{f.question}</div>
                      <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginTop: 6, whiteSpace: 'pre-wrap' }}>{f.answer}</div>
                    </div>
                    {isAdmin && (
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        <button className="app-icon-btn" disabled={i === 0} onClick={() => moveFaq(i, -1)} aria-label="Move up"><ArrowUp size={14} /></button>
                        <button className="app-icon-btn" disabled={i === faqs.length - 1} onClick={() => moveFaq(i, 1)} aria-label="Move down"><ArrowDown size={14} /></button>
                        <button className="app-icon-btn" onClick={() => openEditFaq(f)} aria-label="Edit FAQ"><Pencil size={14} /></button>
                        {confirmDeleteFaqId === f.id ? (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="app-btn app-btn-danger app-btn-sm" onClick={() => doDeleteFaq(f.id)}>Confirm</button>
                            <button className="app-btn app-btn-ghost app-btn-sm" onClick={() => setConfirmDeleteFaqId(null)}>Cancel</button>
                          </div>
                        ) : (
                          <button className="app-icon-btn" onClick={() => setConfirmDeleteFaqId(f.id)} aria-label="Delete FAQ"><Trash2 size={14} /></button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="app-card-head" style={{ marginBottom: 12 }}>
            <div className="app-page-title" style={{ fontSize: 18 }}>The people behind the platform</div>
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
                    <a href={m.linkedinUrl} target="_blank" rel="noreferrer" className="app-card-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
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

      </div>

      {faqModalOpen && (
        <div className="app-modal-backdrop" onClick={() => setFaqModalOpen(false)}>
          <div className="app-modal" onClick={e => e.stopPropagation()}>
            <h3>{editingFaqId ? 'Edit FAQ' : 'New FAQ'}</h3>
            <div className="app-field">
              <label>Question</label>
              <textarea className="app-textarea" value={faqForm.question} onChange={e => setFaqForm({ ...faqForm, question: e.target.value })} style={{ minHeight: 60 }} />
            </div>
            <div className="app-field">
              <label>Answer</label>
              <textarea className="app-textarea" value={faqForm.answer} onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })} style={{ minHeight: 90 }} />
            </div>
            <div className="app-modal-actions">
              <button className="app-btn app-btn-ghost" onClick={() => setFaqModalOpen(false)}>Cancel</button>
              <button className="app-btn app-btn-primary" onClick={saveFaq}>{editingFaqId ? 'Save changes' : 'Add FAQ'}</button>
            </div>
          </div>
        </div>
      )}

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
            <div className="app-modal-actions">
              <button className="app-btn app-btn-ghost" onClick={() => setMemberModalOpen(false)}>Cancel</button>
              <button className="app-btn app-btn-primary" onClick={saveMember}>{editingMemberId ? 'Save changes' : 'Add member'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
