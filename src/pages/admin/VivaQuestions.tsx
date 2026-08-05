import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import {
  subscribeVivaQuestions, addVivaQuestion, updateVivaQuestion, deleteVivaQuestion,
  type VivaQuestionFormData,
} from '../../services/vivaQuestionsService';
import type { VivaQuestion } from '../../types';

const EMPTY_FORM: VivaQuestionFormData = { question: '', note: '', order: 0 };

export default function AdminVivaQuestions() {
  const [questions, setQuestions] = useState<VivaQuestion[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => subscribeVivaQuestions(setQuestions), []);

  function openAdd() {
    setForm({ ...EMPTY_FORM, order: (questions?.length ?? 0) + 1 });
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(q: VivaQuestion) {
    setForm({ question: q.question, note: q.note, order: q.order });
    setEditingId(q.id);
    setModalOpen(true);
  }

  async function save() {
    if (!form.question.trim()) return;
    if (editingId) {
      await updateVivaQuestion(editingId, form);
    } else {
      await addVivaQuestion(form);
    }
    setModalOpen(false);
  }

  async function doDelete(id: string) {
    await deleteVivaQuestion(id);
    setConfirmDeleteId(null);
  }

  async function move(index: number, dir: -1 | 1) {
    if (!questions) return;
    const target = index + dir;
    if (target < 0 || target >= questions.length) return;
    const a = questions[index];
    const b = questions[target];
    await Promise.all([
      updateVivaQuestion(a.id, { question: a.question, note: a.note, order: b.order }),
      updateVivaQuestion(b.id, { question: b.question, note: b.note, order: a.order }),
    ]);
  }

  return (
    <>
      <PageHeader
        title="Interview Questions"
        subtitle="Interview-prep questions every applicant sees, with your notes underneath."
        actions={<button className="app-btn app-btn-primary" onClick={openAdd}><Plus size={16} /> New question</button>}
      />
      <div className="app-content">
        {questions === null ? (
          <div className="app-empty">Loading…</div>
        ) : questions.length === 0 ? (
          <div className="app-card app-card-pad">
            <div className="app-empty">No questions yet — add your first one.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {questions.map((q, i) => (
              <div key={q.id} className="app-card app-card-pad" style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="app-card-title">{q.question}</div>
                  {q.note && <div style={{ fontSize: 12.5, color: 'var(--muted)', fontStyle: 'italic', marginTop: 4 }}>{q.note}</div>}
                </div>
                <button className="app-icon-btn" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp size={14} /></button>
                <button className="app-icon-btn" disabled={i === questions.length - 1} onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown size={14} /></button>
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

      {modalOpen && (
        <div className="app-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="app-modal" onClick={e => e.stopPropagation()}>
            <h3>{editingId ? 'Edit question' : 'New question'}</h3>

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
