import PageHeader from '../../components/PageHeader';
import { useLanguage } from '../../i18n/LanguageContext';

const SECTION_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'] as const;

export default function HowToUse() {
  const { t } = useLanguage();
  return (
    <>
      <PageHeader title={t('howToUse.title')} subtitle={t('howToUse.subtitle')} />
      <div className="app-content">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {SECTION_KEYS.map(key => (
            <div key={key} className="app-card app-card-pad">
              <div className="app-card-title" style={{ marginBottom: 6 }}>{t(`howToUse.${key}.heading`)}</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--muted)' }}>{t(`howToUse.${key}.body`)}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
