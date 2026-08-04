import { Link } from 'react-router-dom';
import { ShieldCheck, UserRound, ArrowRight } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';

export default function LoginGate() {
  return (
    <AuthLayout
      eyebrow="Welcome"
      headline="Every visa application, tracked to the day it's decided."
      sub="One workspace for admin to manage cases and applicants to check exactly where they stand — no spreadsheets, no guessing."
      stats={[
        { value: '365d', label: 'Tracking window' },
        { value: 'Live', label: 'Status sync' },
        { value: '2', label: 'Portals, 1 dataset' },
      ]}
    >
      <div className="app-page-subtitle" style={{ marginBottom: 6 }}>Sign in</div>
      <div className="app-page-title" style={{ marginBottom: 4 }}>Continue as…</div>
      <div style={{ color: 'var(--muted)', fontSize: 13.5 }}>Choose the portal that matches your account.</div>

      <div className="app-role-grid">
        <Link to="/login/staff" className="app-role-card">
          <div className="app-role-icon" style={{ background: 'var(--violet-soft)', color: 'var(--violet)' }}>
            <ShieldCheck size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="app-role-title">Admin</div>
            <div className="app-role-desc">Manage applicants, update statuses, track deadlines.</div>
          </div>
          <ArrowRight size={17} color="var(--muted-2)" />
        </Link>

        <Link to="/login/apply" className="app-role-card">
          <div className="app-role-icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent-ink)' }}>
            <UserRound size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="app-role-title">Applicant</div>
            <div className="app-role-desc">Check the status of your own visa application.</div>
          </div>
          <ArrowRight size={17} color="var(--muted-2)" />
        </Link>
      </div>
    </AuthLayout>
  );
}
