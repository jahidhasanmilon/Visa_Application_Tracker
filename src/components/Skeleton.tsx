interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = 14, radius = 6, className = '', style }: SkeletonProps) {
  return <div className={`app-skeleton ${className}`} style={{ width, height, borderRadius: radius, ...style }} />;
}

export function DashboardSkeleton() {
  return (
    <div className="app-content">
      <div className="app-stat-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="app-stat-card" key={i}>
            <div className="app-stat-top">
              <Skeleton width={36} height={36} radius={10} />
            </div>
            <Skeleton width={48} height={24} style={{ marginTop: 10 }} />
            <Skeleton width="70%" height={11} style={{ marginTop: 8 }} />
          </div>
        ))}
      </div>

      <div className="app-dashboard-grid">
        <div className="app-card app-card-pad">
          <Skeleton width={140} height={14} style={{ marginBottom: 16 }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
              <Skeleton width={34} height={34} radius="50%" />
              <div style={{ flex: 1 }}>
                <Skeleton width="55%" height={13} />
                <Skeleton width="30%" height={10} style={{ marginTop: 6 }} />
              </div>
              <Skeleton width={70} height={22} radius={999} />
            </div>
          ))}
        </div>

        <div className="app-card app-card-pad">
          <Skeleton width={140} height={14} style={{ marginBottom: 16 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
            <Skeleton width={168} height={168} radius="50%" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minWidth: 140 }}>
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} width="100%" height={13} />)}
            </div>
          </div>
        </div>
      </div>

      <div className="app-card app-card-pad">
        <Skeleton width={160} height={14} style={{ marginBottom: 16 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
              <Skeleton width="65%" height={13} />
              <Skeleton width="80%" height={11} style={{ marginTop: 8 }} />
              <Skeleton width="45%" height={11} style={{ marginTop: 8 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  const cols = 9;
  return (
    <div className="app-content">
      <div className="app-card app-card-pad">
        <div className="app-toolbar">
          <Skeleton width={260} height={38} radius={10} />
          <Skeleton width={140} height={38} radius={10} />
          <Skeleton width={150} height={38} radius={10} />
        </div>
        <div className="app-table-wrap" style={{ marginTop: 16 }}>
          <table className="app-table">
            <tbody>
              {Array.from({ length: rows }).map((_, r) => (
                <tr key={r}>
                  {Array.from({ length: cols }).map((_, c) => (
                    <td key={c}><Skeleton width={c === 1 ? '80%' : '55%'} height={12} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function KanbanSkeleton() {
  return (
    <div className="app-content">
      <div className="app-kanban">
        {Array.from({ length: 5 }).map((_, i) => (
          <div className="app-kanban-col" key={i}>
            <div className="app-kanban-col-head">
              <Skeleton width={90} height={13} />
              <Skeleton width={20} height={18} radius={999} />
            </div>
            {Array.from({ length: 2 }).map((_, j) => (
              <div className="app-kanban-card" key={j} style={{ cursor: 'default' }}>
                <Skeleton width="70%" height={13} />
                <Skeleton width="50%" height={11} style={{ marginTop: 6 }} />
                <Skeleton width="60%" height={11} style={{ marginTop: 6 }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListDetailSkeleton() {
  return (
    <div className="app-content">
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 300px) 1fr', gap: 20, alignItems: 'start' }}>
        <div className="app-card app-card-pad">
          <Skeleton height={38} radius={10} style={{ marginBottom: 14 }} />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ padding: '9px 10px' }}>
              <Skeleton width="70%" height={13} />
              <Skeleton width="40%" height={10} style={{ marginTop: 6 }} />
            </div>
          ))}
        </div>
        <div className="app-card app-card-pad">
          <Skeleton width={160} height={16} style={{ marginBottom: 16 }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px', marginBottom: 8 }}>
              <Skeleton width={60} height={22} radius={999} />
              <Skeleton width="50%" height={13} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Note: unlike the other skeletons above, this one does NOT include an
// `.app-content` wrapper — its two call sites (applicant Dashboard/Checklist)
// already render one around the loading/loaded conditional.
export function CardListSkeleton({ variant = 'application' }: { variant?: 'application' | 'checklist' }) {
  if (variant === 'checklist') {
    return (
      <div className="app-card app-card-pad">
        <Skeleton width={140} height={16} style={{ marginBottom: 4 }} />
        <Skeleton width={90} height={11} style={{ marginBottom: 16 }} />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 4px', borderBottom: '1px solid var(--border)' }}>
            <Skeleton width={22} height={22} radius="50%" />
            <Skeleton width="50%" height={13} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="app-card app-card-pad">
      <div className="app-card-head" style={{ alignItems: 'flex-start' }}>
        <div>
          <Skeleton width={140} height={16} />
          <Skeleton width={90} height={11} style={{ marginTop: 8 }} />
          <Skeleton width={110} height={24} radius={999} style={{ marginTop: 10 }} />
        </div>
        <Skeleton width={96} height={70} radius={14} />
      </div>

      <div style={{ display: 'flex', gap: 10, margin: '22px 0' }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 76 }}>
            <Skeleton width={26} height={26} radius="50%" />
            <Skeleton width={50} height={9} />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton width="60%" height={10} />
            <Skeleton width="45%" height={14} style={{ marginTop: 6 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
