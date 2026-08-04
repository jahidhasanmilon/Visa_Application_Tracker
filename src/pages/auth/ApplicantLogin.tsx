import AuthLayout from '../../layouts/AuthLayout';
import AuthForm from './AuthForm';

export default function ApplicantLogin() {
  return (
    <AuthLayout
      eyebrow="Applicant portal"
      headline="See exactly where your visa application stands."
      sub="Sign in with the same email your application was filed under to follow its progress, day by day."
      stats={[
        { value: 'Read-only', label: 'Your record, always' },
        { value: 'Live', label: 'Status updates' },
        { value: '0', label: 'Spreadsheets needed' },
      ]}
    >
      <AuthForm
        title="Applicant sign-in"
        subtitle="Use the email address on file with your application."
        switchTo={{ to: '/login/staff', label: "I'm admin instead →" }}
      />
    </AuthLayout>
  );
}
