import { useState } from 'react';
import { Check, Circle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { updateChecklist } from '../../services/applicantsService';
import { useChecklistTemplate } from '../../hooks/useTemplates';
import { effectiveChecklist } from '../../utils/dateHelpers';
import { useLanguage } from '../../i18n/LanguageContext';
import type { Applicant, ChecklistItem } from '../../types';

interface ApplicantChecklistProps {
  applicant: Applicant;
}

export default function ApplicantChecklist({ applicant }: ApplicantChecklistProps) {
  const { t } = useLanguage();
  const template = useChecklistTemplate();
  return (
    <>
      <PageHeader title={t('checklist.title')} subtitle={t('checklist.subtitle')} />
      <div className="app-content">
        {template === null ? (
          <div className="app-empty">{t('common.loading')}</div>
        ) : (
          <ChecklistCard applicant={applicant} template={template} />
        )}
      </div>
    </>
  );
}

function ChecklistCard({ applicant, template }: { applicant: Applicant; template: ChecklistItem[] }) {
  const { t } = useLanguage();
  const items = effectiveChecklist(applicant, template);
  const [saving, setSaving] = useState<string | null>(null);

  async function toggle(item: ChecklistItem) {
    setSaving(item.id);
    try {
      const next = items.map(i => i.id === item.id ? { ...i, done: !i.done } : i);
      await updateChecklist(applicant.id, next);
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="app-card app-card-pad">
      <div className="app-card-head">
        <div>
          <div className="app-card-title">{applicant.name}</div>
          {applicant.serialNo && <div className="app-mono" style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{applicant.serialNo}</div>}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="app-empty">{t('checklist.empty')}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => toggle(item)}
              disabled={saving === item.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 4px', borderBottom: '1px solid var(--border)',
                background: 'none', border: 'none', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: 'var(--border)',
                width: '100%', textAlign: 'left', cursor: 'pointer', font: 'inherit', color: 'inherit',
              }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: item.done ? 'var(--success)' : 'var(--neutral-soft)',
                color: item.done ? '#fff' : 'var(--muted-2)',
              }}>
                {item.done ? <Check size={13} /> : <Circle size={9} fill="currentColor" />}
              </span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'var(--muted)' : 'var(--ink)' }}>
                {item.label}
              </span>
              <span className="app-badge" style={{
                background: item.done ? 'var(--success-soft)' : 'var(--neutral-soft)',
                color: item.done ? 'var(--success)' : 'var(--neutral)',
              }}>
                {item.done ? t('checklist.done') : t('checklist.notYet')}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
