import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { updateReminderStatus, updateRoadmap, updateMyStatus, updateMySubmitted } from '../../services/applicantsService';
import { enrichApplicant, fmtDate, todayStr } from '../../utils/dateHelpers';
import { getStatusMeta, STATUS_OPTIONS, REMINDER_OPTIONS, REMINDER_META } from '../../constants/status';
import { DEFAULT_ROADMAP_LABELS } from '../../constants/roadmap';
import { DEFAULT_CHECKLIST_LABELS } from '../../constants/checklist';
import type { Applicant, ChecklistItem, EnrichedApplicant, ReminderStatus, StatusOption } from '../../types';

interface ApplicantDashboardProps {
  applicant: Applicant;
}

export default function ApplicantDashboard({ applicant }: ApplicantDashboardProps) {
  const enriched = useMemo(() => enrichApplicant(applicant, todayStr()), [applicant]);

  return (
    <>
      <PageHeader title="My Status" subtitle="Track your own progress — you're in control of this record." />
      <div className="app-content">
        <ApplicationCard a={enriched} />
      </div>
    </>
  );
}

function countdownColors(days: number): { bg: string; color: string } {
  if (days <= 0) return { bg: 'var(--danger-soft)', color: 'var(--danger)' };
  if (days <= 7) return { bg: 'var(--warning-soft)', color: 'var(--warning-ink)' };
  return { bg: 'var(--success-soft)', color: 'var(--success)' };
}

function ApplicationCard({ a }: { a: EnrichedApplicant }) {
  const meta = getStatusMeta(a.status);
  const rejected = a.status === 'Rejected';
  const [savingReminder, setSavingReminder] = useState(false);
  const [savingRoadmap, setSavingRoadmap] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingSubmitted, setSavingSubmitted] = useState(false);

  const roadmap = useMemo(() => (
    a.roadmap && a.roadmap.length > 0
      ? a.roadmap
      : DEFAULT_ROADMAP_LABELS.map(label => ({ id: label, label, done: false }))
  ), [a.roadmap]);

  const checklist = useMemo(() => (
    a.checklist && a.checklist.length > 0
      ? a.checklist
      : DEFAULT_CHECKLIST_LABELS.map(label => ({ id: label, label, done: false }))
  ), [a.checklist]);

  const totalDone = roadmap.filter(s => s.done).length + checklist.filter(i => i.done).length;
  const totalItems = roadmap.length + checklist.length;
  const progressPct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

  async function handleReminderChange(value: ReminderStatus) {
    setSavingReminder(true);
    try {
      await updateReminderStatus(a.id, value);
    } finally {
      setSavingReminder(false);
    }
  }

  async function handleStatusChange(value: StatusOption) {
    setSavingStatus(true);
    try {
      await updateMyStatus(a.id, value);
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleSubmittedChange(value: string) {
    setSavingSubmitted(true);
    try {
      await updateMySubmitted(a.id, value);
    } finally {
      setSavingSubmitted(false);
    }
  }

  async function toggleStep(step: ChecklistItem) {
    setSavingRoadmap(true);
    try {
      const next = roadmap.map(s => s.id === step.id ? { ...s, done: !s.done } : s);
      await updateRoadmap(a.id, next);
    } finally {
      setSavingRoadmap(false);
    }
  }

  const countdown = countdownColors(a.reminderDaysLeft);

  return (
    <div className="app-card app-card-pad">
      <div className="app-card-head" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="app-card-title">{a.name}</div>
          {a.serialNo && <div className="app-mono" style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{a.serialNo}</div>}
          <span className="app-badge" style={{ background: meta.bg, color: meta.color, fontSize: 13, padding: '6px 14px', marginTop: 10, display: 'inline-flex' }}>
            <meta.icon size={14} /> {a.status}
          </span>
        </div>

        <div style={{
          textAlign: 'center', minWidth: 96, padding: '10px 14px', borderRadius: 14,
          background: countdown.bg, color: countdown.color, flexShrink: 0,
        }}>
          <div className="app-brand-font" style={{ fontWeight: 800, fontSize: 30, lineHeight: 1 }}>
            {Math.abs(a.reminderDaysLeft)}
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 3 }}>
            {a.reminderDaysLeft > 0 ? 'days left' : a.reminderDaysLeft === 0 ? 'due today' : 'days overdue'}
          </div>
          <div style={{ fontSize: 9.5, opacity: 0.8, marginTop: 2 }}>Reminder (30-Day)</div>
        </div>
      </div>

      <ProgressBar pct={progressPct} />

      {rejected ? (
        <div style={{ background: 'var(--danger-soft)', color: 'var(--danger)', borderRadius: 12, padding: '14px 16px', fontSize: 13.5, fontWeight: 500, marginTop: 16 }}>
          This application was not approved.
        </div>
      ) : (
        <div
          className="app-roadmap-track"
          style={{ '--rm-cols': Math.max(1, Math.ceil(roadmap.length / 2)) } as React.CSSProperties}
        >
          {roadmap.map((step, i) => (
            <div key={step.id} className="app-roadmap-step">
              <button
                type="button"
                className="app-roadmap-step-btn"
                onClick={() => toggleStep(step)}
                disabled={savingRoadmap}
                title={step.done ? 'Mark as not yet' : 'Mark as done'}
              >
                <div
                  className="app-roadmap-circle"
                  style={{
                    background: step.done ? 'var(--success)' : 'var(--neutral-soft)',
                    color: step.done ? '#fff' : 'var(--muted-2)',
                  }}
                >
                  {step.done ? <Check size={13} /> : i + 1}
                </div>
                <div
                  className="app-roadmap-label"
                  style={{ color: step.done ? 'var(--ink)' : 'var(--muted-2)', fontWeight: step.done ? 600 : 500 }}
                >
                  {step.label}
                </div>
              </button>
              {i < roadmap.length - 1 && (
                <div className="app-roadmap-connector" style={{ background: step.done ? 'var(--success)' : 'var(--border)' }} />
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
        <Field label="Applied on" value={fmtDate(a.created)} />
        <Field
          label="Waiting"
          value={a.waiting === null ? '—' : `${a.waiting} days`}
        />
        <Field
          label={a.remaining === null ? 'Estimated remaining' : a.remaining > 0 ? 'Estimated remaining' : 'Status'}
          value={a.remaining === null ? 'Not submitted yet' : a.remaining > 0 ? `${a.remaining} days (est.)` : `${Math.abs(a.remaining)}d past target`}
          color={a.urg.color}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, paddingTop: 14, marginTop: 14, borderTop: '1px solid var(--border)' }}>
        <div className="app-field" style={{ margin: 0 }}>
          <label>Status <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(self-reported)</span></label>
          <select
            className="app-select"
            value={a.status}
            disabled={savingStatus}
            onChange={e => handleStatusChange(e.target.value)}
          >
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="app-field" style={{ margin: 0 }}>
          <label>Submitted on <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(self-reported)</span></label>
          <input
            className="app-input"
            type="date"
            value={a.submitted}
            disabled={savingSubmitted}
            onChange={e => handleSubmittedChange(e.target.value)}
          />
        </div>
      </div>

      <div style={{ paddingTop: 14, marginTop: 14, borderTop: '1px solid var(--border)' }}>
        <div className="app-field" style={{ margin: 0, maxWidth: 240 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            Application Reminder (30-Day)
            {a.effectiveReminderStatus !== a.reminderMailSent && (
              <span className="app-badge" style={{
                background: REMINDER_META[a.effectiveReminderStatus].bg,
                color: REMINDER_META[a.effectiveReminderStatus].color,
                textTransform: 'none', fontSize: 10.5, padding: '2px 8px',
              }}>
                {a.effectiveReminderStatus}
              </span>
            )}
          </label>
          <select
            className="app-select"
            value={a.reminderMailSent}
            disabled={savingReminder}
            onChange={e => handleReminderChange(e.target.value as ReminderStatus)}
          >
            {REMINDER_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <div style={{ fontSize: 11.5, color: a.reminderDaysLeft > 0 ? 'var(--muted)' : 'var(--danger)', marginTop: 6 }}>
            {a.reminderDaysLeft > 0 ? `${a.reminderDaysLeft} days left in this window` : a.reminderDaysLeft === 0 ? 'Due today' : `${Math.abs(a.reminderDaysLeft)} days overdue`}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
        <span>Overall progress</span>
        <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{pct}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: 'var(--neutral-soft)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: 'var(--success)', transition: 'width 0.3s ease' }} />
      </div>
    </div>
  );
}

function Field({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, marginTop: 3, color: color || 'var(--ink)' }}>{value}</div>
    </div>
  );
}
