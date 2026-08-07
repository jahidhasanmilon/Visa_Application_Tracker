import { useState } from 'react';
import { updateMyDetails } from '../services/applicantsService';
import { todayStr, splitDateTimeUtc, combineDateTimeUtc } from '../utils/dateHelpers';
import type { Applicant } from '../types';

interface ApplicantDetailsModalProps {
  open: boolean;
  applicant: Applicant;
  onClose: () => void;
}

// Used both as the automatic first-run "Add your details" prompt and the
// permanent "Edit my details" entry point (Applicant Dashboard + Profile).
// Later/Cancel always dismisses without saving — required-field validation
// only blocks Save, never blocks leaving the popup.
export default function ApplicantDetailsModal({ open, applicant, onClose }: ApplicantDetailsModalProps) {
  const [name, setName] = useState(applicant.name);
  const [serialNo, setSerialNo] = useState(applicant.serialNo);
  const [created, setCreated] = useState(applicant.created);
  const [submitted, setSubmitted] = useState(applicant.submitted);
  const [lastUpdated, setLastUpdated] = useState(applicant.lastUpdated || todayStr());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const lastUpdatedParts = splitDateTimeUtc(lastUpdated);
  function setLastUpdatedDate(date: string) {
    setLastUpdated(combineDateTimeUtc(date, lastUpdatedParts.time));
  }
  function setLastUpdatedTime(time: string) {
    setLastUpdated(combineDateTimeUtc(lastUpdatedParts.date, time));
  }

  async function handleSave() {
    if (!name.trim() || !created || !submitted || !lastUpdatedParts.date) {
      setError('Name, creation date, waiting list joined date, and last edited date are all required.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await updateMyDetails(applicant.id, { name: name.trim(), serialNo: serialNo.trim(), created, submitted, lastUpdated });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-modal-backdrop" onClick={onClose}>
      <div className="app-modal" onClick={e => e.stopPropagation()}>
        <h3>Add your details</h3>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: -8, marginBottom: 16 }}>
          This keeps your tracker accurate — you can always come back and update it later.
        </p>

        <div className="app-field">
          <label>Full name *</label>
          <input className="app-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
        </div>

        <div className="app-field">
          <label>Serial No <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(if you have one)</span></label>
          <input className="app-input" value={serialNo} onChange={e => setSerialNo(e.target.value)} placeholder="e.g. AP/260/051125/000001183" />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div className="app-field" style={{ flex: 1 }}>
            <label>Creation date *</label>
            <input className="app-input" type="date" value={created} onChange={e => setCreated(e.target.value)} />
          </div>
          <div className="app-field" style={{ flex: 1 }}>
            <label>Waiting List Joined Date *</label>
            <input className="app-input" type="date" value={submitted} onChange={e => setSubmitted(e.target.value)} />
          </div>
        </div>

        <div className="app-field">
          <label>Last Edited (UTC) *</label>
          <div style={{ display: 'flex', gap: 12 }}>
            <input className="app-input" type="date" value={lastUpdatedParts.date} onChange={e => setLastUpdatedDate(e.target.value)} style={{ flex: 1 }} />
            <input className="app-input" type="time" lang="en-GB" value={lastUpdatedParts.time} onChange={e => setLastUpdatedTime(e.target.value)} style={{ flex: 1 }} />
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 6 }}>
            The 30-day reminder countdown counts down from this date and time — it jumps to now automatically only when you mark the reminder as Done.
          </div>
        </div>

        {error && <div style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 8 }}>{error}</div>}

        <div className="app-modal-actions">
          <button className="app-btn app-btn-ghost" onClick={onClose} disabled={saving}>Later</button>
          <button className="app-btn app-btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}
