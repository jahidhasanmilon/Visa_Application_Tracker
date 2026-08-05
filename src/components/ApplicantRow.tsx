import { Pencil, Trash2 } from 'lucide-react';
import { getStatusMeta, REMINDER_META, REMINDER_LABELS } from '../constants/status';
import { fmtDate } from '../utils/dateHelpers';
import type { EnrichedApplicant } from '../types';

interface ApplicantRowProps {
  applicant: EnrichedApplicant;
  onEdit: (a: EnrichedApplicant) => void;
  onDelete: (id: string) => void;
  confirmingDelete: boolean;
  onAskDelete: (id: string) => void;
  onCancelDelete: () => void;
}

export default function ApplicantRow({
  applicant, onEdit, onDelete, confirmingDelete, onAskDelete, onCancelDelete,
}: ApplicantRowProps) {
  const a = applicant;
  const meta = getStatusMeta(a.status);
  const Icon = meta.icon;
  const reminderMeta = REMINDER_META[a.effectiveReminderStatus] || REMINDER_META['Not yet'];

  return (
    <tr>
      <td className="app-mono" style={{ color: 'var(--muted)', fontSize: 12 }}>{a.serialNo}</td>
      <td>
        <div style={{ fontWeight: 600 }}>{a.name}</div>
        <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{a.email || 'no email on file'}</div>
      </td>
      <td>
        <span className="app-badge" style={{ background: meta.bg, color: meta.color }}>
          <Icon size={13} /> {a.status}
        </span>
      </td>
      <td className="app-mono" style={{ fontSize: 12.5 }}>{fmtDate(a.created)}</td>
      <td className="app-mono" style={{ fontSize: 12.5 }}>{fmtDate(a.submitted)}</td>
      <td>{a.waiting === null ? '—' : `${a.waiting}d`}</td>
      <td>
        <span className="app-dot" style={{ background: a.urg.color, marginRight: 6 }} />
        {a.remaining === null ? 'Not submitted' : a.remaining > 0 ? `${a.remaining}d left` : `${Math.abs(a.remaining)}d overdue`}
      </td>
      <td className="app-mono" style={{ fontSize: 12.5 }}>{fmtDate(a.lastUpdated)}</td>
      <td>
        <span className="app-badge" style={{ background: reminderMeta.bg, color: reminderMeta.color, marginRight: 6 }}>
          {REMINDER_LABELS[a.effectiveReminderStatus]}
        </span>
        <span style={{ fontSize: 11.5, color: a.reminderDaysLeft > 0 ? 'var(--muted)' : 'var(--danger)' }}>
          {a.reminderDaysLeft > 0 ? `${a.reminderDaysLeft}d left` : a.reminderDaysLeft === 0 ? 'Due today' : `${Math.abs(a.reminderDaysLeft)}d overdue`}
        </span>
      </td>
      <td style={{ maxWidth: 160, fontSize: 12.5, color: 'var(--muted)' }}>{a.notes || '—'}</td>
      <td style={{ position: 'relative', whiteSpace: 'nowrap' }}>
        <button className="app-icon-btn" onClick={() => onEdit(a)}><Pencil size={15} /></button>
        <button className="app-icon-btn" onClick={() => onAskDelete(a.id)}><Trash2 size={15} /></button>
        {confirmingDelete && (
          <div className="app-confirm" style={{ right: 0, top: '100%' }}>
            <div style={{ marginBottom: 8 }}>Delete {a.name}?</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="app-btn app-btn-danger app-btn-sm" onClick={() => onDelete(a.id)}>Delete</button>
              <button className="app-btn app-btn-ghost app-btn-sm" onClick={onCancelDelete}>Cancel</button>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}
