import { useLanguage } from '../i18n/LanguageContext';

const CREATOR_NAME = 'Jahid Hasan Milon';
const CREATOR_LINKEDIN = 'https://www.linkedin.com/in/jahid-hasan-milon';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <div className="app-footer">
      <div>{t('footer.text', { year: new Date().getFullYear() })}</div>
      <div className="app-footer-credit">
        {t('footer.createdBy')} <a href={CREATOR_LINKEDIN} target="_blank" rel="noreferrer">{CREATOR_NAME}</a>
      </div>
    </div>
  );
}
