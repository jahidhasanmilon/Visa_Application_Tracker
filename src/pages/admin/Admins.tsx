import { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Plus, Trash2, Pencil, ArrowUp, ArrowDown, FileText, Eye, EyeOff, Check, X, Image as ImageIcon } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import CustomSectionForm from '../../components/CustomSectionForm';
import FlightLoader from '../../components/FlightLoader';
import { subscribeAdmins, addAdmin, removeAdmin } from '../../services/adminsService';
import { saveApplicantNavOrder, saveApplicantNavHidden, saveApplicantNavLabels } from '../../services/navOrderService';
import {
  subscribeAbout, saveAbout, DEFAULT_ABOUT,
  subscribeHelp, saveHelp, DEFAULT_HELP,
  saveAboutSectionOrder, saveHelpSectionOrder,
  saveAboutCustomSections, saveHelpCustomSections,
  saveAboutHiddenSections, saveHelpHiddenSections,
} from '../../services/siteContentService';
import { saveCustomPages } from '../../services/customPagesService';
import { subscribeWelcome, saveWelcome, uploadWelcomeImage, deleteWelcomeImage, DEFAULT_WELCOME } from '../../services/welcomeService';
import { useApplicantNavOrder, useApplicantNavLabels } from '../../hooks/useNavOrder';
import { useAboutSectionOrder } from '../../hooks/useAboutSectionOrder';
import { useHelpSectionOrder } from '../../hooks/useHelpSectionOrder';
import { useAboutCustomSections, useHelpCustomSections } from '../../hooks/useCustomSections';
import { useCustomPages } from '../../hooks/useCustomPages';
import { useAboutHiddenSections, useHelpHiddenSections, useApplicantNavHidden } from '../../hooks/useHiddenSections';
import { mergeSectionOrder } from '../../utils/sectionOrder';
import { APPLICANT_NAV, NAV_LABEL_KEYS } from '../../constants/nav';
import { ABOUT_SECTION_LABELS, DEFAULT_ABOUT_SECTION_ORDER } from '../../constants/aboutSections';
import { HELP_SECTION_LABELS, DEFAULT_HELP_SECTION_ORDER } from '../../constants/helpSections';
import { OWNER_EMAIL } from '../../constants/roles';
import { useLanguage } from '../../i18n/LanguageContext';
import type { CustomSection, AboutContent, HelpInfo, WelcomeContent } from '../../types';

export default function AdminAdmins() {
  const { t } = useLanguage();
  const [admins, setAdmins] = useState<string[] | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  useEffect(() => subscribeAdmins(setAdmins), []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const email = newEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) { setError(t('admin.errInvalidEmail')); return; }
    if (email === OWNER_EMAIL || admins?.includes(email)) { setError(t('admin.errAlreadyAdmin')); return; }
    setError('');
    setAdding(true);
    try {
      await addAdmin(email);
      setNewEmail('');
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(email: string) {
    await removeAdmin(email);
    setConfirmRemove(null);
  }

  return (
    <>
      <PageHeader title={t('admin.admins.title')} subtitle={t('admin.admins.subtitle')} />
      <div className="app-content">
        <div className="app-card app-card-pad">
          <div className="app-card-head">
            <div className="app-card-title">{t('admin.addAdmin')}</div>
          </div>
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8 }}>
            <input
              className="app-input"
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="someone@example.com"
              style={{ flex: 1 }}
            />
            <button className="app-btn app-btn-primary app-btn-sm" type="submit" disabled={adding}>
              <Plus size={14} /> {t('common.add')}
            </button>
          </form>
          {error && <div style={{ color: 'var(--danger)', fontSize: 12.5, marginTop: 8 }}>{error}</div>}
        </div>

        <div className="app-card app-card-pad">
          <div className="app-card-head">
            <div className="app-card-title">{t('admin.currentAdmins')}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 10 }}>
              <ShieldCheck size={16} color="var(--violet)" />
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{OWNER_EMAIL}</span>
              <span className="app-badge" style={{ background: 'var(--violet-soft)', color: 'var(--violet)' }}>{t('admin.owner')}</span>
            </div>

            {admins === null ? (
              <FlightLoader />
            ) : admins.length === 0 ? (
              <div style={{ fontSize: 12.5, color: 'var(--muted)', padding: '4px 2px' }}>{t('admin.noOtherAdmins')}</div>
            ) : (
              admins.map(email => (
                <div key={email} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 10 }}>
                  <ShieldCheck size={16} color="var(--muted-2)" />
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{email}</span>
                  {confirmRemove === email ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="app-btn app-btn-danger app-btn-sm" onClick={() => handleRemove(email)}>{t('common.confirm')}</button>
                      <button className="app-btn app-btn-ghost app-btn-sm" onClick={() => setConfirmRemove(null)}>{t('common.cancel')}</button>
                    </div>
                  ) : (
                    <button className="app-btn app-btn-ghost app-btn-sm" onClick={() => setConfirmRemove(email)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <WelcomeMessageCard />
        <ApplicantNavOrderCard />
        <AboutSectionOrderCard />
        <HelpSectionOrderCard />
      </div>
    </>
  );
}

// Shown once to a first-time applicant (see WelcomeModal.tsx / ApplicantDashboard.tsx).
function WelcomeMessageCard() {
  const [welcome, setWelcome] = useState<WelcomeContent>(DEFAULT_WELCOME);
  const [draft, setDraft] = useState<WelcomeContent>(DEFAULT_WELCOME);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => subscribeWelcome(w => { setWelcome(w); setDraft(w); }), []);

  const dirty = JSON.stringify(draft) !== JSON.stringify(welcome);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const url = await uploadWelcomeImage(file);
      setDraft(d => ({ ...d, imageUrl: url }));
    } catch (err) {
      console.error('uploadWelcomeImage failed', err);
      setError('Image upload failed — only the owner account can upload images right now.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function removeImage() {
    await deleteWelcomeImage();
    setDraft(d => ({ ...d, imageUrl: '' }));
  }

  async function save() {
    setSaving(true);
    setError('');
    try {
      await saveWelcome(draft);
    } catch (err) {
      console.error('saveWelcome failed', err);
      setError('Could not save — check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-card app-card-pad">
      <div className="app-card-head">
        <div className="app-card-title">First-time welcome message</div>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: -8, marginBottom: 14 }}>
        Shown once to a new applicant on their first visit, with a link into How to Use. Turn it off any time.
      </p>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, cursor: 'pointer' }}>
        <input type="checkbox" checked={draft.enabled} onChange={e => setDraft({ ...draft, enabled: e.target.checked })} />
        <span style={{ fontSize: 13.5, fontWeight: 500 }}>Show this to new applicants</span>
      </label>

      <div className="app-field">
        <label>Message</label>
        <textarea className="app-textarea" value={draft.message} onChange={e => setDraft({ ...draft, message: e.target.value })} style={{ minHeight: 80 }} />
      </div>

      <div className="app-field">
        <label>Image <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional)</span></label>
        {draft.imageUrl && (
          <div style={{ position: 'relative', marginBottom: 8, maxWidth: 280 }}>
            <img src={draft.imageUrl} alt="" style={{ width: '100%', borderRadius: 10, display: 'block' }} />
            <button type="button" className="app-icon-btn" style={{ position: 'absolute', top: 6, right: 6, background: 'var(--surface)' }} onClick={removeImage} aria-label="Remove image">
              <X size={14} />
            </button>
          </div>
        )}
        <button type="button" className="app-btn app-btn-ghost app-btn-sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <ImageIcon size={14} /> {uploading ? 'Uploading…' : draft.imageUrl ? 'Replace image' : 'Upload image'}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
      </div>

      {error && <div style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 10 }}>{error}</div>}

      <button className="app-btn app-btn-primary app-btn-sm" onClick={save} disabled={saving || uploading || !dirty}>
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}

// Shared "add / edit a custom item" state machine — used identically by all
// three cards below (custom sidebar pages, custom About sections, custom
// Help sections). '__new__' is a sentinel meaning "the add form is open".
function useCustomItemForm() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  function startAdd() {
    setEditingId('__new__');
    setTitle('');
    setBody('');
  }
  function startEdit(item: CustomSection) {
    setEditingId(item.id);
    setTitle(item.title);
    setBody(item.body);
  }
  function cancel() {
    setEditingId(null);
  }

  return { editingId, title, setTitle, body, setBody, saving, setSaving, startAdd, startEdit, cancel };
}

// Fixed (built-in) sections/pages can't be deleted or rewritten from
// scratch here — they're wired to specific content fields, not freeform
// items — but a title-only rename plus hide/restore covers "edit and
// remove" for them too, without duplicating each page's own full editor.
function useInlineRename() {
  const [key, setKey] = useState<string | null>(null);
  const [value, setValue] = useState('');
  function start(k: string, initial: string) {
    setKey(k);
    setValue(initial);
  }
  function cancel() {
    setKey(null);
  }
  return { key, value, setValue, start, cancel };
}

// Shown on every row (fixed or custom) — a plain bidirectional show/hide
// toggle, separate from the one-way Remove button below.
function HideToggleButton({ hidden, onToggle }: { hidden: boolean; onToggle: () => void }) {
  return (
    <button type="button" className="app-icon-btn" onClick={onToggle} aria-label={hidden ? 'Show on page' : 'Hide from page'} title={hidden ? 'Hidden — click to show' : 'Click to hide from page'}>
      {hidden ? <EyeOff size={14} color="var(--danger)" /> : <Eye size={14} />}
    </button>
  );
}

// Hidden rows drop out of the main list entirely (not just greyed out) —
// this is where they land instead, with a one-click Restore.
function HiddenSectionsList({ items, onRestore }: { items: { key: string; label: string }[]; onRestore: (key: string) => void }) {
  if (items.length === 0) return null;
  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border)' }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>
        Hidden ({items.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map(({ key, label }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 8, background: 'var(--neutral-soft)' }}>
            <span style={{ flex: 1, fontSize: 12.5, color: 'var(--muted)' }}>{label}</span>
            <button type="button" className="app-icon-btn" onClick={() => onRestore(key)} aria-label="Restore to page" title="Restore to page">
              <Eye size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApplicantNavOrderCard() {
  const { t } = useLanguage();
  const savedOrder = useApplicantNavOrder();
  const customPages = useCustomPages();
  const hiddenKeys = useApplicantNavHidden();
  const navLabels = useApplicantNavLabels();
  const form = useCustomItemForm();
  const rename = useInlineRename();

  const pageRoute = (id: string) => `/app/pages/${id}`;
  const fixedTos = APPLICANT_NAV.map(i => i.to);
  const customTos = (customPages ?? []).map(p => pageRoute(p.id));
  const order = mergeSectionOrder(savedOrder, fixedTos, customTos);

  const byTo = new Map<string, { to: string; label: string; icon: typeof FileText; isCustom: boolean }>([
    ...APPLICANT_NAV.map(i => [i.to, { ...i, isCustom: false }] as const),
    ...(customPages ?? []).map(p => [pageRoute(p.id), { to: pageRoute(p.id), label: p.title, icon: FileText, isCustom: true }] as const),
  ]);

  async function toggleHidden(to: string) {
    const next = hiddenKeys.includes(to) ? hiddenKeys.filter(k => k !== to) : [...hiddenKeys, to];
    await saveApplicantNavHidden(next);
  }

  async function saveRename(to: string) {
    const v = rename.value.trim();
    const next = { ...navLabels };
    if (v) next[to] = v; else delete next[to];
    await saveApplicantNavLabels(next);
    rename.cancel();
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    await saveApplicantNavOrder(next);
  }

  async function removePage(id: string) {
    if (!confirm('Delete this page entirely? This cannot be undone.')) return;
    await saveCustomPages((customPages ?? []).filter(p => p.id !== id));
    await saveApplicantNavOrder(order.filter(to => to !== pageRoute(id)));
  }

  async function saveForm() {
    const title = form.title.trim();
    if (!title) return;
    form.setSaving(true);
    try {
      if (form.editingId === '__new__') {
        const id = crypto.randomUUID();
        await saveCustomPages([...(customPages ?? []), { id, title, body: form.body }]);
        await saveApplicantNavOrder([...order, pageRoute(id)]);
      } else {
        await saveCustomPages((customPages ?? []).map(p => p.id === form.editingId ? { ...p, title, body: form.body } : p));
      }
      form.cancel();
    } finally {
      form.setSaving(false);
    }
  }

  return (
    <div className="app-card app-card-pad">
      <div className="app-card-head">
        <div className="app-card-title">{t('admin.navOrderTitle')}</div>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: -8, marginBottom: 14 }}>
        {t('admin.navOrderSubtitle')} You can also add extra static pages here.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {order.map((to, i) => {
          const item = byTo.get(to);
          if (!item) return null;
          const hidden = hiddenKeys.includes(to);
          if (hidden) return null;
          const Icon = item.icon;
          const label = item.isCustom ? item.label : (navLabels[to] || t(NAV_LABEL_KEYS[to] ?? '') || item.label);
          const isRenaming = rename.key === to;
          return (
            <div key={to} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px' }}>
              <Icon size={15} color="var(--muted-2)" />
              {isRenaming ? (
                <input className="app-input" value={rename.value} onChange={e => rename.setValue(e.target.value)} style={{ flex: 1, height: 32 }} autoFocus />
              ) : (
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{label}</span>
              )}
              {isRenaming ? (
                <>
                  <button type="button" className="app-icon-btn" onClick={() => saveRename(to)} aria-label="Save name"><Check size={14} /></button>
                  <button type="button" className="app-icon-btn" onClick={rename.cancel} aria-label="Cancel"><X size={14} /></button>
                </>
              ) : (
                <>
                  {item.isCustom ? (
                    <>
                      <button type="button" className="app-icon-btn" onClick={() => form.startEdit((customPages ?? []).find(p => pageRoute(p.id) === to)!)} aria-label="Edit page">
                        <Pencil size={14} />
                      </button>
                      <button type="button" className="app-icon-btn" onClick={() => removePage(to.replace('/app/pages/', ''))} aria-label="Delete page">
                        <Trash2 size={14} color="var(--danger)" />
                      </button>
                    </>
                  ) : (
                    <button type="button" className="app-icon-btn" onClick={() => rename.start(to, label)} aria-label="Rename">
                      <Pencil size={14} />
                    </button>
                  )}
                  <HideToggleButton hidden={hidden} onToggle={() => toggleHidden(to)} />
                </>
              )}
              <button type="button" className="app-icon-btn" disabled={i === 0} onClick={() => move(i, -1)} aria-label={t('admin.moveUp')}>
                <ArrowUp size={14} />
              </button>
              <button type="button" className="app-icon-btn" disabled={i === order.length - 1} onClick={() => move(i, 1)} aria-label={t('admin.moveDown')}>
                <ArrowDown size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <HiddenSectionsList
        items={order.filter(to => hiddenKeys.includes(to)).map(to => {
          const item = byTo.get(to);
          const label = item ? (item.isCustom ? item.label : (navLabels[to] || t(NAV_LABEL_KEYS[to] ?? '') || item.label)) : to;
          return { key: to, label };
        })}
        onRestore={toggleHidden}
      />

      {form.editingId ? (
        <CustomSectionForm
          title={form.title}
          body={form.body}
          onTitleChange={form.setTitle}
          onBodyChange={form.setBody}
          onSave={saveForm}
          onCancel={form.cancel}
          saving={form.saving}
          titlePlaceholder="Page title, e.g. Interview Tips"
        />
      ) : (
        <button type="button" className="app-btn app-btn-ghost app-btn-sm" style={{ marginTop: 10 }} onClick={form.startAdd}>
          <Plus size={14} /> Add page
        </button>
      )}
    </div>
  );
}

const ABOUT_TITLE_FIELD: Partial<Record<string, keyof AboutContent>> = {
  story: 'storyHeading', partner: 'partnerTitle', team: 'teamTitle',
};

function AboutSectionOrderCard() {
  const savedOrder = useAboutSectionOrder();
  const customSections = useAboutCustomSections();
  const hiddenKeys = useAboutHiddenSections();
  const form = useCustomItemForm();
  const rename = useInlineRename();

  const [about, setAbout] = useState<AboutContent>(DEFAULT_ABOUT);
  useEffect(() => subscribeAbout(setAbout), []);

  const customIds = (customSections ?? []).map(s => s.id);
  const order = mergeSectionOrder(savedOrder, DEFAULT_ABOUT_SECTION_ORDER, customIds);
  const customById = new Map((customSections ?? []).map(s => [s.id, s]));

  async function toggleHidden(key: string) {
    const next = hiddenKeys.includes(key) ? hiddenKeys.filter(k => k !== key) : [...hiddenKeys, key];
    await saveAboutHiddenSections(next);
  }

  async function saveRename(key: string) {
    const field = ABOUT_TITLE_FIELD[key];
    const v = rename.value.trim();
    if (field && v) {
      await saveAbout({ ...about, [field]: v });
    }
    rename.cancel();
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    await saveAboutSectionOrder(next);
  }

  async function removeSection(id: string) {
    if (!confirm('Delete this section entirely? This cannot be undone.')) return;
    await saveAboutCustomSections((customSections ?? []).filter(s => s.id !== id));
    await saveAboutSectionOrder(order.filter(k => k !== id));
  }

  async function saveForm() {
    const title = form.title.trim();
    if (!title) return;
    form.setSaving(true);
    try {
      if (form.editingId === '__new__') {
        const id = crypto.randomUUID();
        await saveAboutCustomSections([...(customSections ?? []), { id, title, body: form.body }]);
        await saveAboutSectionOrder([...order, id]);
      } else {
        await saveAboutCustomSections((customSections ?? []).map(s => s.id === form.editingId ? { ...s, title, body: form.body } : s));
      }
      form.cancel();
    } finally {
      form.setSaving(false);
    }
  }

  return (
    <div className="app-card app-card-pad">
      <div className="app-card-head">
        <div className="app-card-title">About page section order</div>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: -8, marginBottom: 14 }}>
        The order the section cards appear in on the About page. You can also add extra custom sections here.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {order.map((key, i) => {
          const custom = customById.get(key);
          const fixedField = ABOUT_TITLE_FIELD[key];
          const label = custom ? custom.title : (fixedField ? about[fixedField] as string : undefined) || ABOUT_SECTION_LABELS[key as keyof typeof ABOUT_SECTION_LABELS];
          if (!label) return null;
          const hidden = hiddenKeys.includes(key);
          if (hidden) return null;
          const isRenaming = rename.key === key;
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px' }}>
              {isRenaming ? (
                <input className="app-input" value={rename.value} onChange={e => rename.setValue(e.target.value)} style={{ flex: 1, height: 32 }} autoFocus />
              ) : (
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{label}</span>
              )}
              {isRenaming ? (
                <>
                  <button type="button" className="app-icon-btn" onClick={() => saveRename(key)} aria-label="Save name"><Check size={14} /></button>
                  <button type="button" className="app-icon-btn" onClick={rename.cancel} aria-label="Cancel"><X size={14} /></button>
                </>
              ) : (
                <>
                  {custom ? (
                    <>
                      <button type="button" className="app-icon-btn" onClick={() => form.startEdit(custom)} aria-label="Edit section">
                        <Pencil size={14} />
                      </button>
                      <button type="button" className="app-icon-btn" onClick={() => removeSection(key)} aria-label="Delete section">
                        <Trash2 size={14} color="var(--danger)" />
                      </button>
                    </>
                  ) : (
                    fixedField && (
                      <button type="button" className="app-icon-btn" onClick={() => rename.start(key, label)} aria-label="Rename">
                        <Pencil size={14} />
                      </button>
                    )
                  )}
                  <HideToggleButton hidden={hidden} onToggle={() => toggleHidden(key)} />
                </>
              )}
              <button type="button" className="app-icon-btn" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
                <ArrowUp size={14} />
              </button>
              <button type="button" className="app-icon-btn" disabled={i === order.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
                <ArrowDown size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <HiddenSectionsList
        items={order.filter(key => hiddenKeys.includes(key)).map(key => {
          const custom = customById.get(key);
          const fixedField = ABOUT_TITLE_FIELD[key];
          const label = custom ? custom.title : (fixedField ? about[fixedField] as string : undefined) || ABOUT_SECTION_LABELS[key as keyof typeof ABOUT_SECTION_LABELS] || key;
          return { key, label };
        })}
        onRestore={toggleHidden}
      />

      {form.editingId ? (
        <CustomSectionForm
          title={form.title}
          body={form.body}
          onTitleChange={form.setTitle}
          onBodyChange={form.setBody}
          onSave={saveForm}
          onCancel={form.cancel}
          saving={form.saving}
          titlePlaceholder="Section title"
        />
      ) : (
        <button type="button" className="app-btn app-btn-ghost app-btn-sm" style={{ marginTop: 10 }} onClick={form.startAdd}>
          <Plus size={14} /> Add section
        </button>
      )}
    </div>
  );
}

const HELP_TITLE_FIELD: Partial<Record<string, keyof HelpInfo>> = {
  email: 'emailTitle', embassy: 'embassyTitle', removingEntry: 'removingEntryTitle', community: 'communityTitle',
};

function HelpSectionOrderCard() {
  const savedOrder = useHelpSectionOrder();
  const customSections = useHelpCustomSections();
  const hiddenKeys = useHelpHiddenSections();
  const form = useCustomItemForm();
  const rename = useInlineRename();

  const [help, setHelp] = useState<HelpInfo>(DEFAULT_HELP);
  useEffect(() => subscribeHelp(setHelp), []);

  const customIds = (customSections ?? []).map(s => s.id);
  const order = mergeSectionOrder(savedOrder, DEFAULT_HELP_SECTION_ORDER, customIds);
  const customById = new Map((customSections ?? []).map(s => [s.id, s]));

  async function toggleHidden(key: string) {
    const next = hiddenKeys.includes(key) ? hiddenKeys.filter(k => k !== key) : [...hiddenKeys, key];
    await saveHelpHiddenSections(next);
  }

  async function saveRename(key: string) {
    const field = HELP_TITLE_FIELD[key];
    const v = rename.value.trim();
    if (field && v) {
      await saveHelp({ ...help, [field]: v });
    }
    rename.cancel();
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    await saveHelpSectionOrder(next);
  }

  async function removeSection(id: string) {
    if (!confirm('Delete this section entirely? This cannot be undone.')) return;
    await saveHelpCustomSections((customSections ?? []).filter(s => s.id !== id));
    await saveHelpSectionOrder(order.filter(k => k !== id));
  }

  async function saveForm() {
    const title = form.title.trim();
    if (!title) return;
    form.setSaving(true);
    try {
      if (form.editingId === '__new__') {
        const id = crypto.randomUUID();
        await saveHelpCustomSections([...(customSections ?? []), { id, title, body: form.body }]);
        await saveHelpSectionOrder([...order, id]);
      } else {
        await saveHelpCustomSections((customSections ?? []).map(s => s.id === form.editingId ? { ...s, title, body: form.body } : s));
      }
      form.cancel();
    } finally {
      form.setSaving(false);
    }
  }

  return (
    <div className="app-card app-card-pad">
      <div className="app-card-head">
        <div className="app-card-title">Help page section order</div>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: -8, marginBottom: 14 }}>
        The order the section cards appear in on the Help page. You can also add extra custom sections here.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {order.map((key, i) => {
          const custom = customById.get(key);
          const fixedField = HELP_TITLE_FIELD[key];
          const label = custom ? custom.title : (fixedField ? help[fixedField] as string : undefined) || HELP_SECTION_LABELS[key as keyof typeof HELP_SECTION_LABELS];
          if (!label) return null;
          const hidden = hiddenKeys.includes(key);
          if (hidden) return null;
          const isRenaming = rename.key === key;
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px' }}>
              {isRenaming ? (
                <input className="app-input" value={rename.value} onChange={e => rename.setValue(e.target.value)} style={{ flex: 1, height: 32 }} autoFocus />
              ) : (
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{label}</span>
              )}
              {isRenaming ? (
                <>
                  <button type="button" className="app-icon-btn" onClick={() => saveRename(key)} aria-label="Save name"><Check size={14} /></button>
                  <button type="button" className="app-icon-btn" onClick={rename.cancel} aria-label="Cancel"><X size={14} /></button>
                </>
              ) : (
                <>
                  {custom ? (
                    <>
                      <button type="button" className="app-icon-btn" onClick={() => form.startEdit(custom)} aria-label="Edit section">
                        <Pencil size={14} />
                      </button>
                      <button type="button" className="app-icon-btn" onClick={() => removeSection(key)} aria-label="Delete section">
                        <Trash2 size={14} color="var(--danger)" />
                      </button>
                    </>
                  ) : (
                    fixedField && (
                      <button type="button" className="app-icon-btn" onClick={() => rename.start(key, label)} aria-label="Rename">
                        <Pencil size={14} />
                      </button>
                    )
                  )}
                  <HideToggleButton hidden={hidden} onToggle={() => toggleHidden(key)} />
                </>
              )}
              <button type="button" className="app-icon-btn" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
                <ArrowUp size={14} />
              </button>
              <button type="button" className="app-icon-btn" disabled={i === order.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
                <ArrowDown size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <HiddenSectionsList
        items={order.filter(key => hiddenKeys.includes(key)).map(key => {
          const custom = customById.get(key);
          const fixedField = HELP_TITLE_FIELD[key];
          const label = custom ? custom.title : (fixedField ? help[fixedField] as string : undefined) || HELP_SECTION_LABELS[key as keyof typeof HELP_SECTION_LABELS] || key;
          return { key, label };
        })}
        onRestore={toggleHidden}
      />

      {form.editingId ? (
        <CustomSectionForm
          title={form.title}
          body={form.body}
          onTitleChange={form.setTitle}
          onBodyChange={form.setBody}
          onSave={saveForm}
          onCancel={form.cancel}
          saving={form.saving}
          titlePlaceholder="Section title"
        />
      ) : (
        <button type="button" className="app-btn app-btn-ghost app-btn-sm" style={{ marginTop: 10 }} onClick={form.startAdd}>
          <Plus size={14} /> Add section
        </button>
      )}
    </div>
  );
}
