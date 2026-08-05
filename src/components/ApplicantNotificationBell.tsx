import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useMyApplicant } from '../hooks/useMyApplicant';
import { useRoadmapTemplate } from '../hooks/useTemplates';
import { enrichApplicant, todayStr } from '../utils/dateHelpers';

// Applicant-side variant of NotificationBell.tsx — scoped to the signed-in
// applicant's own record instead of scanning the whole collection (which
// they don't have read access to anyway). Self-contained (subscribes to its
// own data off `uid`) so it can be mounted directly in AppShell.
export default function ApplicantNotificationBell({ uid }: { uid: string }) {
  const [open, setOpen] = useState(false);
  const { myApplicant } = useMyApplicant(uid);
  const roadmapTemplate = useRoadmapTemplate();

  if (!myApplicant || !roadmapTemplate) return null;
  const a = enrichApplicant(myApplicant, todayStr(), roadmapTemplate);
  const due = a.effectiveReminderStatus === 'Urgent';

  return (
    <>
      <button className="app-icon-btn app-notif-btn" onClick={() => setOpen(true)} aria-label="Reminders due">
        <Bell size={18} />
        {due && <span className="app-notif-badge">1</span>}
      </button>

      {open && <div className="app-notif-backdrop" onClick={() => setOpen(false)} />}
      <div className={`app-notif-drawer${open ? ' open' : ''}`}>
        <div className="app-notif-drawer-head">
          <div className="app-card-title">Reminders</div>
          <button className="app-icon-btn" onClick={() => setOpen(false)} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {!due ? (
          <div className="app-empty">Nothing due right now.</div>
        ) : (
          <div className="app-notif-item">
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>Application Reminder (30-Day)</div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
              It's been over 30 days since your last update.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12.5, fontWeight: 600, color: 'var(--danger)' }}>
              <span className="app-dot" style={{ background: 'var(--danger)' }} />
              {a.reminderDaysLeft === 0 ? 'Due today' : `${Math.abs(a.reminderDaysLeft)}d overdue`}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
