import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { subscribeGuides, addGuide, updateGuide, deleteGuide, slugify } from '../../services/guidesService';
import type { Guide, GuideSection } from '../../types';

const EMPTY_FORM = { title: '', slug: '', order: 0, sections: [{ heading: '', body: '' }] as GuideSection[] };

export default function AdminGuides() {
  const [guides, setGuides] = useState<Guide[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => subscribeGuides(setGuides), []);

  function openAdd() {
    setForm({ ...EMPTY_FORM, order: (guides?.length ?? 0) + 1 });
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(g: Guide) {
    setForm({ title: g.title, slug: g.slug, order: g.order, sections: g.sections.length > 0 ? g.sections : [{ heading: '', body: '' }] });
    setEditingId(g.id);
    setModalOpen(true);
  }

  async function save() {
    if (!form.title.trim()) return;
    const cleanSections = form.sections.filter(s => s.heading.trim() || s.body.trim());
    const payload = { ...form, slug: form.slug.trim() || slugify(form.title), sections: cleanSections };
    if (editingId) {
      await updateGuide(editingId, payload);
    } else {
      await addGuide(payload);
    }
    setModalOpen(false);
  }

  async function doDelete(id: string) {
    await deleteGuide(id);
    setConfirmDeleteId(null);
  }

  function updateSection(i: number, patch: Partial<GuideSection>) {
    setForm(f => ({ ...f, sections: f.sections.map((s, idx) => idx === i ? { ...s, ...patch } : s) }));
  }

  return (
    <>
      <PageHeader
        title="Guides"
        subtitle="Curated content everyone in the group can read, signed in or not."
        actions={<button className="app-btn app-btn-primary" onClick={openAdd}><Plus size={16} /> New guide</button>}
      />
      <div className="app-content">
        {guides === null ? (
          <div className="app-empty">Loading…</div>
        ) : guides.length === 0 ? (
          <div className="app-card app-card-pad">
            <div className="app-empty">No guides yet — add your first one.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {guides.map(g => (
              <div key={g.id} className="app-card app-card-pad" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div className="app-card-title">{g.title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>
                    /guides/{g.slug} · {g.sections.length} section{g.sections.length === 1 ? '' : 's'} · order {g.order}
                  </div>
                </div>
                <button className="app-btn app-btn-ghost app-btn-sm" onClick={() => openEdit(g)}><Pencil size={14} /></button>
                {confirmDeleteId === g.id ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="app-btn app-btn-danger app-btn-sm" onClick={() => doDelete(g.id)}>Confirm</button>
                    <button className="app-btn app-btn-ghost app-btn-sm" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                  </div>
                ) : (
                  <button className="app-btn app-btn-ghost app-btn-sm" onClick={() => setConfirmDeleteId(g.id)}><Trash2 size={14} /></button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="app-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="app-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <h3>{editingId ? 'Edit guide' : 'New guide'}</h3>

            <div className="app-field">
              <label>Title</label>
              <input className="app-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. How to apply for the Opportunity Card" />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div className="app-field" style={{ flex: 1 }}>
                <label>URL slug</label>
                <input className="app-input" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder={slugify(form.title) || 'auto-generated'} />
              </div>
              <div className="app-field" style={{ width: 100 }}>
                <label>Order</label>
                <input className="app-input" type="number" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} />
              </div>
            </div>

            <div className="app-field">
              <label>Sections</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {form.sections.map((s, i) => (
                  <div key={i} className="app-card app-card-pad" style={{ position: 'relative' }}>
                    {form.sections.length > 1 && (
                      <button
                        type="button"
                        className="app-icon-btn"
                        style={{ position: 'absolute', top: 8, right: 8 }}
                        onClick={() => setForm(f => ({ ...f, sections: f.sections.filter((_, idx) => idx !== i) }))}
                        aria-label="Remove section"
                      >
                        <X size={14} />
                      </button>
                    )}
                    <input
                      className="app-input"
                      value={s.heading}
                      onChange={e => updateSection(i, { heading: e.target.value })}
                      placeholder="Section heading"
                      style={{ marginBottom: 8, fontWeight: 600 }}
                    />
                    <textarea
                      className="app-textarea"
                      value={s.body}
                      onChange={e => updateSection(i, { body: e.target.value })}
                      placeholder="Section content (plain text)"
                      style={{ minHeight: 100 }}
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="app-btn app-btn-ghost app-btn-sm"
                style={{ marginTop: 10 }}
                onClick={() => setForm(f => ({ ...f, sections: [...f.sections, { heading: '', body: '' }] }))}
              >
                <Plus size={14} /> Add section
              </button>
            </div>

            <div className="app-modal-actions">
              <button className="app-btn app-btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="app-btn app-btn-primary" onClick={save}>{editingId ? 'Save changes' : 'Add guide'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
