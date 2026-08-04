import { useState } from 'react';
import { Search, Plus, X, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { useApplicants } from '../../hooks/useApplicants';
import { updateChecklist } from '../../services/applicantsService';
import { DEFAULT_CHECKLIST_LABELS } from '../../constants/checklist';
import { ListDetailSkeleton } from '../../components/Skeleton';
import type { ChecklistItem, EnrichedApplicant } from '../../types';

export default function AdminChecklist() {
  const { enriched, loading } = useApplicants();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resettingAll, setResettingAll] = useState(false);

  const filtered = enriched.filter(a => {
    const q = search.trim().toLowerCase();
    return !q || a.name.toLowerCase().includes(q) || a.serialNo.toLowerCase().includes(q);
  });

  const selected = enriched.find(a => a.id === selectedId) || null;
  const customizedCount = enriched.filter(a => a.checklist && a.checklist.length > 0).length;

  async function resetAllToDefault() {
    if (!confirm(`Reset all ${customizedCount} customized applicant(s) back to the default ${DEFAULT_CHECKLIST_LABELS.length}-item checklist? This removes their custom items.`)) return;
    setResettingAll(true);
    try {
      await Promise.all(
        enriched.filter(a => a.checklist && a.checklist.length > 0).map(a => updateChecklist(a.id, []))
      );
    } finally {
      setResettingAll(false);
    }
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Checklist" subtitle="Customize each applicant's task checklist." />
        <ListDetailSkeleton />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Checklist" subtitle="Customize each applicant's task checklist." />
      <div className="app-content">
        {customizedCount > 0 && (
          <div className="app-card app-card-pad" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
              {customizedCount} applicant{customizedCount > 1 ? 's have' : ' has'} a customized checklist.
            </div>
            <button type="button" className="app-btn app-btn-ghost app-btn-sm" onClick={resetAllToDefault} disabled={resettingAll}>
              <RotateCcw size={14} /> Reset all to default
            </button>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 300px) 1fr', gap: 20, alignItems: 'start' }}>
          <div className="app-card app-card-pad">
            <div className="app-input-wrap" style={{ marginBottom: 14 }}>
              <Search size={16} />
              <input placeholder="Search applicants…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 480, overflowY: 'auto' }}>
              {filtered.length === 0 ? (
                <div className="app-empty">No applicants match.</div>
              ) : filtered.map(a => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelectedId(a.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2,
                    padding: '9px 10px', borderRadius: 8, border: 'none', textAlign: 'left', cursor: 'pointer',
                    background: selectedId === a.id ? 'var(--violet-soft)' : 'transparent',
                    color: selectedId === a.id ? 'var(--violet)' : 'var(--ink)',
                    font: 'inherit',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 13.5 }}>{a.name}</span>
                  <span className="app-mono" style={{ fontSize: 11, opacity: 0.7 }}>{a.serialNo}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="app-card app-card-pad">
            {!selected ? (
              <div className="app-empty">Select an applicant to edit their checklist.</div>
            ) : (
              <ChecklistEditor applicant={selected} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ChecklistEditor({ applicant }: { applicant: EnrichedApplicant }) {
  const isCustomized = !!(applicant.checklist && applicant.checklist.length > 0);
  const items = isCustomized
    ? applicant.checklist!
    : DEFAULT_CHECKLIST_LABELS.map(label => ({ id: crypto.randomUUID(), label, done: false }));
  const [newLabel, setNewLabel] = useState('');
  const [saving, setSaving] = useState(false);

  async function save(next: ChecklistItem[]) {
    setSaving(true);
    try {
      await updateChecklist(applicant.id, next);
    } finally {
      setSaving(false);
    }
  }

  function resetToDefault() {
    if (!confirm(`Reset ${applicant.name}'s checklist back to the default ${DEFAULT_CHECKLIST_LABELS.length} items? This removes their custom items.`)) return;
    save([]);
  }

  function addItem() {
    const label = newLabel.trim();
    if (!label) return;
    save([...items, { id: crypto.randomUUID(), label, done: false }]);
    setNewLabel('');
  }

  function toggleItem(id: string) {
    save(items.map(i => i.id === id ? { ...i, done: !i.done } : i));
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

  return (
    <div>
      <div className="app-card-head">
        <div>
          <div className="app-card-title">{applicant.name}</div>
          <div className="app-mono" style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{applicant.serialNo}</div>
        </div>
        {isCustomized && (
          <button type="button" className="app-btn app-btn-ghost app-btn-sm" onClick={resetToDefault} disabled={saving}>
            <RotateCcw size={14} /> Reset to default
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="app-empty" style={{ marginBottom: 16 }}>No checklist items yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {items.map((item, i) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px' }}>
              <button
                type="button"
                className="app-badge"
                disabled={saving}
                onClick={() => toggleItem(item.id)}
                style={{
                  border: 'none', cursor: 'pointer',
                  background: item.done ? 'var(--success-soft)' : 'var(--neutral-soft)',
                  color: item.done ? 'var(--success)' : 'var(--neutral)',
                }}
              >
                {item.done ? 'Done' : 'Not yet'}
              </button>
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'var(--muted)' : 'var(--ink)' }}>
                {item.label}
              </span>
              <button type="button" className="app-icon-btn" disabled={saving || i === 0} onClick={() => moveItem(i, -1)} aria-label="Move up">
                <ArrowUp size={14} />
              </button>
              <button type="button" className="app-icon-btn" disabled={saving || i === items.length - 1} onClick={() => moveItem(i, 1)} aria-label="Move down">
                <ArrowDown size={14} />
              </button>
              <button type="button" className="app-icon-btn" disabled={saving} onClick={() => removeItem(item.id)} aria-label="Remove item">
                <X size={14} />
              </button>
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
          placeholder="New checklist item"
        />
        <button type="button" className="app-btn app-btn-ghost app-btn-sm" onClick={addItem} disabled={saving}>
          <Plus size={14} /> Add item
        </button>
      </div>
    </div>
  );
}
