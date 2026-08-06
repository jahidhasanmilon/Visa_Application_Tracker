import { useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, X, Paperclip, FileText, Bold, Italic, Underline, List, Heading } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import {
  subscribeGuides, addGuide, updateGuide, deleteGuide, slugify,
  uploadGuideAttachment, deleteGuideAttachment,
} from '../../services/guidesService';
import { wrapSelection, prefixLines } from '../../utils/richText';
import type { Guide, GuideAttachment, GuideSection } from '../../types';

const EMPTY_FORM = {
  title: '', slug: '', category: '', order: 0,
  sections: [{ heading: '', body: '' }] as GuideSection[],
  attachments: [] as GuideAttachment[],
};

export default function AdminGuides() {
  const [guides, setGuides] = useState<Guide[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bodyRefs = useRef<Map<number, HTMLTextAreaElement>>(new Map());

  useEffect(() => subscribeGuides(setGuides), []);

  function openAdd() {
    setForm({ ...EMPTY_FORM, order: (guides?.length ?? 0) + 1 });
    setEditingId(null);
    setPendingFiles([]);
    setSaveError('');
    setModalOpen(true);
  }

  function openEdit(g: Guide) {
    setForm({
      title: g.title, slug: g.slug, category: g.category || '', order: g.order,
      sections: g.sections.length > 0 ? g.sections : [{ heading: '', body: '' }],
      attachments: g.attachments || [],
    });
    setEditingId(g.id);
    setPendingFiles([]);
    setSaveError('');
    setModalOpen(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length > 0) setPendingFiles(f => [...f, ...files]);
  }

  function removePendingFile(index: number) {
    setPendingFiles(f => f.filter((_, i) => i !== index));
  }

  async function removeExistingAttachment(a: GuideAttachment) {
    await deleteGuideAttachment(a.url);
    setForm(f => ({ ...f, attachments: f.attachments.filter(x => x.url !== a.url) }));
  }

  async function save() {
    if (!form.title.trim()) return;
    const cleanSections = form.sections.filter(s => s.heading.trim() || s.body.trim());

    setSaveError('');
    setUploading(true);
    try {
      let id = editingId;
      if (!id) {
        id = await addGuide({ ...form, slug: form.slug.trim() || slugify(form.title), sections: cleanSections });
      }
      const uploaded = await Promise.all(pendingFiles.map(file => uploadGuideAttachment(id!, file)));
      const payload = {
        ...form,
        slug: form.slug.trim() || slugify(form.title),
        sections: cleanSections,
        attachments: [...form.attachments, ...uploaded],
      };
      await updateGuide(id, payload);
      setModalOpen(false);
    } catch (err) {
      console.error('Guide save failed', err);
      setSaveError(err instanceof Error ? err.message : 'Something went wrong while saving — check the browser console for details.');
    } finally {
      setUploading(false);
    }
  }

  async function doDelete(id: string) {
    await deleteGuide(id);
    setConfirmDeleteId(null);
  }

  function updateSection(i: number, patch: Partial<GuideSection>) {
    setForm(f => ({ ...f, sections: f.sections.map((s, idx) => idx === i ? { ...s, ...patch } : s) }));
  }

  // Applies a toolbar formatting action to section `i`'s textarea — the
  // action wraps/prefixes the current selection, we save the result and
  // restore focus + selection so typing can continue right after.
  function applyFormat(i: number, action: (ta: HTMLTextAreaElement) => { value: string; selectionStart: number; selectionEnd: number }) {
    const ta = bodyRefs.current.get(i);
    if (!ta) return;
    const result = action(ta);
    updateSection(i, { body: result.value });
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }

  return (
    <>
      <PageHeader
        title="Guides & Resources"
        subtitle="Curated content everyone in the group can read, signed in or not."
        actions={<button className="app-btn app-btn-primary" onClick={openAdd}><Plus size={16} /> New resource</button>}
      />
      <div className="app-content">
        {guides === null ? (
          <div className="app-empty">Loading…</div>
        ) : guides.length === 0 ? (
          <div className="app-card app-card-pad">
            <div className="app-empty">No resources yet — add your first one.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {guides.map(g => (
              <div key={g.id} className="app-card app-card-pad" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="app-card-title">{g.title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>
                    {g.category || 'General'} · /guides/{g.slug} · {g.sections.length} section{g.sections.length === 1 ? '' : 's'} · order {g.order}
                  </div>
                  {g.attachments && g.attachments.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                      {g.attachments.map(a => (
                        <a key={a.url} href={a.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--violet)', fontWeight: 600 }}>
                          <FileText size={12} /> {a.name}
                        </a>
                      ))}
                    </div>
                  )}
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
            <h3>{editingId ? 'Edit resource' : 'New resource'}</h3>

            <div className="app-field">
              <label>Title</label>
              <input className="app-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. How to apply for the Opportunity Card" />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div className="app-field" style={{ flex: 1 }}>
                <label>Category / folder</label>
                <input className="app-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Visa Apply Steps" />
              </div>
              <div className="app-field" style={{ width: 100 }}>
                <label>Order</label>
                <input className="app-input" type="number" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} />
              </div>
            </div>

            <div className="app-field">
              <label>URL slug</label>
              <input className="app-input" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder={slugify(form.title) || 'auto-generated'} />
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
                    <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                      <button type="button" className="app-icon-btn" title="Bold" aria-label="Bold" onClick={() => applyFormat(i, ta => wrapSelection(ta, '**'))}>
                        <Bold size={14} />
                      </button>
                      <button type="button" className="app-icon-btn" title="Italic" aria-label="Italic" onClick={() => applyFormat(i, ta => wrapSelection(ta, '*'))}>
                        <Italic size={14} />
                      </button>
                      <button type="button" className="app-icon-btn" title="Underline" aria-label="Underline" onClick={() => applyFormat(i, ta => wrapSelection(ta, '__'))}>
                        <Underline size={14} />
                      </button>
                      <button type="button" className="app-icon-btn" title="Bullet list" aria-label="Bullet list" onClick={() => applyFormat(i, ta => prefixLines(ta, '- '))}>
                        <List size={14} />
                      </button>
                      <button type="button" className="app-icon-btn" title="Sub-heading" aria-label="Sub-heading" onClick={() => applyFormat(i, ta => prefixLines(ta, '## '))}>
                        <Heading size={14} />
                      </button>
                    </div>
                    <textarea
                      ref={el => { if (el) bodyRefs.current.set(i, el); else bodyRefs.current.delete(i); }}
                      className="app-textarea"
                      value={s.body}
                      onChange={e => updateSection(i, { body: e.target.value })}
                      placeholder="Section content — select text and use the buttons above to format"
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

            <div className="app-field">
              <label>Attachments <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional — any file type, PDFs preview in-app)</span></label>

              {(form.attachments.length > 0 || pendingFiles.length > 0) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                  {form.attachments.map(a => (
                    <div key={a.url} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px' }}>
                      <FileText size={13} color="var(--muted-2)" />
                      <span style={{ flex: 1, fontSize: 12.5 }}>{a.name}</span>
                      <a href={a.url} target="_blank" rel="noreferrer" className="app-card-link" style={{ fontSize: 12 }}>View</a>
                      <button type="button" className="app-icon-btn" onClick={() => removeExistingAttachment(a)} aria-label="Remove file">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                  {pendingFiles.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px dashed var(--border)', borderRadius: 8, padding: '6px 10px' }}>
                      <FileText size={13} color="var(--muted-2)" />
                      <span style={{ flex: 1, fontSize: 12.5 }}>{f.name} <span style={{ color: 'var(--muted)' }}>(will upload on save)</span></span>
                      <button type="button" className="app-icon-btn" onClick={() => removePendingFile(i)} aria-label="Remove file">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button type="button" className="app-btn app-btn-ghost app-btn-sm" onClick={() => fileInputRef.current?.click()}>
                <Paperclip size={14} /> Add file(s)
              </button>
              <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />
            </div>

            {saveError && (
              <div style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 10 }}>{saveError}</div>
            )}

            <div className="app-modal-actions">
              <button className="app-btn app-btn-ghost" onClick={() => setModalOpen(false)} disabled={uploading}>Cancel</button>
              <button className="app-btn app-btn-primary" onClick={save} disabled={uploading}>
                {uploading ? 'Saving…' : editingId ? 'Save changes' : 'Add resource'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
