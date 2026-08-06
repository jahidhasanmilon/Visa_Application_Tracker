import { useEffect, useState } from 'react';
import { ShieldCheck, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { subscribeAdmins, addAdmin, removeAdmin } from '../../services/adminsService';
import { saveApplicantNavOrder } from '../../services/navOrderService';
import { saveAboutSectionOrder } from '../../services/siteContentService';
import { useApplicantNavOrder } from '../../hooks/useNavOrder';
import { useAboutSectionOrder } from '../../hooks/useAboutSectionOrder';
import { APPLICANT_NAV, NAV_LABEL_KEYS } from '../../constants/nav';
import { ABOUT_SECTION_LABELS, DEFAULT_ABOUT_SECTION_ORDER, type AboutSectionKey } from '../../constants/aboutSections';
import { OWNER_EMAIL } from '../../constants/roles';
import { useLanguage } from '../../i18n/LanguageContext';

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
      </div>
    </>
  );
}

function ApplicantNavOrderCard() {
  const { t } = useLanguage();
  const savedOrder = useApplicantNavOrder();
  const order = savedOrder && savedOrder.length > 0
    ? [...savedOrder, ...APPLICANT_NAV.map(i => i.to).filter(to => !savedOrder.includes(to))]
    : APPLICANT_NAV.map(i => i.to);
  const [saving, setSaving] = useState(false);

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setSaving(true);
    try {
      await saveApplicantNavOrder(next);
    } finally {
      setSaving(false);
    }
  }

  const byTo = new Map(APPLICANT_NAV.map(i => [i.to, i]));

  return (
    <div className="app-card app-card-pad">
      <div className="app-card-head">
        <div className="app-card-title">{t('admin.navOrderTitle')}</div>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: -8, marginBottom: 14 }}>
        {t('admin.navOrderSubtitle')}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {order.map((to, i) => {
          const item = byTo.get(to);
          if (!item) return null;
          const Icon = item.icon;
          const label = t(NAV_LABEL_KEYS[to] ?? '') || item.label;
          return (
            <div key={to} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px' }}>
              <Icon size={15} color="var(--muted-2)" />
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{label}</span>
              <button type="button" className="app-icon-btn" disabled={saving || i === 0} onClick={() => move(i, -1)} aria-label={t('admin.moveUp')}>
                <ArrowUp size={14} />
              </button>
              <button type="button" className="app-icon-btn" disabled={saving || i === order.length - 1} onClick={() => move(i, 1)} aria-label={t('admin.moveDown')}>
                <ArrowDown size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AboutSectionOrderCard() {
  const savedOrder = useAboutSectionOrder();
  const order: AboutSectionKey[] = savedOrder && savedOrder.length > 0
    ? [
        ...savedOrder.filter((k): k is AboutSectionKey => (DEFAULT_ABOUT_SECTION_ORDER as string[]).includes(k)),
        ...DEFAULT_ABOUT_SECTION_ORDER.filter(k => !savedOrder.includes(k)),
      ]
    : DEFAULT_ABOUT_SECTION_ORDER;
  const [saving, setSaving] = useState(false);

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setSaving(true);
    try {
      await saveAboutSectionOrder(next);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-card app-card-pad">
      <div className="app-card-head">
        <div className="app-card-title">About page section order</div>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: -8, marginBottom: 14 }}>
        The order the section cards appear in on the About page.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {order.map((key, i) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px' }}>
            <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{ABOUT_SECTION_LABELS[key]}</span>
            <button type="button" className="app-icon-btn" disabled={saving || i === 0} onClick={() => move(i, -1)} aria-label="Move up">
              <ArrowUp size={14} />
            </button>
            <button type="button" className="app-icon-btn" disabled={saving || i === order.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
              <ArrowDown size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
