import { Link } from 'react-router-dom';
import type { WelcomeContent } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface WelcomeModalProps {
  content: WelcomeContent;
  onClose: () => void;
}

// Shown once to a first-time applicant (see ApplicantDashboard.tsx) if
// admin has turned it on — a short message plus an optional image, with a
// link into the How to Use page for the full walkthrough.
export default function WelcomeModal({ content, onClose }: WelcomeModalProps) {
  const { t } = useLanguage();
  return (
    <div className="app-modal-backdrop" onClick={onClose}>
      <div className="app-modal" onClick={e => e.stopPropagation()}>
        <h3>{t('welcome.title')}</h3>
        {content.imageUrl && (
          <img
            src={content.imageUrl}
            alt=""
            style={{ width: '100%', borderRadius: 12, marginBottom: 14, display: 'block' }}
          />
        )}
        <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>
          {content.message}
        </p>
        <div className="app-modal-actions">
          <button className="app-btn app-btn-ghost" onClick={onClose}>{t('welcome.dismiss')}</button>
          <Link to="/app/how-to-use" className="app-btn app-btn-primary" onClick={onClose}>{t('welcome.howToUse')}</Link>
        </div>
      </div>
    </div>
  );
}
