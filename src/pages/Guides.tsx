import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { subscribeGuides } from '../services/guidesService';
import type { Guide } from '../types';

const UNCATEGORIZED = 'General';

export default function Guides() {
  const [guides, setGuides] = useState<Guide[] | null>(null);

  useEffect(() => {
    const unsub = subscribeGuides(setGuides);
    return unsub;
  }, []);

  const grouped = useMemo(() => {
    if (!guides) return [];
    const byCategory = new Map<string, Guide[]>();
    for (const g of guides) {
      const cat = g.category?.trim() || UNCATEGORIZED;
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat)!.push(g);
    }
    return [...byCategory.entries()];
  }, [guides]);

  return (
    <>
      <PageHeader
        title="Guides & Resources"
        subtitle="Everything the community has put together about the Germany Opportunity Card process."
      />
      <div className="app-content">
        {guides === null ? (
          <div className="app-empty">Loading…</div>
        ) : guides.length === 0 ? (
          <div className="app-card app-card-pad">
            <div className="app-empty">No resources published yet — check back soon.</div>
          </div>
        ) : (
          grouped.map(([category, items]) => (
            <div key={category}>
              <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)', marginBottom: 10 }}>
                {category}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {items.map(g => (
                  <Link
                    key={g.id}
                    to={g.slug}
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
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="app-card-title">{g.title}</div>
                      {g.sections[0] && (
                        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>{g.sections[0].heading}</div>
                      )}
                    </div>
                    <ChevronRight size={18} color="var(--muted)" />
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
