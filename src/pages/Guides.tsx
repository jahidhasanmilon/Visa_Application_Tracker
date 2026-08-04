import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import { subscribeGuides } from '../services/guidesService';
import type { Guide } from '../types';

export default function Guides() {
  const [guides, setGuides] = useState<Guide[] | null>(null);

  useEffect(() => {
    const unsub = subscribeGuides(setGuides);
    return unsub;
  }, []);

  return (
    <div>
      <div className="app-page-title" style={{ marginBottom: 4 }}>Guides &amp; resources</div>
      <div className="app-page-subtitle" style={{ marginBottom: 24 }}>
        Everything the community has put together about the Germany Opportunity Card process — sign in to track your own application against it.
      </div>

      {guides === null ? (
        <div className="app-empty">Loading…</div>
      ) : guides.length === 0 ? (
        <div className="app-card app-card-pad">
          <div className="app-empty">No guides published yet — check back soon.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {guides.map(g => (
            <Link
              key={g.id}
              to={`/guides/${g.slug}`}
              className="app-card app-card-pad"
              style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--violet-soft)', color: 'var(--violet)',
              }}>
                <BookOpen size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="app-card-title">{g.title}</div>
                {g.sections[0] && (
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>{g.sections[0].heading}</div>
                )}
              </div>
              <ChevronRight size={18} color="var(--muted)" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
