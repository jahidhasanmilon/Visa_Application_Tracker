import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useMyApplicants } from './hooks/useMyApplicants';
import { linkApplicantAccount } from './services/applicantsService';
import Login from './pages/auth/Login';
import AppShell from './layouts/AppShell';
import PublicLayout from './layouts/PublicLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminApplications from './pages/admin/Applications';
import AdminTracker from './pages/admin/Tracker';
import AdminRoadmap from './pages/admin/Roadmap';
import AdminAnalytics from './pages/admin/Analytics';
import AdminReminderEmail from './pages/admin/ReminderEmail';
import AdminChecklist from './pages/admin/Checklist';
import AdminGuides from './pages/admin/Guides';
import AdminAdmins from './pages/admin/Admins';
import AdminVivaQuestions from './pages/admin/VivaQuestions';
import ApplicantDashboard from './pages/applicant/Dashboard';
import ApplicantChecklist from './pages/applicant/Checklist';
import ApplicantVivaQuestions from './pages/applicant/VivaQuestions';
import HowToUse from './pages/applicant/HowToUse';
import AdminHowToUse from './pages/admin/HowToUse';
import Guides from './pages/Guides';
import GuideDetail from './pages/GuideDetail';
import About from './pages/About';
import CustomPage from './pages/CustomPage';
import Faq from './pages/Faq';
import Help from './pages/Help';
import Privacy from './pages/Privacy';
import Profile from './pages/Profile';
import './styles/theme.css';

// Departure/arrival points sit at the center of each flag, so the plane
// visibly takes off from the middle of the Bangladesh flag and lands in
// the middle of the Germany flag.
const FLIGHT_PATH = 'M12,90.5 C20,58 55,42 88,10.5';

// Loading screen plays one full flight cycle before ever handing off to the
// real app — a fast Firestore/auth resolve on a fresh tab would otherwise
// cut the animation off mid-flight. Once shown this session, later
// (fast) loads skip the wait since the user has already seen it land.
const FULL_LOAD_KEY = 'visa-tracker-full-load-shown';
const FULL_LOAD_MS = 2400;

function useMinLoadingTime(isLoading: boolean): boolean {
  const [minTimeDone, setMinTimeDone] = useState(() => sessionStorage.getItem(FULL_LOAD_KEY) === '1');

  useEffect(() => {
    if (minTimeDone) return;
    const timer = setTimeout(() => {
      sessionStorage.setItem(FULL_LOAD_KEY, '1');
      setMinTimeDone(true);
    }, FULL_LOAD_MS);
    return () => clearTimeout(timer);
  }, [minTimeDone]);

  return isLoading || !minTimeDone;
}

function LoadingScreen() {
  return (
    <div className="app-loading-screen">
      <div className="app-flight">
        <svg className="app-flight-svg" viewBox="0 0 100 110" width="100" height="110" aria-hidden="true">
          {/* Decorative clouds scattered across the sky */}
          <g className="app-flight-cloud" transform="translate(38, 62)">
            <circle cx="0" cy="5" r="3.5" />
            <circle cx="4.5" cy="2.5" r="4.5" />
            <circle cx="10" cy="5" r="3.5" />
          </g>
          <g className="app-flight-cloud" transform="translate(56, 34) scale(0.8)">
            <circle cx="0" cy="5" r="3.5" />
            <circle cx="4.5" cy="2.5" r="4.5" />
            <circle cx="10" cy="5" r="3.5" />
          </g>
          <g className="app-flight-cloud" transform="translate(14, 24) scale(0.6)">
            <circle cx="0" cy="5" r="3.5" />
            <circle cx="4.5" cy="2.5" r="4.5" />
            <circle cx="10" cy="5" r="3.5" />
          </g>
          <g className="app-flight-cloud" transform="translate(72, 62) scale(0.65)">
            <circle cx="0" cy="5" r="3.5" />
            <circle cx="4.5" cy="2.5" r="4.5" />
            <circle cx="10" cy="5" r="3.5" />
          </g>
          <g className="app-flight-cloud" transform="translate(28, 82) scale(0.5)">
            <circle cx="0" cy="5" r="3.5" />
            <circle cx="4.5" cy="2.5" r="4.5" />
            <circle cx="10" cy="5" r="3.5" />
          </g>
          <g className="app-flight-cloud" transform="translate(86, 42) scale(0.55)">
            <circle cx="0" cy="5" r="3.5" />
            <circle cx="4.5" cy="2.5" r="4.5" />
            <circle cx="10" cy="5" r="3.5" />
          </g>
          <g className="app-flight-cloud" transform="translate(6, 52) scale(0.45)">
            <circle cx="0" cy="5" r="3.5" />
            <circle cx="4.5" cy="2.5" r="4.5" />
            <circle cx="10" cy="5" r="3.5" />
          </g>

          <path className="app-flight-route" d={FLIGHT_PATH} />
          <defs>
            <mask id="app-flight-trail-mask">
              <path d={FLIGHT_PATH} className="app-flight-trail-reveal" pathLength={100} />
            </mask>
          </defs>
          <path className="app-flight-trail" d={FLIGHT_PATH} pathLength={100} mask="url(#app-flight-trail-mask)" />

          {/* Bangladesh — departure */}
          <g transform="translate(2, 84)">
            <rect width="20" height="13" fill="#006a4e" />
            <circle cx="8.7" cy="6.5" r="4.4" fill="#f42a41" />
          </g>

          {/* Germany — destination, with an arrival glow timed to the plane */}
          <circle className="app-flight-glow" cx="88" cy="10.5" r="16" />
          <g transform="translate(78, 4)">
            <rect width="20" height="13" fill="#000000" />
            <rect y="4.33" width="20" height="4.34" fill="#dd0000" />
            <rect y="8.67" width="20" height="4.33" fill="#ffce00" />
          </g>
        </svg>
        {/* A real airplane silhouette (top-down), nose-up in its own
            coordinate space — .app-flight-plane rotates it 90deg so the
            nose points along +x, matching offset-rotate: auto's convention
            (see theme.css). Small circles behind the tail form an exhaust
            trail that fades in sync with the flight. */}
        <svg className="app-flight-plane" viewBox="0 0 24 26" width="18" height="19.5" aria-hidden="true">
          <circle className="app-flight-smoke app-flight-smoke-1" cx="12" cy="22.3" r="1.1" />
          <circle className="app-flight-smoke app-flight-smoke-2" cx="12" cy="23.9" r="0.85" />
          <circle className="app-flight-smoke app-flight-smoke-3" cx="12" cy="25.2" r="0.6" />
          <path
            d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2.5 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
}

// Guides are reachable whether or not anyone is signed in, so these routes
// get spread into every branch below rather than living in just one.
const publicRoutes = (
  <>
    <Route path="/guides" element={<PublicLayout><Guides /></PublicLayout>} />
    <Route path="/guides/:slug" element={<PublicLayout><GuideDetail /></PublicLayout>} />
    <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
  </>
);

export default function App() {
  const { user, role, authLoading, roleLoading, refreshUser } = useAuth();
  // Only applicants own applicant records — admin has none. One applicant
  // can own more than one (see linkApplicantAccount / firestore.rules).
  const { myApplicants } = useMyApplicants(role === 'applicant' ? user?.uid : undefined);

  // Runs once per applicant login (not gated on myApplicants — admin can
  // precreate a new ghost record for someone at any time, not just before
  // their first-ever login, so this always re-checks rather than only
  // firing the one time they own zero records). Silently creates a blank
  // record only the very first time this person truly owns nothing yet —
  // no blocking onboarding screen. The "fill in your details" prompt
  // (ApplicantDetailsModal) is dismissible and shown once a record exists.
  useEffect(() => {
    if (role === 'applicant' && user) {
      linkApplicantAccount()
        .catch((err) => console.error('linkApplicantAccount failed', err));
    }
  }, [role, user?.uid]);

  const rawLoading = authLoading || (!!user && (
    roleLoading || !role || (role === 'applicant' && (!myApplicants || myApplicants.length === 0))
  ));
  const loading = useMinLoadingTime(rawLoading);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <Routes>
        {publicRoutes}
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // rawLoading already covers this — `loading` only just became false, so
  // role is guaranteed resolved by now. This is here purely to narrow the
  // type for the routes below.
  if (!role) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {publicRoutes}
      <Route path="/app" element={<AppShell user={user} role={role} />}>
        <Route path="dashboard" element={role === 'admin' ? <AdminDashboard /> : <ApplicantDashboard applicants={myApplicants!} />} />
        <Route path="applications" element={role === 'admin' ? <AdminApplications /> : <Navigate to="/app/dashboard" replace />} />
        <Route path="tracker" element={role === 'admin' ? <AdminTracker /> : <Navigate to="/app/dashboard" replace />} />
        <Route path="roadmap" element={role === 'admin' ? <AdminRoadmap /> : <Navigate to="/app/dashboard" replace />} />
        <Route path="reminder-email" element={role === 'admin' ? <AdminReminderEmail /> : <Navigate to="/app/dashboard" replace />} />
        <Route path="analytics" element={role === 'admin' ? <AdminAnalytics /> : <Navigate to="/app/dashboard" replace />} />
        <Route path="guides" element={role === 'admin' ? <AdminGuides /> : <Guides />} />
        <Route path="guides/:slug" element={<GuideDetail />} />
        <Route path="admins" element={role === 'admin' ? <AdminAdmins /> : <Navigate to="/app/dashboard" replace />} />
        <Route path="help" element={<Help role={role} />} />
        <Route path="viva-questions" element={role === 'admin' ? <AdminVivaQuestions /> : <ApplicantVivaQuestions user={user} />} />
        <Route path="how-to-use" element={role === 'admin' ? <AdminHowToUse /> : <HowToUse />} />
        <Route path="about" element={<About role={role} />} />
        <Route path="pages/:id" element={<CustomPage role={role} />} />
        <Route path="faq" element={<Faq role={role} />} />
        <Route path="checklist" element={role === 'admin' ? <AdminChecklist /> : <ApplicantChecklist applicants={myApplicants!} />} />
        <Route
          path="profile"
          element={<Profile user={user} role={role} onUserUpdate={refreshUser} />}
        />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  );
}
