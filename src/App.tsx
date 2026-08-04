import { Routes, Route, Navigate } from 'react-router-dom';
import { PlaneTakeoff } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useMyApplicant } from './hooks/useMyApplicant';
import LoginGate from './pages/auth/LoginGate';
import AdminLogin from './pages/auth/AdminLogin';
import ApplicantLogin from './pages/auth/ApplicantLogin';
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
import ApplicantDashboard from './pages/applicant/Dashboard';
import ApplicantChecklist from './pages/applicant/Checklist';
import Onboarding from './pages/applicant/Onboarding';
import Guides from './pages/Guides';
import GuideDetail from './pages/GuideDetail';
import Profile from './pages/Profile';
import './styles/theme.css';

function LoadingScreen() {
  return (
    <div className="app-loading-screen">
      <PlaneTakeoff className="app-spin" size={28} />
    </div>
  );
}

// Guides are reachable whether or not anyone is signed in, so these routes
// get spread into every branch below rather than living in just one.
const publicRoutes = (
  <>
    <Route path="/guides" element={<PublicLayout><Guides /></PublicLayout>} />
    <Route path="/guides/:slug" element={<PublicLayout><GuideDetail /></PublicLayout>} />
  </>
);

export default function App() {
  const { user, role, authLoading, refreshUser } = useAuth();
  // Only applicants own a self-service applicants/{uid} doc — admin has none.
  const { myApplicant } = useMyApplicant(role === 'applicant' ? user?.uid : undefined);

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!user || !role) {
    return (
      <Routes>
        {publicRoutes}
        <Route path="/login" element={<LoginGate />} />
        <Route path="/login/staff" element={<AdminLogin />} />
        <Route path="/login/apply" element={<ApplicantLogin />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Still checking whether this applicant already has a record.
  if (role === 'applicant' && myApplicant === undefined) {
    return <LoadingScreen />;
  }

  // Signed up but hasn't created their own record yet — nothing else in
  // /app/* has data to show them until they do.
  if (role === 'applicant' && myApplicant === null) {
    return (
      <Routes>
        {publicRoutes}
        <Route path="/app/onboarding" element={<Onboarding uid={user.uid} email={user.email!} />} />
        <Route path="*" element={<Navigate to="/app/onboarding" replace />} />
      </Routes>
    );
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
        <Route path="guides" element={role === 'admin' ? <AdminGuides /> : <Navigate to="/app/dashboard" replace />} />
        <Route path="checklist" element={role === 'admin' ? <AdminChecklist /> : <ApplicantChecklist applicant={myApplicant!} />} />
        <Route path="profile" element={<Profile user={user} role={role} onUserUpdate={refreshUser} />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  );
}
