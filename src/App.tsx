import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Plane } from 'lucide-react';
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
import Faq from './pages/Faq';
import Help from './pages/Help';
import Privacy from './pages/Privacy';
import Profile from './pages/Profile';
import './styles/theme.css';

const FLIGHT_PATH = 'M14,150 C10,92 52,68 66,14';

function LoadingScreen() {
  return (
    <div className="app-loading-screen">
      <div className="app-flight">
        <svg className="app-flight-svg" viewBox="0 0 80 160" width="80" height="160" aria-hidden="true">
          <path className="app-flight-route" d={FLIGHT_PATH} />
          <path className="app-flight-trail" d={FLIGHT_PATH} pathLength={100} />

          {/* Bangladesh — departure */}
          <g transform="translate(2, 141)">
            <rect width="24" height="16" fill="#006a4e" />
            <circle cx="10.5" cy="8" r="5.4" fill="#f42a41" />
          </g>

          {/* Germany — destination */}
          <g transform="translate(54, 3)">
            <rect width="24" height="16" fill="#000000" />
            <rect y="5.33" width="24" height="5.34" fill="#dd0000" />
            <rect y="10.67" width="24" height="5.33" fill="#ffce00" />
          </g>
        </svg>
        <Plane className="app-flight-plane" size={16} />
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

  if (authLoading) {
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

  // Still resolving whether this account is an admin.
  if (roleLoading || !role) {
    return <LoadingScreen />;
  }

  // Applicant record doesn't exist yet — the effect above is creating it;
  // wait for the snapshot to reflect it rather than showing anything stale.
  if (role === 'applicant' && !myApplicant) {
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
