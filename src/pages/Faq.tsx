import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import FlightLoader from '../components/FlightLoader';
import { subscribeFaqs, addFaq, updateFaq, deleteFaq, type FaqFormData } from '../services/faqService';
import type { AppRole } from '../constants/roles';
import type { FaqItem } from '../types';

const EMPTY_FAQ: FaqFormData = { question: '', answer: '', order: 0 };

interface FaqProps {
  role: AppRole;
}

export default function Faq({ role }: FaqProps) {
  const isAdmin = role === 'admin';

  const [faqs, setFaqs] = useState<FaqItem[] | null>(null);
  useEffect(() => subscribeFaqs(setFaqs), []);

  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqForm, setFaqForm] = useState(EMPTY_FAQ);
  const [confirmDeleteFaqId, setConfirmDeleteFaqId] = useState<string | null>(null);
  const [faqSaving, setFaqSaving] = useState(false);
  const [faqError, setFaqError] = useState('');

  function openAddFaq() {
    setFaqForm({ ...EMPTY_FAQ, order: (faqs?.length ?? 0) + 1 });
    setEditingFaqId(null);
    setFaqError('');
    setFaqModalOpen(true);
  }
  function openEditFaq(f: FaqItem) {
    setFaqForm({ question: f.question, answer: f.answer, order: f.order });
    setEditingFaqId(f.id);
    setFaqError('');
    setFaqModalOpen(true);
  }
  async function saveFaq() {
    if (!faqForm.question.trim()) return;
    setFaqSaving(true);
    setFaqError('');
    try {
      if (editingFaqId) await updateFaq(editingFaqId, faqForm);
      else await addFaq(faqForm);
      setFaqModalOpen(false);
    } catch (err) {
      console.error('FAQ save failed', err);
      setFaqError(err instanceof Error ? err.message : 'Could not save — check your connection and try again.');
    } finally {
      setFaqSaving(false);
    }
  }
  async function doDeleteFaq(id: string) {
    try {
      await deleteFaq(id);
    } catch (err) {
      console.error('FAQ delete failed', err);
    } finally {
      setConfirmDeleteFaqId(null);
    }
  }
  async function moveFaq(index: number, dir: -1 | 1) {
    if (!faqs) return;
    const target = index + dir;
    if (target < 0 || target >= faqs.length) return;
    const a = faqs[index], b = faqs[target];
    try {
      await Promise.all([
        updateFaq(a.id, { question: a.question, answer: a.answer, order: b.order }),
        updateFaq(b.id, { question: b.question, answer: b.answer, order: a.order }),
      ]);
    } catch (err) {
      console.error('FAQ reorder failed', err);
    }
  }

  return (
    <>
      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Common questions about VisaTrack, answered."
        actions={isAdmin ? (
          <button className="app-btn app-btn-primary app-btn-sm" onClick={openAddFaq}><Plus size={14} /> Add FAQ</button>
        ) : undefined}
      />
      <div className="app-content">
        {faqs === null ? (
          <FlightLoader />
        ) : faqs.length === 0 ? (
          <div className="app-card app-card-pad">
            <div className="app-empty">{isAdmin ? 'No FAQs yet — add your first one.' : 'No FAQs published yet.'}</div>
          </div>
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
            {faqError && <div style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 10 }}>{faqError}</div>}
            <div className="app-modal-actions">
              <button className="app-btn app-btn-ghost" onClick={() => setFaqModalOpen(false)} disabled={faqSaving}>Cancel</button>
              <button className="app-btn app-btn-primary" onClick={saveFaq} disabled={faqSaving}>{faqSaving ? 'Saving…' : editingFaqId ? 'Save changes' : 'Add FAQ'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
