import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, ExternalLink } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { subscribeGuideBySlug } from '../services/guidesService';
import { useLanguage } from '../i18n/LanguageContext';
import { renderSectionBody } from '../utils/richText';
import type { Guide } from '../types';

export default function GuideDetail() {
  const { t } = useLanguage();
  const { slug = '' } = useParams<{ slug: string }>();
  const { pathname } = useLocation();
  const [guide, setGuide] = useState<Guide | null | undefined>(undefined);

  useEffect(() => {
    setGuide(undefined);
    const unsub = subscribeGuideBySlug(slug, setGuide);
    return unsub;
  }, [slug]);

  // `guides/:slug` and `guides` are sibling routes (not nested) under both
  // /app and the public root, so React Router's relative ".." resolves
  // against the ROUTE tree, not the URL — it jumps past /app entirely
  // instead of landing on /app/guides. Resolve the correct list URL from
  // the current pathname instead.
  const guidesListPath = pathname.startsWith('/app/') ? '/app/guides' : '/guides';
  const backLink = (
    <Link to={guidesListPath} className="app-card-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <ArrowLeft size={14} /> {t('guides.backToGuides')}
    </Link>
  );

  if (guide === undefined) {
    return (
      <>
        <PageHeader title={t('nav.guides')} actions={backLink} />
        <div className="app-content"><div className="app-empty">{t('common.loading')}</div></div>
      </>
    );
  }

  if (guide === null) {
    return (
      <>
        <PageHeader title={t('nav.guides')} actions={backLink} />
        <div className="app-content">
          <div className="app-card app-card-pad">
            <div className="app-empty">{t('guides.notFound')}</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={guide.title} subtitle={guide.category} actions={backLink} />
      <div className="app-content">
        {guide.sections.map((s, i) => (
          <div key={i} className="app-card app-card-pad">
            <div className="app-card-title" style={{ marginBottom: 8 }}>{s.heading}</div>
            <div
              className="app-section-body"
              style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink)' }}
              dangerouslySetInnerHTML={{ __html: renderSectionBody(s.body) }}
            />
          </div>
        ))}

        {(guide.attachments || []).map((a) => {
          const isPdf = a.name.toLowerCase().endsWith('.pdf');
          return (
            <div key={a.url} className="app-card app-card-pad">
              <div className="app-card-head">
                <div className="app-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={16} /> {a.name}
                </div>
                <a href={a.url} target="_blank" rel="noreferrer" className="app-card-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {t('guides.openInNewTab')} <ExternalLink size={13} />
                </a>
              </div>
              {isPdf ? (
                // Google's viewer renders consistently across desktop and
                // mobile browsers — a plain <iframe src={pdfUrl}> works on
                // desktop but most mobile browsers (especially iOS Safari)
                // don't render PDFs inline in an iframe at all.
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(a.url)}&embedded=true`}
                  title={a.name}
                  className="app-pdf-frame"
                />
              ) : (
                <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                  {t('guides.cannotPreview')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
