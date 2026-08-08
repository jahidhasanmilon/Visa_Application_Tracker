import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useMyApplicants } from '../hooks/useMyApplicants';
import { useRoadmapTemplate } from '../hooks/useTemplates';
import { enrichApplicant, todayStr } from '../utils/dateHelpers';

// Applicant-side variant of NotificationBell.tsx — scoped to the signed-in
// applicant's own record(s) instead of scanning the whole collection (which
// they don't have read access to anyway). Self-contained (subscribes to its
// own data off `uid`) so it can be mounted directly in AppShell. One person
// can own more than one application record, so this checks all of them and
// lists every one that's due.
export default function ApplicantNotificationBell({ uid }: { uid: string }) {
  const [open, setOpen] = useState(false);
  const { myApplicants } = useMyApplicants(uid);
  const roadmapTemplate = useRoadmapTemplate();

  if (!myApplicants || !roadmapTemplate) return null;
  const today = todayStr();
  const due = myApplicants
    .map(a => enrichApplicant(a, today, roadmapTemplate))
    .filter(a => a.effectiveReminderStatus === 'Urgent');

  return (
    <>
      <button className="app-icon-btn app-notif-btn" onClick={() => setOpen(true)} aria-label="Reminders due">
        <Bell size={18} />
        {due.length > 0 && <span className="app-notif-badge">{due.length}</span>}
      </button>

      {open && <div className="app-notif-backdrop" onClick={() => setOpen(false)} />}
      <div className={`app-notif-drawer${open ? ' open' : ''}`}>
        <div className="app-notif-drawer-head">
          <div className="app-card-title">Reminders</div>
          <button className="app-icon-btn" onClick={() => setOpen(false)} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {due.length === 0 ? (
          <div className="app-empty">Nothing due right now.</div>
        ) : (
          due.map(a => (
            <div key={a.id} className="app-notif-item">
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                Confirm Application Request (30-Day){a.name ? ` — ${a.name}` : ''}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
                It's been over 30 days since your last update.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12.5, fontWeight: 600, color: 'var(--danger)' }}>
                <span className="app-dot" style={{ background: 'var(--danger)' }} />
                {a.reminderDaysLeft === 0 ? 'Due today' : `${Math.abs(a.reminderDaysLeft)}d overdue`}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
