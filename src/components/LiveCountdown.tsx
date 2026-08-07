import { useEffect, useState } from 'react';
import { REMINDER_WINDOW_DAYS } from '../constants/status';
import { useLanguage } from '../i18n/LanguageContext';
import InfoTooltip from './InfoTooltip';

const DAY_MS = 24 * 60 * 60 * 1000;
const REMINDER_WINDOW_MS = REMINDER_WINDOW_DAYS * DAY_MS;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function countdownColors(days: number): { bg: string; color: string } {
  if (days <= 0) return { bg: 'var(--danger-soft)', color: 'var(--danger)' };
  if (days <= 7) return { bg: 'var(--warning-soft)', color: 'var(--warning-ink)' };
  return { bg: 'var(--success-soft)', color: 'var(--success)' };
}

interface LiveCountdownProps {
  lastUpdated: string;
}

// Ticks every second off the real deadline (lastUpdated + 30 days), rather
// than a once-computed calendar-day snapshot, so the seconds visibly count
// down live instead of only changing once a day.
export default function LiveCountdown({ lastUpdated }: LiveCountdownProps) {
  const { t } = useLanguage();
  const deadlineMs = new Date(lastUpdated).getTime() + REMINDER_WINDOW_MS;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = deadlineMs - now;
  const overdue = remaining <= 0;
  const totalSeconds = Math.floor(Math.abs(remaining) / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const colors = countdownColors(overdue ? -1 : days);

  return (
    <div style={{
      textAlign: 'center', minWidth: 96, padding: '10px 14px', borderRadius: 14,
      background: colors.bg, color: colors.color, flexShrink: 0,
    }}>
      <div className="app-brand-font" style={{ fontWeight: 800, fontSize: 30, lineHeight: 1 }}>
        {days}
      </div>
      <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 3 }}>
        {!overdue && days > 0 ? t('status.daysLeft') : !overdue ? t('status.dueToday') : t('status.daysOverdue')}
      </div>
      <div className="app-mono" style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>
        {pad(hours)}h {pad(minutes)}m {pad(seconds)}s
      </div>
      <div style={{ fontSize: 9.5, opacity: 0.8, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
        {t('status.reminderTitle')}
        <InfoTooltip text={t('status.countdownTooltip')} />
      </div>
    </div>
  );
}
