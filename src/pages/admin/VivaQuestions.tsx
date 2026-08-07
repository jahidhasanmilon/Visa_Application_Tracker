import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Download } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import {
  subscribeVivaQuestions, addVivaQuestion, updateVivaQuestion, deleteVivaQuestion,
  saveVivaSectionOrder,
  type VivaQuestionFormData,
} from '../../services/vivaQuestionsService';
import { useVivaSectionOrder } from '../../hooks/useVivaSectionOrder';
import { mergeSectionOrder } from '../../utils/sectionOrder';
import { VIVA_QUESTIONS_SEED, SEED_SECTION_ORDER } from '../../data/vivaQuestionsSeed';
import type { VivaQuestion } from '../../types';

const NEW_SECTION = '__new__';
const EMPTY_FORM: VivaQuestionFormData = { question: '', note: '', order: 0, section: '' };

export default function AdminVivaQuestions() {
  const [questions, setQuestions] = useState<VivaQuestion[] | null>(null);
  const savedSectionOrder = useVivaSectionOrder();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [newSectionName, setNewSectionName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => subscribeVivaQuestions(setQuestions), []);

  const sectionsInUse = [...new Set((questions ?? []).map(q => q.section))];
  const sectionOrder = mergeSectionOrder(savedSectionOrder, [], sectionsInUse);

  async function importSeed() {
    if (!questions) return;
    const existing = new Set(questions.map(q => q.question.trim().toLowerCase()));
    const toAdd = VIVA_QUESTIONS_SEED.filter(s => !existing.has(s.question.trim().toLowerCase()));
    if (toAdd.length === 0) return;
    setImporting(true);
    try {
      let order = questions.length;
      for (const item of toAdd) {
        order += 1;
        await addVivaQuestion({ ...item, order });
      }
      if (!savedSectionOrder) {
        await saveVivaSectionOrder(SEED_SECTION_ORDER);
      }
    } finally {
      setImporting(false);
    }
  }

  function openAdd(section?: string) {
    setForm({ ...EMPTY_FORM, section: section ?? sectionOrder[0] ?? NEW_SECTION, order: (questions?.length ?? 0) + 1 });
    setNewSectionName('');
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(q: VivaQuestion) {
    setForm({ question: q.question, note: q.note, order: q.order, section: q.section });
    setNewSectionName('');
    setEditingId(q.id);
    setModalOpen(true);
  }

  async function save() {
    const section = form.section === NEW_SECTION ? newSectionName.trim() : form.section;
    if (!form.question.trim() || !section) return;
    const payload = { ...form, section };
    if (editingId) {
      await updateVivaQuestion(editingId, payload);
    } else {
      await addVivaQuestion(payload);
    }
    setModalOpen(false);
  }

  async function doDelete(id: string) {
    await deleteVivaQuestion(id);
    setConfirmDeleteId(null);
  }

  // Reorders a question against its neighbor WITHIN the same section —
  // `order` stays a single global sequence (needed for the Firestore
  // query's orderBy), but the swap only ever happens between two questions
  // that share a section, so it never crosses section boundaries.
  async function moveQuestion(sectionQuestions: VivaQuestion[], index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= sectionQuestions.length) return;
    const a = sectionQuestions[index];
    const b = sectionQuestions[target];
    await Promise.all([
      updateVivaQuestion(a.id, { question: a.question, note: a.note, section: a.section, order: b.order }),
      updateVivaQuestion(b.id, { question: b.question, note: b.note, section: b.section, order: a.order }),
    ]);
  }

  async function moveSection(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= sectionOrder.length) return;
    const next = [...sectionOrder];
    [next[index], next[target]] = [next[target], next[index]];
    await saveVivaSectionOrder(next);
  }

  return (
    <>
      <PageHeader
        title="Interview Questions"
        subtitle="Interview-prep questions every applicant sees, grouped by section, with your notes underneath."
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="app-btn app-btn-ghost" onClick={importSeed} disabled={importing || questions === null}>
              <Download size={16} /> {importing ? 'Importing…' : 'Import starter questions'}
            </button>
            <button className="app-btn app-btn-primary" onClick={() => openAdd()}><Plus size={16} /> New question</button>
          </div>
        }
      />
      <div className="app-content">
        {questions === null ? (
          <div className="app-empty">Loading…</div>
        ) : questions.length === 0 ? (
          <div className="app-card app-card-pad">
            <div className="app-empty">No questions yet — add your first one, or import the starter set.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {sectionOrder.map((section, si) => {
              const sectionQuestions = questions
                .filter(q => q.section === section)
                .sort((a, b) => a.order - b.order);
              return (
                <div key={section}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div className="app-card-title" style={{ flex: 1 }}>{section}</div>
                    <button className="app-btn app-btn-ghost app-btn-sm" onClick={() => openAdd(section)}><Plus size={14} /> Add here</button>
                    <button className="app-icon-btn" disabled={si === 0} onClick={() => moveSection(si, -1)} aria-label="Move section up"><ArrowUp size={14} /></button>
                    <button className="app-icon-btn" disabled={si === sectionOrder.length - 1} onClick={() => moveSection(si, 1)} aria-label="Move section down"><ArrowDown size={14} /></button>
                  </div>
                  {sectionQuestions.length === 0 ? (
                    <div className="app-card app-card-pad"><div className="app-empty">No questions in this section yet.</div></div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {sectionQuestions.map((q, i) => (
                        <div key={q.id} className="app-card app-card-pad" style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="app-card-title">{q.question}</div>
                            {q.note && <div style={{ fontSize: 12.5, color: 'var(--muted)', fontStyle: 'italic', marginTop: 4 }}>{q.note}</div>}
                          </div>
                          <button className="app-icon-btn" disabled={i === 0} onClick={() => moveQuestion(sectionQuestions, i, -1)} aria-label="Move up"><ArrowUp size={14} /></button>
                          <button className="app-icon-btn" disabled={i === sectionQuestions.length - 1} onClick={() => moveQuestion(sectionQuestions, i, 1)} aria-label="Move down"><ArrowDown size={14} /></button>
                          <button className="app-btn app-btn-ghost app-btn-sm" onClick={() => openEdit(q)}><Pencil size={14} /></button>
                          {confirmDeleteId === q.id ? (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="app-btn app-btn-danger app-btn-sm" onClick={() => doDelete(q.id)}>Confirm</button>
                              <button className="app-btn app-btn-ghost app-btn-sm" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                            </div>
                          ) : (
                            <button className="app-btn app-btn-ghost app-btn-sm" onClick={() => setConfirmDeleteId(q.id)}><Trash2 size={14} /></button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="app-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="app-modal" onClick={e => e.stopPropagation()}>
            <h3>{editingId ? 'Edit question' : 'New question'}</h3>

            <div className="app-field">
              <label>Section</label>
              <select className="app-select" value={form.section} onChange={e => setForm({ ...form, section: e.target.value })}>
                {sectionOrder.map(s => <option key={s} value={s}>{s}</option>)}
                <option value={NEW_SECTION}>+ New section…</option>
              </select>
              {form.section === NEW_SECTION && (
                <input
                  className="app-input"
                  style={{ marginTop: 8 }}
                  value={newSectionName}
                  onChange={e => setNewSectionName(e.target.value)}
                  placeholder="New section name, e.g. Motivation for Germany"
                  autoFocus
                />
              )}
            </div>

            <div className="app-field">
              <label>Question</label>
              <textarea className="app-textarea" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} placeholder="e.g. Why did you choose Germany?" style={{ minHeight: 70 }} />
            </div>

            <div className="app-field">
              <label>Note <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(shown in italics under the question)</span></label>
              <textarea className="app-textarea" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Tips on how to answer, what to avoid, etc." style={{ minHeight: 70 }} />
            </div>

            <div className="app-modal-actions">
              <button className="app-btn app-btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="app-btn app-btn-primary" onClick={save}>{editingId ? 'Save changes' : 'Add question'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
