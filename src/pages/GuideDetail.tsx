import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, ExternalLink } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { subscribeGuideBySlug } from '../services/guidesService';
import type { Guide } from '../types';

export default function GuideDetail() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [guide, setGuide] = useState<Guide | null | undefined>(undefined);

  useEffect(() => {
    setGuide(undefined);
    const unsub = subscribeGuideBySlug(slug, setGuide);
    return unsub;
  }, [slug]);

  // Relative "up one level" link — resolves to /app/guides inside the app
  // shell, or /guides on the public route, whichever this page is
  // currently mounted under.
  const backLink = (
    <Link to=".." className="app-card-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <ArrowLeft size={14} /> All guides
    </Link>
  );

  if (guide === undefined) {
    return (
      <>
        <PageHeader title="Guides & Resources" actions={backLink} />
        <div className="app-content"><div className="app-empty">Loading…</div></div>
      </>
    );
  }

  if (guide === null) {
    return (
      <>
        <PageHeader title="Guides & Resources" actions={backLink} />
        <div className="app-content">
          <div className="app-card app-card-pad">
            <div className="app-empty">This guide doesn't exist (or was removed).</div>
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
            <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>{s.body}</div>
          </div>
        ))}

        {guide.attachmentUrl && (
          <div className="app-card app-card-pad">
            <div className="app-card-head">
              <div className="app-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={16} /> {guide.attachmentName || 'Attachment'}
              </div>
              <a href={guide.attachmentUrl} target="_blank" rel="noreferrer" className="app-card-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Open in new tab <ExternalLink size={13} />
              </a>
            </div>
            <iframe
              src={guide.attachmentUrl}
              title={guide.attachmentName || 'Guide attachment'}
              className="app-pdf-frame"
            />
          </div>
        )}
      </div>
    </>
  );
}
