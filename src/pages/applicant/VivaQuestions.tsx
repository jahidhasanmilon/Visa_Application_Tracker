import { useEffect, useState } from 'react';
import { HelpCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { subscribeVivaQuestions } from '../../services/vivaQuestionsService';
import { useLanguage } from '../../i18n/LanguageContext';
import type { VivaQuestion } from '../../types';

export default function ApplicantVivaQuestions() {
  const { t } = useLanguage();
  const [questions, setQuestions] = useState<VivaQuestion[] | null>(null);

  useEffect(() => subscribeVivaQuestions(setQuestions), []);

  return (
    <>
      <PageHeader title={t('vivaQuestions.title')} subtitle={t('vivaQuestions.subtitle')} />
      <div className="app-content">
        {questions === null ? (
          <div className="app-empty">{t('common.loading')}</div>
        ) : questions.length === 0 ? (
          <div className="app-card app-card-pad">
            <div className="app-empty">{t('vivaQuestions.empty')}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {questions.map((q, i) => (
              <div key={q.id} className="app-card app-card-pad" style={{ display: 'flex', gap: 12 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--violet-soft)', color: 'var(--violet)', fontWeight: 700, fontSize: 13,
                }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 600 }}>{q.question}</div>
                  {q.note && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12.5, color: 'var(--muted)', fontStyle: 'italic', marginTop: 6 }}>
                      <HelpCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} /> {q.note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
