import { useLanguage } from '../i18n/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <div className="app-footer">
      {t('footer.text', { year: new Date().getFullYear() })}
    </div>
  );
}
