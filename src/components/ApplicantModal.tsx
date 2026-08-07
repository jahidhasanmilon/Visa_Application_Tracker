import { REMINDER_OPTIONS, REMINDER_LABELS } from '../constants/status';
import { splitDateTimeUtc, combineDateTimeUtc } from '../utils/dateHelpers';
import type { ApplicantFormData, ReminderStatus } from '../types';

interface ApplicantModalProps {
  open: boolean;
  isEditing: boolean;
  form: ApplicantFormData;
  setForm: (f: ApplicantFormData) => void;
  onSave: () => void;
  onClose: () => void;
}

export default function ApplicantModal({
  open, isEditing, form, setForm, onSave, onClose,
}: ApplicantModalProps) {
  if (!open) return null;

  const lastUpdated = splitDateTimeUtc(form.lastUpdated);
  function setLastUpdatedDate(date: string) {
    setForm({ ...form, lastUpdated: combineDateTimeUtc(date, lastUpdated.time) });
  }
  function setLastUpdatedTime(time: string) {
    setForm({ ...form, lastUpdated: combineDateTimeUtc(lastUpdated.date, time) });
  }

  return (
    <div className="app-modal-backdrop" onClick={onClose}>
      <div className="app-modal" onClick={e => e.stopPropagation()}>
        <h3>{isEditing ? 'Edit applicant' : 'Add applicant'}</h3>

        <div className="app-field">
          <label>Serial No</label>
          <input className="app-input" value={form.serialNo} onChange={e => setForm({ ...form, serialNo: e.target.value })} placeholder="e.g. AP/260/051125/000001183" />
        </div>

        <div className="app-field">
          <label>Name</label>
          <input className="app-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Applicant name" />
        </div>

        <div className="app-field">
          <label>Email</label>
          <input className="app-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div className="app-field" style={{ flex: 1 }}>
            <label>Creation on</label>
            <input className="app-input" type="date" value={form.created} onChange={e => setForm({ ...form, created: e.target.value })} />
          </div>
          <div className="app-field" style={{ flex: 1 }}>
            <label>Waiting List Joined On</label>
            <input className="app-input" type="date" value={form.submitted} onChange={e => setForm({ ...form, submitted: e.target.value })} />
          </div>
        </div>

        <div className="app-field">
          <label>Last Edited (UTC)</label>
          <div style={{ display: 'flex', gap: 12 }}>
            <input className="app-input" type="date" value={lastUpdated.date} onChange={e => setLastUpdatedDate(e.target.value)} style={{ flex: 1 }} />
            <input className="app-input" type="time" lang="en-GB" value={lastUpdated.time} onChange={e => setLastUpdatedTime(e.target.value)} style={{ flex: 1 }} />
          </div>
        </div>

        <div className="app-field">
          <label>Notes</label>
          <textarea className="app-textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Interview feedback, contact details, etc." />
        </div>

        <div className="app-field">
          <label>Confirm Application Request (30-Day)</label>
          <select className="app-select" value={form.reminderMailSent} onChange={e => setForm({ ...form, reminderMailSent: e.target.value as ReminderStatus })}>
            {REMINDER_OPTIONS.map(r => <option key={r} value={r}>{REMINDER_LABELS[r]}</option>)}
          </select>
        </div>

        <div className="app-modal-actions">
          <button className="app-btn app-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="app-btn app-btn-primary" onClick={onSave}>{isEditing ? 'Save changes' : 'Add applicant'}</button>
        </div>
      </div>
    </div>
  );
}
