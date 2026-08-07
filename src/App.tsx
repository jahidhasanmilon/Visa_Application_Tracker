import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useMyApplicant } from './hooks/useMyApplicant';
import { createOwnApplicant } from './services/applicantsService';
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
          {/* Decorative clouds along the route */}
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

          <path className="app-flight-route" d={FLIGHT_PATH} />
          <path className="app-flight-trail" d={FLIGHT_PATH} pathLength={100} />

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
        {/* Nose points along +x at rest, so offset-rotate: auto keeps it
            facing forward — true nose-first — the whole way along the curve. */}
        <svg className="app-flight-plane" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          <path d="M15,8 L9,4.3 L9,6.8 L1,8 L9,9.2 L9,11.7 Z" fill="currentColor" />
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
  // Only applicants own a self-service applicants/{uid} doc — admin has none.
  const { myApplicant } = useMyApplicant(role === 'applicant' ? user?.uid : undefined);

  // Silently create a blank record the first time an applicant is seen with
  // none — no blocking onboarding screen. The "fill in your details" prompt
  // (ApplicantDetailsModal) is dismissible and shown once the record exists.
  useEffect(() => {
    if (role === 'applicant' && user && myApplicant === null) {
      createOwnApplicant(user.uid, user.email || '', user.displayName || '')
        .catch((err) => console.error('createOwnApplicant failed', err));
    }
  }, [role, user, myApplicant]);

  const rawLoading = authLoading || (!!user && (
    roleLoading || !role || (role === 'applicant' && !myApplicant)
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
        <Route path="dashboard" element={role === 'admin' ? <AdminDashboard /> : <ApplicantDashboard applicant={myApplicant!} />} />
        <Route path="applications" element={role === 'admin' ? <AdminApplications /> : <Navigate to="/app/dashboard" replace />} />
        <Route path="tracker" element={role === 'admin' ? <AdminTracker /> : <Navigate to="/app/dashboard" replace />} />
        <Route path="roadmap" element={role === 'admin' ? <AdminRoadmap /> : <Navigate to="/app/dashboard" replace />} />
        <Route path="reminder-email" element={role === 'admin' ? <AdminReminderEmail /> : <Navigate to="/app/dashboard" replace />} />
        <Route path="analytics" element={role === 'admin' ? <AdminAnalytics /> : <Navigate to="/app/dashboard" replace />} />
        <Route path="guides" element={role === 'admin' ? <AdminGuides /> : <Guides />} />
        <Route path="guides/:slug" element={<GuideDetail />} />
        <Route path="admins" element={role === 'admin' ? <AdminAdmins /> : <Navigate to="/app/dashboard" replace />} />
        <Route path="help" element={<Help role={role} />} />
        <Route path="viva-questions" element={role === 'admin' ? <AdminVivaQuestions /> : <ApplicantVivaQuestions />} />
        <Route path="how-to-use" element={role === 'admin' ? <Navigate to="/app/dashboard" replace /> : <HowToUse />} />
        <Route path="about" element={<About role={role} />} />
        <Route path="pages/:id" element={<CustomPage />} />
        <Route path="faq" element={<Faq role={role} />} />
        <Route path="checklist" element={role === 'admin' ? <AdminChecklist /> : <ApplicantChecklist applicant={myApplicant!} />} />
        <Route
          path="profile"
          element={<Profile user={user} role={role} applicant={role === 'applicant' ? myApplicant : undefined} onUserUpdate={refreshUser} />}
        />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  );
}
