import AuthLayout from '../../layouts/AuthLayout';
import AuthForm from './AuthForm';
import { useLanguage } from '../../i18n/LanguageContext';

// One login screen for everyone — no admin/applicant portal choice. Role is
// resolved after sign-in (see useAuth.ts) from whether the signed-in email
// is in the admins collection, so an admin lands on the admin dashboard and
// everyone else lands on their own applicant dashboard automatically.
export default function Login() {
  const { t } = useLanguage();
  return (
    <AuthLayout
      eyebrow={t('login.welcome')}
      headline={t('login.headline')}
      sub={t('login.sub')}
      stats={[
        { value: t('login.statLive'), label: t('login.statLiveLabel') },
        { value: t('login.statZero'), label: t('login.statZeroLabel') },
        { value: t('login.statOne'), label: t('login.statOneLabel') },
      ]}
    >
      <AuthForm title={t('login.title')} subtitle={t('login.subtitle')} />
    </AuthLayout>
  );
}
