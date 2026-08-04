import { useState } from 'react';
import { PlaneTakeoff } from 'lucide-react';
import { createOwnApplicant } from '../../services/applicantsService';

interface OnboardingProps {
  uid: string;
  email: string;
}

// Shown once, right after a new applicant signs up (or first signs in with
// no record yet) — creates their own applicants/{uid} doc. The App.tsx gate
// watches that doc via onSnapshot and routes away automatically once it exists.
export default function Onboarding({ uid, email }: OnboardingProps) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError('Please enter your name.'); return; }
    setError('');
    setBusy(true);
    try {
      await createOwnApplicant(uid, email, trimmed);
    } catch {
      setError('Something went wrong — please try again.');
      setBusy(false);
    }
  }

  return (
    <div className="app-root app-auth-screen">
      <div className="app-auth-art">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
          <div className="app-logo-mark"><PlaneTakeoff size={18} /></div>
          <div className="app-logo-text">VisaTrack</div>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="app-role-pill" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', marginBottom: 14 }}>Welcome</div>
          <div className="app-auth-headline">One quick step before we start tracking your application.</div>
          <div className="app-auth-sub">Just your name for now — you'll fill in the rest as you go.</div>
        </div>
      </div>

      <div className="app-auth-form-side">
        <div className="app-auth-form-wrap">
          <div className="app-page-title" style={{ marginBottom: 4 }}>Tell us your name</div>
          <div style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 24 }}>
            We'll use this to set up your personal tracking dashboard.
          </div>

          <form onSubmit={handleSubmit}>
            <div className="app-field">
              <label>Full name</label>
              <input
                className="app-input"
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 14 }}>{error}</div>}

            <button className="app-btn app-btn-primary app-btn-block" type="submit" disabled={busy}>
              {busy ? 'Setting up…' : 'Start tracking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
