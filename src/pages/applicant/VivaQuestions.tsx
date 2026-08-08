import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { HelpCircle, Plus, Clock, Check, X } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { subscribeVivaQuestions } from '../../services/vivaQuestionsService';
import { addVivaQuestionSuggestion, subscribeMyVivaSuggestions } from '../../services/vivaQuestionSuggestionsService';
import { useVivaSectionOrder } from '../../hooks/useVivaSectionOrder';
import { mergeSectionOrder } from '../../utils/sectionOrder';
import { useLanguage } from '../../i18n/LanguageContext';
import type { VivaQuestion, VivaQuestionSuggestion } from '../../types';

const NEW_SECTION = '__new__';
const EMPTY_FORM = { question: '', note: '', section: '' };

interface ApplicantVivaQuestionsProps {
  user: User;
}

export default function ApplicantVivaQuestions({ user }: ApplicantVivaQuestionsProps) {
  const { t } = useLanguage();
  const [questions, setQuestions] = useState<VivaQuestion[] | null>(null);
  const [mySuggestions, setMySuggestions] = useState<VivaQuestionSuggestion[]>([]);
  const savedSectionOrder = useVivaSectionOrder();

  useEffect(() => subscribeVivaQuestions(setQuestions), []);
  useEffect(() => subscribeMyVivaSuggestions(user.uid, setMySuggestions), [user.uid]);

  const sectionsInUse = [...new Set((questions ?? []).map(q => q.section))];
  const sectionOrder = mergeSectionOrder(savedSectionOrder, [], sectionsInUse);

  // Numbering runs continuously across all sections (1, 2, 3…) rather than
  // restarting at each section header.
  const orderedQuestions = sectionOrder.flatMap(section =>
    (questions ?? []).filter(q => q.section === section).sort((a, b) => a.order - b.order)
  );
  const globalNumber = new Map(orderedQuestions.map((q, i) => [q.id, i + 1]));

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [newSectionName, setNewSectionName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function openSuggest() {
    setForm({ ...EMPTY_FORM, section: sectionOrder[0] ?? NEW_SECTION });
    setNewSectionName('');
    setError('');
    setModalOpen(true);
  }

  async function submitSuggestion() {
    const question = form.question.trim();
    const section = form.section === NEW_SECTION ? newSectionName.trim() : form.section;
    if (!question || !section) return;
    setSubmitting(true);
    setError('');
    try {
      await addVivaQuestionSuggestion({
        question,
        note: form.note.trim(),
        section,
        suggestedByUid: user.uid,
        suggestedByName: user.displayName || '',
        suggestedByEmail: user.email || '',
      });
      setModalOpen(false);
    } catch (err) {
      console.error('addVivaQuestionSuggestion failed', err);
      setError(t('status.updateFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title={t('vivaQuestions.title')}
        subtitle={t('vivaQuestions.subtitle')}
        actions={<button className="app-btn app-btn-ghost app-btn-sm" onClick={openSuggest}><Plus size={14} /> {t('vivaQuestions.suggest')}</button>}
      />
      <div className="app-content">
        {questions === null ? (
          <div className="app-empty">{t('common.loading')}</div>
        ) : questions.length === 0 ? (
          <div className="app-card app-card-pad">
            <div className="app-empty">{t('vivaQuestions.empty')}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {sectionOrder.map(section => {
              const sectionQuestions = questions.filter(q => q.section === section).sort((a, b) => a.order - b.order);
              if (sectionQuestions.length === 0) return null;
              return (
                <div key={section}>
                  <div style={{ marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid var(--violet-soft)', fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 18, color: 'var(--violet)' }}>{section}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {sectionQuestions.map(q => (
                      <div key={q.id} className="app-card app-card-pad" style={{ display: 'flex', gap: 12 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'var(--violet-soft)', color: 'var(--violet)', fontWeight: 700, fontSize: 13,
                        }}>
                          {globalNumber.get(q.id)}
                        </div>
                        <div>
                          <div style={{ fontSize: 14.5, fontWeight: 600 }}>{q.question}</div>
                          {q.note && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12.5, color: 'var(--muted)', fontStyle: 'italic', marginTop: 6 }}>
                              <HelpCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} /> {q.note}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {mySuggestions.length > 0 && (
          <div style={{ marginTop: 26 }}>
            <div style={{ marginBottom: 10, fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
              {t('vivaQuestions.mySuggestions')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mySuggestions.map(s => (
                <div key={s.id} className="app-card app-card-pad" style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{s.question}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{s.section}</div>
                  </div>
                  {s.status === 'pending' && (
                    <span className="app-badge" style={{ background: 'var(--warning-soft)', color: 'var(--warning-ink)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {t('vivaQuestions.statusPending')}
                    </span>
                  )}
                  {s.status === 'approved' && (
                    <span className="app-badge" style={{ background: 'var(--success-soft)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Check size={12} /> {t('vivaQuestions.statusApproved')}
                    </span>
                  )}
                  {s.status === 'rejected' && (
                    <span className="app-badge" style={{ background: 'var(--danger-soft)', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <X size={12} /> {t('vivaQuestions.statusRejected')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="app-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="app-modal" onClick={e => e.stopPropagation()}>
            <h3>{t('vivaQuestions.suggest')}</h3>
            <div className="app-field">
              <label>{t('vivaQuestions.question')}</label>
              <textarea className="app-textarea" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} style={{ minHeight: 60 }} autoFocus />
            </div>
            <div className="app-field">
              <label>{t('vivaQuestions.note')}</label>
              <textarea className="app-textarea" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} style={{ minHeight: 50 }} />
            </div>
            <div className="app-field">
              <label>{t('vivaQuestions.section')}</label>
              <select className="app-select" value={form.section} onChange={e => setForm({ ...form, section: e.target.value })}>
                {sectionOrder.map(s => <option key={s} value={s}>{s}</option>)}
                <option value={NEW_SECTION}>{t('vivaQuestions.newSection')}</option>
              </select>
            </div>
            {form.section === NEW_SECTION && (
              <div className="app-field">
                <label>{t('vivaQuestions.newSectionName')}</label>
                <input className="app-input" value={newSectionName} onChange={e => setNewSectionName(e.target.value)} />
              </div>
            )}
            {error && <div style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>{t('vivaQuestions.suggestHint')}</div>
            <div className="app-modal-actions">
              <button className="app-btn app-btn-ghost" onClick={() => setModalOpen(false)} disabled={submitting}>{t('common.cancel')}</button>
              <button className="app-btn app-btn-primary" onClick={submitSuggestion} disabled={submitting}>{submitting ? t('common.saving') : t('vivaQuestions.submit')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
