import { useEffect, useState } from 'react';
import { ShieldCheck, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { subscribeAdmins, addAdmin, removeAdmin } from '../../services/adminsService';
import { saveApplicantNavOrder } from '../../services/navOrderService';
import { useApplicantNavOrder } from '../../hooks/useNavOrder';
import { APPLICANT_NAV } from '../../constants/nav';
import { OWNER_EMAIL } from '../../constants/roles';

export default function AdminAdmins() {
  const [admins, setAdmins] = useState<string[] | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  useEffect(() => subscribeAdmins(setAdmins), []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const email = newEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) { setError('Enter a valid email address.'); return; }
    if (email === OWNER_EMAIL || admins?.includes(email)) { setError('Already an admin.'); return; }
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
      <PageHeader title="Admins" subtitle="Who has full admin access to VisaTrack." />
      <div className="app-content">
        <div className="app-card app-card-pad">
          <div className="app-card-head">
            <div className="app-card-title">Add an admin</div>
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
              <Plus size={14} /> Add
            </button>
          </form>
          {error && <div style={{ color: 'var(--danger)', fontSize: 12.5, marginTop: 8 }}>{error}</div>}
        </div>

        <div className="app-card app-card-pad">
          <div className="app-card-head">
            <div className="app-card-title">Current admins</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 10 }}>
              <ShieldCheck size={16} color="var(--violet)" />
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{OWNER_EMAIL}</span>
              <span className="app-badge" style={{ background: 'var(--violet-soft)', color: 'var(--violet)' }}>Owner</span>
            </div>

            {admins === null ? (
              <div className="app-empty">Loading…</div>
            ) : admins.length === 0 ? (
              <div style={{ fontSize: 12.5, color: 'var(--muted)', padding: '4px 2px' }}>No other admins yet.</div>
            ) : (
              admins.map(email => (
                <div key={email} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 10 }}>
                  <ShieldCheck size={16} color="var(--muted-2)" />
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{email}</span>
                  {confirmRemove === email ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="app-btn app-btn-danger app-btn-sm" onClick={() => handleRemove(email)}>Confirm</button>
                      <button className="app-btn app-btn-ghost app-btn-sm" onClick={() => setConfirmRemove(null)}>Cancel</button>
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
      </div>
    </>
  );
}

function ApplicantNavOrderCard() {
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
        <div className="app-card-title">Applicant sidebar order</div>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: -8, marginBottom: 14 }}>
        What applicants see first in their sidebar.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {order.map((to, i) => {
          const item = byTo.get(to);
          if (!item) return null;
          const Icon = item.icon;
          return (
            <div key={to} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px' }}>
              <Icon size={15} color="var(--muted-2)" />
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{item.label}</span>
              <button type="button" className="app-icon-btn" disabled={saving || i === 0} onClick={() => move(i, -1)} aria-label="Move up">
                <ArrowUp size={14} />
              </button>
              <button type="button" className="app-icon-btn" disabled={saving || i === order.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
                <ArrowDown size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
