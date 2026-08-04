import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, X } from 'lucide-react';
import { useApplicants } from '../hooks/useApplicants';
import { fmtDate } from '../utils/dateHelpers';

const SEEN_KEY = 'visa-tracker-seen-reminders';

function loadSeen(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}');
  } catch {
    return {};
  }
}

export default function NotificationBell() {
  const { enriched } = useApplicants();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<Record<string, string>>(loadSeen);

  const due = enriched
    .filter(a => a.effectiveReminderStatus === 'Urgent')
    .sort((a, b) => a.reminderDaysLeft - b.reminderDaysLeft);

  const unseenCount = due.filter(a => seen[a.id] !== a.lastUpdated).length;

  function handleOpen() {
    setOpen(true);
    const next = { ...seen };
    due.forEach(a => { next[a.id] = a.lastUpdated; });
    setSeen(next);
    localStorage.setItem(SEEN_KEY, JSON.stringify(next));
  }

  return (
    <>
      <button className="app-icon-btn app-notif-btn" onClick={handleOpen} aria-label="Reminders due">
        <Bell size={18} />
        {unseenCount > 0 && <span className="app-notif-badge">{unseenCount > 9 ? '9+' : unseenCount}</span>}
      </button>

      {open && <div className="app-notif-backdrop" onClick={() => setOpen(false)} />}
      <div className={`app-notif-drawer${open ? ' open' : ''}`}>
        <div className="app-notif-drawer-head">
          <div className="app-card-title">Reminders due</div>
          <button className="app-icon-btn" onClick={() => setOpen(false)} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {due.length === 0 ? (
          <div className="app-empty">No 30-day reminders due right now.</div>
        ) : (
          due.map(a => (
            <Link key={a.id} to="/app/applications" className="app-notif-item" onClick={() => setOpen(false)}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{a.name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>Last updated {fmtDate(a.lastUpdated)}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12.5, fontWeight: 600, color: 'var(--danger)' }}>
                <span className="app-dot" style={{ background: 'var(--danger)' }} />
                {a.reminderDaysLeft === 0 ? 'Due today' : `${Math.abs(a.reminderDaysLeft)}d overdue`}
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
