import AuthLayout from '../../layouts/AuthLayout';
import AuthForm from './AuthForm';
import { roleForEmail } from '../../constants/roles';

export default function AdminLogin() {
  return (
    <AuthLayout
      eyebrow="Admin console"
      headline="Run every case from one clear dashboard."
      sub="Add applicants, move statuses forward, and keep track of who's overdue for a follow-up."
      stats={[
        { value: 'Full', label: 'Read & write access' },
        { value: 'Real-time', label: 'Firestore sync' },
        { value: '5', label: 'Status stages' },
      ]}
    >
      <AuthForm
        title="Admin sign-in"
        subtitle="Restricted to registered admin accounts."
        switchTo={{ to: '/login/apply', label: "I'm an applicant instead →" }}
        allowSignUp={false}
        guard={(email) => (
          roleForEmail(email) === 'admin'
            ? null
            : "This account isn't registered as admin. Use the applicant portal instead."
        )}
      />
    </AuthLayout>
  );
}
