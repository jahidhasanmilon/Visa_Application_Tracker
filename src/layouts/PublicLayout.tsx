import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PlaneTakeoff } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import WhatsAppFab from '../components/WhatsAppFab';
import Footer from '../components/Footer';
import { useLanguage } from '../i18n/LanguageContext';

// Auth-agnostic wrapper for pages reachable whether or not anyone is signed
// in (currently just the Guides area) — App.tsx hoists these routes above
// the signed-in/signed-out fork, so this layout can't assume either.
export default function PublicLayout({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  return (
    <div className="app-root" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <div className="app-topbar" style={{ borderBottom: '1px solid var(--border)', padding: '18px 34px' }}>
        <Link to="/guides" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="app-logo-mark"><PlaneTakeoff size={18} /></div>
          <div className="app-logo-text" style={{ color: 'var(--ink)' }}>VisaTrack</div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LanguageToggle />
          <ThemeToggle />
          <Link to="/login" className="app-btn app-btn-primary app-btn-sm">{t('login.signIn')}</Link>
        </div>
      </div>
      <div style={{ flex: '1 0 auto' }}>{children}</div>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
