import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { subscribeHowToUse, saveHowToUse } from '../../services/howToUseService';
import type { HowToUseSection } from '../../types';

const EMPTY_FORM = { heading: '', body: '' };

// Fixed sections (the ones the app ships with) can only be hidden, never
// deleted — same hide-vs-delete split used for the About/Help/sidebar
// custom-section editors elsewhere in this admin panel. Admin-added
// sections get a real, permanent delete instead.
export default function AdminHowToUse() {
  const [sections, setSections] = useState<HowToUseSection[] | null>(null);
  useEffect(() => subscribeHowToUse(setSections), []);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(s: HowToUseSection) {
    setForm({ heading: s.heading, body: s.body });
    setEditingId(s.id);
    setModalOpen(true);
  }

  async function save() {
    if (!sections) return;
    const heading = form.heading.trim();
    if (!heading) return;
    const body = form.body.trim();
    let next: HowToUseSection[];
    if (editingId) {
      next = sections.map(s => s.id === editingId ? { ...s, heading, body } : s);
    } else {
      const newSection: HowToUseSection = {
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        heading, body,
      };
      next = [...sections, newSection];
    }
    await saveHowToUse(next);
    setModalOpen(false);
  }

  async function toggleHidden(s: HowToUseSection) {
    if (!sections) return;
    await saveHowToUse(sections.map(x => x.id === s.id ? { ...x, hidden: !x.hidden } : x));
  }

  async function doDelete(id: string) {
    if (!sections) return;
    await saveHowToUse(sections.filter(s => s.id !== id));
    setConfirmDeleteId(null);
  }

  async function move(index: number, dir: -1 | 1) {
    if (!sections) return;
    const target = index + dir;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    await saveHowToUse(next);
  }

  return (
    <>
      <PageHeader
        title="How to Use"
        subtitle="Edit the instructional sections shown on the applicant's How to Use page."
        actions={<button className="app-btn app-btn-primary" onClick={openAdd}><Plus size={16} /> New section</button>}
      />
      <div className="app-content">
        {sections === null ? (
          <div className="app-empty">Loading…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sections.map((s, i) => (
              <div
                key={s.id}
                className="app-card app-card-pad"
                style={{ display: 'flex', alignItems: 'flex-start', gap: 10, opacity: s.hidden ? 0.55 : 1 }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="app-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {s.heading}
                    {s.hidden && <span className="app-badge" style={{ background: 'var(--neutral-soft)', color: 'var(--neutral)' }}>Hidden</span>}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>{s.body}</div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button className="app-icon-btn" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp size={14} /></button>
                  <button className="app-icon-btn" disabled={i === sections.length - 1} onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown size={14} /></button>
                  <button className="app-icon-btn" onClick={() => openEdit(s)} aria-label="Edit section"><Pencil size={14} /></button>
                  {s.fixed ? (
                    <button className="app-icon-btn" onClick={() => toggleHidden(s)} aria-label={s.hidden ? 'Show section' : 'Hide section'}>
                      {s.hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                  ) : confirmDeleteId === s.id ? (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="app-btn app-btn-danger app-btn-sm" onClick={() => doDelete(s.id)}>Confirm</button>
                      <button className="app-btn app-btn-ghost app-btn-sm" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button className="app-icon-btn" onClick={() => setConfirmDeleteId(s.id)} aria-label="Delete section"><Trash2 size={14} /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="app-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="app-modal" onClick={e => e.stopPropagation()}>
            <h3>{editingId ? 'Edit section' : 'New section'}</h3>
            <div className="app-field">
              <label>Heading</label>
              <input className="app-input" value={form.heading} onChange={e => setForm({ ...form, heading: e.target.value })} autoFocus />
            </div>
            <div className="app-field">
              <label>Body</label>
              <textarea className="app-textarea" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} style={{ minHeight: 100 }} />
            </div>
            <div className="app-modal-actions">
              <button className="app-btn app-btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="app-btn app-btn-primary" onClick={save}>{editingId ? 'Save changes' : 'Add section'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
