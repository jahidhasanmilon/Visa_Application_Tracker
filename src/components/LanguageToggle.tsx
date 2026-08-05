import { useLanguage } from '../i18n/LanguageContext';

interface LanguageToggleProps {
  className?: string;
  style?: React.CSSProperties;
}

// One-click EN / বাং switch — persists via LanguageProvider (localStorage).
export default function LanguageToggle({ className = 'app-icon-btn', style }: LanguageToggleProps) {
  const { lang, setLang } = useLanguage();

  return (
    <button
      type="button"
      className={className}
      style={{ fontWeight: 700, fontSize: 12, ...style }}
      onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
      title={lang === 'en' ? 'বাংলায় দেখুন' : 'Switch to English'}
      aria-label={lang === 'en' ? 'বাংলায় দেখুন' : 'Switch to English'}
    >
      {lang === 'en' ? 'বাং' : 'EN'}
    </button>
  );
}
