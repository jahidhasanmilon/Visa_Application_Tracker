import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
          </div>
        </>
      )}
    </div>
  );
}
