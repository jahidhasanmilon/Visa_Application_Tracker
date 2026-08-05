import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PlaneTakeoff } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import WhatsAppFab from '../components/WhatsAppFab';
import Footer from '../components/Footer';

// Auth-agnostic wrapper for pages reachable whether or not anyone is signed
// in (currently just the Guides area) — App.tsx hoists these routes above
// the signed-in/signed-out fork, so this layout can't assume either.
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-root" style={{ minHeight: '100dvh' }}>
      <div className="app-topbar" style={{ borderBottom: '1px solid var(--border)', padding: '18px 34px' }}>
        <Link to="/guides" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="app-logo-mark"><PlaneTakeoff size={18} /></div>
          <div className="app-logo-text" style={{ color: 'var(--ink)' }}>VisaTrack</div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle />
          <Link to="/login" className="app-btn app-btn-primary app-btn-sm">Sign in</Link>
        </div>
      </div>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 90px' }}>
        {children}
      </div>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
