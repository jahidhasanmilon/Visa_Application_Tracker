import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { LogOut, PlaneTakeoff, Menu, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import type { User } from 'firebase/auth';
import type { AppRole } from '../constants/roles';
import { ADMIN_NAV, APPLICANT_NAV } from '../constants/nav';
import { signOut } from '../services/authService';
import { useApplicantNavOrder } from '../hooks/useNavOrder';
import ThemeToggle from '../components/ThemeToggle';
import UserAvatar from '../components/UserAvatar';
import NotificationBell from '../components/NotificationBell';
import ApplicantNotificationBell from '../components/ApplicantNotificationBell';
import WhatsAppFab from '../components/WhatsAppFab';
import Footer from '../components/Footer';
import ProfileToggleButton from '../components/ProfileToggleButton';
import { displayNameFor } from '../utils/userDisplay';

interface AppShellProps {
  user: User;
  role: AppRole;
}

const COLLAPSE_KEY = 'visa-tracker-sidebar-collapsed';

export default function AppShell({ user, role }: AppShellProps) {
  const applicantOrder = useApplicantNavOrder();
  const navItems = role === 'admin' ? ADMIN_NAV : orderNavItems(APPLICANT_NAV, applicantOrder);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === 'true');

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, String(collapsed));
  }, [collapsed]);

  return (
    <div className={`app-root app-shell${collapsed ? ' collapsed' : ''}`}>
      {mobileNavOpen && <div className="app-mobile-backdrop" onClick={() => setMobileNavOpen(false)} />}

      <aside className={`app-sidebar${mobileNavOpen ? ' mobile-open' : ''}${collapsed ? ' collapsed' : ''}`}>
        <div className="app-logo">
          <div className="app-logo-mark"><PlaneTakeoff size={18} /></div>
          <div style={{ flex: 1 }}>
            <div className="app-logo-text">VisaTrack</div>
            {role === 'admin' && <div className="app-logo-sub">Admin console</div>}
          </div>
          <button className="app-icon-btn app-sidebar-close" style={{ color: 'var(--sidebar-text)' }} onClick={() => setMobileNavOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
          <button
            className="app-icon-btn app-sidebar-collapse-btn"
            style={{ color: 'var(--sidebar-text)' }}
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <nav className="app-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `app-nav-item${isActive ? ' active' : ''}`}
              onClick={() => setMobileNavOpen(false)}
              title={label}
            >
              <Icon size={17} />
              <span className="app-nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="app-sidebar-footer">
          <div className="app-sidebar-user">
            <Link to="/app/dashboard" title="Home" aria-label="Home" style={{ lineHeight: 0 }}>
              <UserAvatar user={user} plain />
            </Link>
            <div className="app-sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayNameFor(user)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--sidebar-text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
            </div>
            <ThemeToggle className="app-icon-btn" style={{ color: 'var(--sidebar-text)' }} />
            <button
              className="app-icon-btn"
              style={{ color: 'var(--sidebar-text)' }}
              title="Sign out"
              onClick={() => signOut()}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="app-main">
        <div className="app-mobile-topbar">
          <div className="app-topbar-logo app-logo" style={{ padding: 0 }}>
            <div className="app-logo-mark"><PlaneTakeoff size={16} /></div>
            <div className="app-logo-text" style={{ color: 'var(--ink)' }}>VisaTrack</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
            {role === 'admin' ? <NotificationBell /> : <ApplicantNotificationBell uid={user.uid} />}
            <ProfileToggleButton user={user} />
            <ThemeToggle />
            <button className="app-icon-btn app-topbar-hamburger" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
          </div>
        </div>
        <Outlet />
        <Footer />
      </main>

      <WhatsAppFab />
    </div>
  );
}

function orderNavItems<T extends { to: string }>(items: T[], order: string[] | null): T[] {
  if (!order || order.length === 0) return items;
  const byTo = new Map(items.map(i => [i.to, i]));
  const ordered = order.map(to => byTo.get(to)).filter((i): i is T => !!i);
  const remaining = items.filter(i => !order.includes(i.to));
  return [...ordered, ...remaining];
}
