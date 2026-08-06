import { useState } from 'react';
import { Plus, X, ArrowUp, ArrowDown, Pencil, Check } from 'lucide-react';
import type { ChecklistItem } from '../types';

interface TemplateListEditorProps {
  title: string;
  subtitle: string;
  items: ChecklistItem[];
  onSave: (items: ChecklistItem[]) => Promise<void>;
  addPlaceholder: string;
  // Roadmap-only: lets admin also set the short explainer shown under the
  // status badge on the applicant's My Status page when this step is their
  // current one (see statusNote in utils/dateHelpers.ts). Checklist items
  // don't have a "current status" concept, so this stays off there.
  showNoteField?: boolean;
}

// Shared editor for the admin-managed default checklist/roadmap templates
// (meta/checklistTemplate, meta/roadmapTemplate) — every applicant who
// hasn't been individually customized sees these live. `done` on each item
// is meaningless here (templates aren't tied to any one applicant's
// progress), so this editor only manages label/order (and, for roadmap,
// the status explainer note). Renaming an item here keeps its id, so the
// new label reaches every applicant's app immediately (see
// effectiveRoadmap/effectiveChecklist in utils/dateHelpers.ts, which always
// re-derives template-matched items from the live template).
export default function TemplateListEditor({ title, subtitle, items, onSave, addPlaceholder, showNoteField }: TemplateListEditorProps) {
  const [newLabel, setNewLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editNote, setEditNote] = useState('');

  async function save(next: ChecklistItem[]) {
    setSaving(true);
    try {
      await onSave(next);
    } finally {
      setSaving(false);
    }
  }

  function addItem() {
    const label = newLabel.trim();
    if (!label) return;
    save([...items, { id: crypto.randomUUID(), label, done: false }]);
    setNewLabel('');
  }

  function removeItem(id: string) {
    save(items.filter(i => i.id !== id));
  }

  function moveItem(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    save(next);
  }

  function startEdit(item: ChecklistItem) {
    setEditingId(item.id);
    setEditValue(item.label);
    setEditNote(item.note || '');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue('');
    setEditNote('');
  }

  async function saveEdit() {
    const label = editValue.trim();
    if (!label || !editingId) { cancelEdit(); return; }
    const note = editNote.trim();
    await save(items.map(i => i.id === editingId ? { ...i, label, note: note || undefined } : i));
    cancelEdit();
  }

  return (
    <div className="app-card app-card-pad">
      <div className="app-card-head">
        <div className="app-card-title">{title}</div>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: -8, marginBottom: 14 }}>{subtitle}</p>

      {items.length === 0 ? (
        <div className="app-empty" style={{ marginBottom: 16 }}>No items yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {items.map((item, i) => (
            <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: 6, border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11.5, color: 'var(--muted-2)', width: 16, textAlign: 'center' }}>{i + 1}</span>
                {editingId === item.id ? (
                  <input
                    className="app-input"
                    style={{ flex: 1, padding: '4px 8px', fontSize: 13.5 }}
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !showNoteField) { e.preventDefault(); saveEdit(); }
                      if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
                    }}
                    autoFocus
                  />
                ) : (
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{item.label}</span>
                )}
                {editingId === item.id ? (
                  <>
                    <button type="button" className="app-icon-btn" disabled={saving} onClick={saveEdit} aria-label="Save">
                      <Check size={14} />
                    </button>
                    <button type="button" className="app-icon-btn" disabled={saving} onClick={cancelEdit} aria-label="Cancel">
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className="app-icon-btn" disabled={saving} onClick={() => startEdit(item)} aria-label="Edit item">
                      <Pencil size={14} />
                    </button>
                    <button type="button" className="app-icon-btn" disabled={saving || i === 0} onClick={() => moveItem(i, -1)} aria-label="Move up">
                      <ArrowUp size={14} />
                    </button>
                    <button type="button" className="app-icon-btn" disabled={saving || i === items.length - 1} onClick={() => moveItem(i, 1)} aria-label="Move down">
                      <ArrowDown size={14} />
                    </button>
                    <button type="button" className="app-icon-btn" disabled={saving} onClick={() => removeItem(item.id)} aria-label="Remove item">
                      <X size={14} />
                    </button>
                  </>
                )}
              </div>

              {showNoteField && editingId === item.id && (
                <textarea
                  className="app-textarea"
                  style={{ marginLeft: 24, minHeight: 54, fontSize: 12.5 }}
                  value={editNote}
                  onChange={e => setEditNote(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); } }}
                  placeholder="Explanation shown to applicants when this is their current step (optional) — e.g. &quot;Submitted — next you'll be contacted for review.&quot;"
                />
              )}
              {showNoteField && editingId !== item.id && item.note && (
                <div style={{ marginLeft: 24, fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>{item.note}</div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="app-input"
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }}
          placeholder={addPlaceholder}
        />
        <button type="button" className="app-btn app-btn-ghost app-btn-sm" onClick={addItem} disabled={saving}>
          <Plus size={14} /> Add
        </button>
      </div>
    </div>
  );
}
