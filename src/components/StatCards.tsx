import { Users, AlarmClock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { StatCounts } from '../types';

interface StatCardsProps {
  stats: StatCounts;
}

export default function StatCards({ stats }: StatCardsProps) {
  const cards = [
    { label: 'Total applicants', value: stats.total, icon: Users, color: 'var(--violet)', bg: 'var(--violet-soft)' },
    { label: 'Due within 30 days', value: stats.urgent, icon: AlarmClock, color: 'var(--warning-ink)', bg: 'var(--warning-soft)' },
    { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'var(--danger)', bg: 'var(--danger-soft)' },
    { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'var(--success)', bg: 'var(--success-soft)' },
  ];

  return (
    <div className="app-stat-grid">
      {cards.map(c => (
        <div className="app-stat-card" key={c.label}>
          <div className="app-stat-top">
            <div className="app-stat-icon" style={{ background: c.bg, color: c.color }}>
              <c.icon size={18} />
            </div>
          </div>
          <div className="app-stat-value">{c.value}</div>
          <div className="app-stat-label">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
