import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { subscribeHowToUse } from '../../services/howToUseService';
import { useLanguage } from '../../i18n/LanguageContext';
import type { HowToUseSection } from '../../types';

export default function HowToUse() {
  const { t } = useLanguage();
  const [sections, setSections] = useState<HowToUseSection[] | null>(null);
  useEffect(() => subscribeHowToUse(setSections), []);

  const visible = (sections ?? []).filter(s => !s.hidden);

  return (
    <>
      <PageHeader title={t('howToUse.title')} subtitle={t('howToUse.subtitle')} />
      <div className="app-content">
        {sections === null ? (
          <div className="app-empty">{t('common.loading')}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {visible.map(s => (
              <div key={s.id} className="app-card app-card-pad">
                <div className="app-card-title" style={{ marginBottom: 6 }}>{s.heading}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--muted)', whiteSpace: 'pre-wrap' }}>{s.body}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
