import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { translations, type Lang } from './translations';

const STORAGE_KEY = 'visa-tracker-lang';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Bengali toggle is temporarily hidden from the UI (no LanguageToggle
  // mounted anywhere right now) — force English so nobody who previously
  // switched to 'bn' gets stuck with no visible way to switch back. Restore
  // the localStorage-backed initializer below when the toggle comes back.
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.classList.toggle('lang-bn', lang === 'bn');
  }, [lang]);

  function setLang(next: Lang) {
    setLangState(next);
  }

  function t(key: string, vars?: Record<string, string | number>): string {
    let text = translations[lang][key] ?? translations.en[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replace(`{{${k}}}`, String(v));
      }
    }
    return text;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
