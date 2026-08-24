import { useEffect, useMemo, useState } from 'react';
import { Check, Pencil } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import ApplicantDetailsModal from '../../components/ApplicantDetailsModal';
import WelcomeModal from '../../components/WelcomeModal';
import InfoTooltip from '../../components/InfoTooltip';
import LiveCountdown from '../../components/LiveCountdown';
import { updateReminderStatus, updateRoadmap } from '../../services/applicantsService';
import { subscribeWelcome, DEFAULT_WELCOME } from '../../services/welcomeService';
import { enrichApplicant, effectiveRoadmap, effectiveChecklist, fmtDate, fmtDateTimeUtc, todayStr } from '../../utils/dateHelpers';
import { getStatusMeta, REMINDER_OPTIONS, REMINDER_META } from '../../constants/status';
import { useRoadmapTemplate, useChecklistTemplate } from '../../hooks/useTemplates';
import { useLanguage } from '../../i18n/LanguageContext';
import type { Applicant, ChecklistItem, EnrichedApplicant, ReminderStatus, WelcomeContent } from '../../types';

const DISMISS_KEY_PREFIX = 'visa-tracker-details-prompt-dismissed-';
const WELCOME_DISMISS_KEY_PREFIX = 'visa-tracker-welcome-dismissed-';

function detailsIncomplete(a: Applicant): boolean {
  return !a.name.trim() || !a.created || !a.submitted;
}

interface ApplicantDashboardProps {
  // One person can own more than one application record (e.g. separate
  // Student visa and Opportunity Card applications under the same email) —
  // see linkApplicantAccount/firestore.rules. Each renders as its own
  // stacked card below.
  applicants: Applicant[];
}

export default function ApplicantDashboard({ applicants }: ApplicantDashboardProps) {
  const { t } = useLanguage();
  const roadmapTemplate = useRoadmapTemplate();
  const checklistTemplate = useChecklistTemplate();
  const [editingApplicant, setEditingApplicant] = useState<Applicant | null>(null);
  const [welcome, setWelcome] = useState<WelcomeContent>(DEFAULT_WELCOME);
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  useEffect(() => subscribeWelcome(setWelcome), []);

  // The welcome popup and the "Add your details" nudge only ever apply to
  // one representative record — never stack multiple auto-opening modals
  // just because someone owns several applications. Whichever record still
  // has incomplete details is the one that matters most to nudge about.
  const primary = applicants.find(detailsIncomplete) ?? applicants[0];

  const welcomeDismissed = !!localStorage.getItem(WELCOME_DISMISS_KEY_PREFIX + primary.id);

  useEffect(() => {
    if (welcome.enabled && !welcomeDismissed) {
      setWelcomeOpen(true);
    }
  }, [welcome, welcomeDismissed, primary.id]);

  // The "Add your details" prompt waits until the welcome popup (if any) has
  // been dismissed, so a brand-new applicant isn't faced with two modals at once.
  useEffect(() => {
    if (welcomeOpen) return;
    if (detailsIncomplete(primary) && !localStorage.getItem(DISMISS_KEY_PREFIX + primary.id)) {
      setEditingApplicant(primary);
    }
  }, [primary, welcomeOpen]);

  function closeDetails() {
    if (editingApplicant) localStorage.setItem(DISMISS_KEY_PREFIX + editingApplicant.id, '1');
    setEditingApplicant(null);
  }

  function closeWelcome() {
    localStorage.setItem(WELCOME_DISMISS_KEY_PREFIX + primary.id, '1');
    setWelcomeOpen(false);
  }

  return (
    <>
      <PageHeader title={t('status.title')} subtitle={t('status.subtitle')} />
      <div className="app-content">
        {checklistTemplate === null || roadmapTemplate === null ? (
          <div className="app-empty">{t('common.loading')}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {applicants.map(applicant => (
              <div key={applicant.id}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2 }}>
                  <button className="app-btn app-btn-ghost app-btn-sm" onClick={() => setEditingApplicant(applicant)}>
                    <Pencil size={14} /> <span className="app-btn-label-responsive">{t('status.editDetails')}</span>
                  </button>
                </div>
                <ApplicationCard
                  a={enrichApplicant(applicant, todayStr(), roadmapTemplate)}
                  checklistTemplate={checklistTemplate}
                  roadmapTemplate={roadmapTemplate}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {editingApplicant && <ApplicantDetailsModal open applicant={editingApplicant} onClose={closeDetails} />}
      {welcomeOpen && <WelcomeModal content={welcome} onClose={closeWelcome} />}
    </>
  );
}

interface ApplicationCardProps {
  a: EnrichedApplicant;
  checklistTemplate: ChecklistItem[];
  roadmapTemplate: ChecklistItem[];
}

function ApplicationCard({ a, checklistTemplate, roadmapTemplate }: ApplicationCardProps) {
  const { t } = useLanguage();
  const meta = getStatusMeta(a.status);
  const [savingReminder, setSavingReminder] = useState(false);
  const [savingRoadmap, setSavingRoadmap] = useState(false);
  const [roadmapError, setRoadmapError] = useState('');

  const roadmapItems = useMemo(() => effectiveRoadmap(a, roadmapTemplate), [a, roadmapTemplate]);
  const checklist = useMemo(() => effectiveChecklist(a, checklistTemplate), [a, checklistTemplate]);

  const totalDone = roadmapItems.filter(s => s.done).length + checklist.filter(i => i.done).length;
  const totalItems = roadmapItems.length + checklist.length;
  const progressPct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

  async function handleReminderChange(value: ReminderStatus) {
    setSavingReminder(true);
    try {
      await updateReminderStatus(a.id, value);
    } finally {
      setSavingReminder(false);
    }
  }

  async function toggleStep(step: ChecklistItem) {
    setSavingRoadmap(true);
    setRoadmapError('');
    try {
      const next = roadmapItems.map(s => s.id === step.id ? { ...s, done: !s.done } : s);
      await updateRoadmap(a.id, next);
    } catch (err) {
      console.error('updateRoadmap failed', err);
      setRoadmapError(t('status.updateFailed'));
    } finally {
      setSavingRoadmap(false);
    }
  }

  return (
    <div className="app-card app-card-pad">
      <div className="app-card-head app-status-card-head" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="app-card-title">{a.name || t('status.yourApplication')}</div>
          {a.serialNo && <div className="app-mono" style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{a.serialNo}</div>}
          <span className="app-badge" style={{ background: meta.bg, color: meta.color, fontSize: 13, padding: '6px 14px', marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <meta.icon size={14} /> {a.status}
            <InfoTooltip text={t('status.statusTooltip')} />
          </span>
          {a.statusNote && (
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 8, maxWidth: 360, lineHeight: 1.5 }}>
              {a.statusNote}
            </div>
          )}
        </div>

        <LiveCountdown lastUpdated={a.lastUpdated} />
      </div>

      <ProgressBar pct={progressPct} />

      <div className="app-roadmap-track">
        {roadmapItems.map((step, i) => (
          <div key={step.id} className="app-roadmap-step">
            <button
              type="button"
              className="app-roadmap-step-btn"
              onClick={() => toggleStep(step)}
              disabled={savingRoadmap}
              title={step.done ? t('status.markNotYet') : t('status.markDone')}
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
            {i < roadmapItems.length - 1 && (
              <div className="app-roadmap-connector" style={{ background: step.done ? 'var(--success)' : 'var(--border)' }} />
            )}
          </div>
        ))}
      </div>
      {roadmapError && (
        <div style={{ color: 'var(--danger)', fontSize: 12.5, marginTop: -8, marginBottom: 14 }}>{roadmapError}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
        <Field label={t('status.appliedOn')} value={fmtDate(a.created)} tooltip={t('status.appliedOnTooltip')} />
        <Field label={t('status.submittedOn')} value={fmtDate(a.submitted)} tooltip={t('status.submittedOnTooltip')} />
        <Field
          label={t('status.waiting')}
          value={a.waiting === null ? '—' : `${a.waiting} ${t('status.daysSuffix')}`}
          tooltip={t('status.waitingTooltip')}
        />
        <Field
          label={a.remaining === null ? t('status.estimatedRemaining') : a.remaining > 0 ? t('status.estimatedRemaining') : t('status.statusLabel')}
          value={a.remaining === null ? t('status.notSubmittedYet') : a.remaining > 0 ? t('status.remainingEstDays', { n: a.remaining }) : t('status.pastTarget', { n: Math.abs(a.remaining) })}
          color={a.urg.color}
          tooltip={t('status.remainingTooltip')}
        />
        <Field
          label={t('status.lastUpdated')}
          value={fmtDateTimeUtc(a.lastUpdated)}
          tooltip={t('status.lastUpdatedTooltip')}
        />
      </div>

      <div style={{ paddingTop: 14, marginTop: 14, borderTop: '1px solid var(--border)' }}>
        <div className="app-field" style={{ margin: 0, maxWidth: 240 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {t('status.reminderFullTitle')}
            <InfoTooltip text={t('status.reminderFullTooltip')} />
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
            {a.reminderDaysLeft > 0
              ? t('status.daysLeftUntilEmbassy', { n: a.reminderDaysLeft })
              : a.reminderDaysLeft === 0
                ? t('status.embassyEmailToday')
                : t('status.daysPastEmbassy', { n: Math.abs(a.reminderDaysLeft) })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  const { t } = useLanguage();
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
        <span>{t('status.overallProgress')}</span>
        <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{pct}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: 'var(--neutral-soft)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: 'var(--success)', transition: 'width 0.3s ease' }} />
      </div>
    </div>
  );
}

function Field({ label, value, color, tooltip }: { label: string; value: string; color?: string; tooltip?: string }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, marginTop: 3, color: color || 'var(--ink)' }}>{value}</div>
    </div>
  );
}
