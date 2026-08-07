import { useEffect, useState } from 'react';
import { ShieldCheck, Plus, Trash2, Pencil, ArrowUp, ArrowDown, FileText, Eye, EyeOff } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import CustomSectionForm from '../../components/CustomSectionForm';
import { subscribeAdmins, addAdmin, removeAdmin } from '../../services/adminsService';
import { saveApplicantNavOrder, saveApplicantNavHidden } from '../../services/navOrderService';
import {
  saveAboutSectionOrder, saveHelpSectionOrder,
  saveAboutCustomSections, saveHelpCustomSections,
  saveAboutHiddenSections, saveHelpHiddenSections,
} from '../../services/siteContentService';
import { saveCustomPages } from '../../services/customPagesService';
import { useApplicantNavOrder } from '../../hooks/useNavOrder';
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
import type { CustomSection } from '../../types';

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
              <div className="app-empty">{t('common.loading')}</div>
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

        <ApplicantNavOrderCard />
        <AboutSectionOrderCard />
        <HelpSectionOrderCard />
      </div>
    </>
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

// Shown on every row (fixed or custom) — fixed sections can't be deleted,
// but can be hidden from the page without losing their content.
function HideToggleButton({ hidden, onToggle }: { hidden: boolean; onToggle: () => void }) {
  return (
    <button type="button" className="app-icon-btn" onClick={onToggle} aria-label={hidden ? 'Show on page' : 'Hide from page'} title={hidden ? 'Hidden — click to show' : 'Click to hide from page'}>
      {hidden ? <EyeOff size={14} color="var(--danger)" /> : <Eye size={14} />}
    </button>
  );
}

function ApplicantNavOrderCard() {
  const { t } = useLanguage();
  const savedOrder = useApplicantNavOrder();
  const customPages = useCustomPages();
  const hiddenKeys = useApplicantNavHidden();
  const form = useCustomItemForm();

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

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    await saveApplicantNavOrder(next);
  }

  async function removePage(id: string) {
    if (!confirm('Remove this page from the sidebar? This deletes its content too.')) return;
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
          const Icon = item.icon;
          const label = item.isCustom ? item.label : (t(NAV_LABEL_KEYS[to] ?? '') || item.label);
          const hidden = hiddenKeys.includes(to);
          return (
            <div key={to} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px', opacity: hidden ? 0.55 : 1 }}>
              <Icon size={15} color="var(--muted-2)" />
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{label}{hidden && ' (hidden)'}</span>
              <HideToggleButton hidden={hidden} onToggle={() => toggleHidden(to)} />
              {item.isCustom && (
                <>
                  <button type="button" className="app-icon-btn" onClick={() => form.startEdit((customPages ?? []).find(p => pageRoute(p.id) === to)!)} aria-label="Edit page">
                    <Pencil size={14} />
                  </button>
                  <button type="button" className="app-icon-btn" onClick={() => removePage(to.replace('/app/pages/', ''))} aria-label="Remove page">
                    <Trash2 size={14} />
                  </button>
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

function AboutSectionOrderCard() {
  const savedOrder = useAboutSectionOrder();
  const customSections = useAboutCustomSections();
  const hiddenKeys = useAboutHiddenSections();
  const form = useCustomItemForm();

  const customIds = (customSections ?? []).map(s => s.id);
  const order = mergeSectionOrder(savedOrder, DEFAULT_ABOUT_SECTION_ORDER, customIds);
  const customById = new Map((customSections ?? []).map(s => [s.id, s]));

  async function toggleHidden(key: string) {
    const next = hiddenKeys.includes(key) ? hiddenKeys.filter(k => k !== key) : [...hiddenKeys, key];
    await saveAboutHiddenSections(next);
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    await saveAboutSectionOrder(next);
  }

  async function removeSection(id: string) {
    if (!confirm('Remove this section from the About page?')) return;
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
          const label = custom ? custom.title : ABOUT_SECTION_LABELS[key as keyof typeof ABOUT_SECTION_LABELS];
          if (!label) return null;
          const hidden = hiddenKeys.includes(key);
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px', opacity: hidden ? 0.55 : 1 }}>
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{label}{hidden && ' (hidden)'}</span>
              <HideToggleButton hidden={hidden} onToggle={() => toggleHidden(key)} />
              {custom && (
                <>
                  <button type="button" className="app-icon-btn" onClick={() => form.startEdit(custom)} aria-label="Edit section">
                    <Pencil size={14} />
                  </button>
                  <button type="button" className="app-icon-btn" onClick={() => removeSection(key)} aria-label="Remove section">
                    <Trash2 size={14} />
                  </button>
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

function HelpSectionOrderCard() {
  const savedOrder = useHelpSectionOrder();
  const customSections = useHelpCustomSections();
  const hiddenKeys = useHelpHiddenSections();
  const form = useCustomItemForm();

  const customIds = (customSections ?? []).map(s => s.id);
  const order = mergeSectionOrder(savedOrder, DEFAULT_HELP_SECTION_ORDER, customIds);
  const customById = new Map((customSections ?? []).map(s => [s.id, s]));

  async function toggleHidden(key: string) {
    const next = hiddenKeys.includes(key) ? hiddenKeys.filter(k => k !== key) : [...hiddenKeys, key];
    await saveHelpHiddenSections(next);
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    await saveHelpSectionOrder(next);
  }

  async function removeSection(id: string) {
    if (!confirm('Remove this section from the Help page?')) return;
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
          const label = custom ? custom.title : HELP_SECTION_LABELS[key as keyof typeof HELP_SECTION_LABELS];
          if (!label) return null;
          const hidden = hiddenKeys.includes(key);
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px', opacity: hidden ? 0.55 : 1 }}>
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{label}{hidden && ' (hidden)'}</span>
              <HideToggleButton hidden={hidden} onToggle={() => toggleHidden(key)} />
              {custom && (
                <>
                  <button type="button" className="app-icon-btn" onClick={() => form.startEdit(custom)} aria-label="Edit section">
                    <Pencil size={14} />
                  </button>
                  <button type="button" className="app-icon-btn" onClick={() => removeSection(key)} aria-label="Remove section">
                    <Trash2 size={14} />
                  </button>
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
