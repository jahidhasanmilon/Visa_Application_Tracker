import AuthLayout from '../../layouts/AuthLayout';
import AuthForm from './AuthForm';

// One login screen for everyone — no admin/applicant portal choice. Role is
// resolved after sign-in (see useAuth.ts) from whether the signed-in email
// is in the admins collection, so an admin lands on the admin dashboard and
// everyone else lands on their own applicant dashboard automatically.
export default function Login() {
  return (
    <AuthLayout
      eyebrow="Welcome"
      headline="Every visa application, tracked to the day it's decided."
      sub="Sign in to see exactly where your application stands, day by day."
      stats={[
        { value: 'Live', label: 'Status sync' },
        { value: '0', label: 'Spreadsheets needed' },
        { value: '1', label: 'Account, everything' },
      ]}
    >
      <AuthForm title="Sign in" subtitle="Use your email to sign in or create an account." />
    </AuthLayout>
  );
}
