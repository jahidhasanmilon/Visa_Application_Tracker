import { useState } from 'react';
import { Check, Circle, Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { updateChecklist } from '../../services/applicantsService';
import { useChecklistTemplate } from '../../hooks/useTemplates';
import { effectiveChecklist } from '../../utils/dateHelpers';
import { useLanguage } from '../../i18n/LanguageContext';
import type { Applicant, ChecklistItem } from '../../types';

interface ApplicantChecklistProps {
  applicant: Applicant;
}

export default function ApplicantChecklist({ applicant }: ApplicantChecklistProps) {
  const { t } = useLanguage();
  const template = useChecklistTemplate();
  return (
    <>
      <PageHeader title={t('checklist.title')} subtitle={t('checklist.subtitle')} />
      <div className="app-content">
        {template === null ? (
          <div className="app-empty">{t('common.loading')}</div>
        ) : (
          <ChecklistCard applicant={applicant} template={template} />
        )}
      </div>
    </>
  );
}

const EMPTY_FORM = { label: '', note: '' };

// Every item's id traces back to the shared template UNLESS the applicant
// added it themselves here — that's the same "is this a custom item" test
// used by isCustomizedList()/mergeWithTemplate() in dateHelpers.ts. Custom
// items are the only ones this page lets you edit or remove: the default
// checklist itself stays whatever admin has set, same as anyone else sees
// it — only your own additions are yours to shape, and they're saved on
// your own applicant record, so nobody else ever sees them.
function ChecklistCard({ applicant, template }: { applicant: Applicant; template: ChecklistItem[] }) {
  const { t } = useLanguage();
  const items = effectiveChecklist(applicant, template);
  const templateIds = new Set(template.map(t => t.id));
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function persist(next: ChecklistItem[]) {
    try {
      await updateChecklist(applicant.id, next);
    } catch (err) {
      console.error('updateChecklist failed', err);
      setError(t('status.updateFailed'));
    }
  }

  async function toggle(item: ChecklistItem) {
    setSaving(item.id);
    setError('');
    const next = items.map(i => i.id === item.id ? { ...i, done: !i.done } : i);
    await persist(next);
    setSaving(null);
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(item: ChecklistItem) {
    setForm({ label: item.label, note: item.note ?? '' });
    setEditingId(item.id);
    setModalOpen(true);
  }

  async function saveItem() {
    const label = form.label.trim();
    if (!label) return;
    const note = form.note.trim();
    let next: ChecklistItem[];
    if (editingId) {
      next = items.map(i => {
        if (i.id !== editingId) return i;
        const { note: _oldNote, ...rest } = i;
        return note ? { ...rest, label, note } : { ...rest, label };
      });
    } else {
      const base = { id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, label, done: false };
      const newItem: ChecklistItem = note ? { ...base, note } : base;
      next = [...items, newItem];
    }
    setError('');
    await persist(next);
    setModalOpen(false);
  }

  async function doDelete(id: string) {
    const next = items.filter(i => i.id !== id);
    setConfirmDeleteId(null);
    setError('');
    await persist(next);
  }

  return (
    <div className="app-card app-card-pad">
      <div className="app-card-head">
        <div>
          <div className="app-card-title">{applicant.name}</div>
          {applicant.serialNo && <div className="app-mono" style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{applicant.serialNo}</div>}
        </div>
        <button className="app-btn app-btn-ghost app-btn-sm" onClick={openAdd}><Plus size={14} /> {t('checklist.addItem')}</button>
      </div>

      {error && <div style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
      {items.length === 0 ? (
        <div className="app-empty">{t('checklist.empty')}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {items.map(item => {
            const isCustom = !templateIds.has(item.id);
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 4px', borderBottom: '1px solid var(--border)',
                }}
              >
                <button
                  onClick={() => toggle(item)}
                  disabled={saving === item.id}
                  aria-label={item.done ? t('checklist.notYet') : t('checklist.done')}
                  style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: item.done ? 'var(--success)' : 'var(--neutral-soft)',
                    color: item.done ? '#fff' : 'var(--muted-2)',
                    border: 'none', cursor: 'pointer', padding: 0,
                  }}
                >
                  {item.done ? <Check size={13} /> : <Circle size={9} fill="currentColor" />}
                </button>
                <button
                  onClick={() => toggle(item)}
                  disabled={saving === item.id}
                  style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', font: 'inherit', color: 'inherit', padding: 0 }}
                >
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 500, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'var(--muted)' : 'var(--ink)' }}>
                    {item.label}
                  </span>
                  {item.note && (
                    <span style={{ display: 'block', fontSize: 12, fontStyle: 'italic', color: 'var(--muted)', marginTop: 2 }}>
                      {item.note}
                    </span>
                  )}
                </button>
                <span className="app-badge" style={{
                  background: item.done ? 'var(--success-soft)' : 'var(--neutral-soft)',
                  color: item.done ? 'var(--success)' : 'var(--neutral)',
                }}>
                  {item.done ? t('checklist.done') : t('checklist.notYet')}
                </span>
                {isCustom && (
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button className="app-icon-btn" onClick={() => openEdit(item)} aria-label="Edit item"><Pencil size={14} /></button>
                    {confirmDeleteId === item.id ? (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="app-btn app-btn-danger app-btn-sm" onClick={() => doDelete(item.id)}>{t('common.confirm')}</button>
                        <button className="app-btn app-btn-ghost app-btn-sm" onClick={() => setConfirmDeleteId(null)}>{t('common.cancel')}</button>
                      </div>
                    ) : (
                      <button className="app-icon-btn" onClick={() => setConfirmDeleteId(item.id)} aria-label="Delete item"><Trash2 size={14} /></button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className="app-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="app-modal" onClick={e => e.stopPropagation()}>
            <h3>{editingId ? t('checklist.editItem') : t('checklist.addItem')}</h3>
            <div className="app-field">
              <label>{t('checklist.itemLabel')}</label>
              <input className="app-input" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} autoFocus />
            </div>
            <div className="app-field">
              <label>{t('checklist.itemNote')}</label>
              <textarea className="app-textarea" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} style={{ minHeight: 60 }} />
            </div>
            <div className="app-modal-actions">
              <button className="app-btn app-btn-ghost" onClick={() => setModalOpen(false)}>{t('common.cancel')}</button>
              <button className="app-btn app-btn-primary" onClick={saveItem}>{t('common.save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
