import type { ReactNode } from 'react';
import { PlaneTakeoff } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

interface AuthLayoutProps {
  eyebrow: string;
  headline: string;
  sub: string;
  stats: { value: string; label: string }[];
  children: ReactNode;
}

export default function AuthLayout({ eyebrow, headline, sub, stats, children }: AuthLayoutProps) {
  return (
    <div className="app-root app-auth-screen">
      <div className="app-auth-art">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
          <div className="app-logo-mark"><PlaneTakeoff size={18} /></div>
          <div className="app-logo-text">VisaTrack</div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="app-role-pill" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', marginBottom: 14 }}>{eyebrow}</div>
          <div className="app-auth-headline">{headline}</div>
          <div className="app-auth-sub">{sub}</div>
        </div>

        <div className="app-auth-stats">
          {stats.map(s => (
            <div key={s.label}>
              <div className="app-auth-stat-num">{s.value}</div>
              <div className="app-auth-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="app-auth-form-side">
        <div className="app-auth-theme-toggle">
          <ThemeToggle />
        </div>
        <div className="app-auth-form-wrap">{children}</div>
      </div>
    </div>
  );
}
