import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, ExternalLink } from 'lucide-react';
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

  return (
    <div>
      <Link to="/guides" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--muted)', textDecoration: 'none', marginBottom: 22 }}>
        <ArrowLeft size={14} /> All guides
      </Link>

      {guide === undefined ? (
        <div className="app-empty">Loading…</div>
      ) : guide === null ? (
        <div className="app-card app-card-pad">
          <div className="app-empty">This guide doesn't exist (or was removed).</div>
        </div>
      ) : (
        <>
          <div className="app-page-title" style={{ marginBottom: 24 }}>{guide.title}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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
                  style={{ width: '100%', height: 600, border: '1px solid var(--border)', borderRadius: 10 }}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
