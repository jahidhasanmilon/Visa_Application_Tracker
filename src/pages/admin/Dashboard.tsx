import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatCards from '../../components/StatCards';
import StatusChart from '../../components/StatusChart';
import { DashboardSkeleton } from '../../components/Skeleton';
import { useApplicants } from '../../hooks/useApplicants';
import { getStatusMeta } from '../../constants/status';
import { fmtDate } from '../../utils/dateHelpers';

export default function AdminDashboard() {
  const { enriched, stats, pieData, loading } = useApplicants();

  const recent = [...enriched]
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    .slice(0, 5);

  const attention = enriched
    .filter(a => a.remaining !== null && a.remaining <= 30 && a.status !== 'Approved' && a.status !== 'Rejected')
    .sort((a, b) => a.remaining! - b.remaining!)
    .slice(0, 6);

  if (loading) {
    return (
      <>
        <PageHeader
          title="Dashboard"
          subtitle="Here's where every case stands right now."
          actions={<Link to="/app/applications" className="app-btn app-btn-accent">Manage applications</Link>}
        />
        <DashboardSkeleton />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Here's where every case stands right now."
        actions={<Link to="/app/applications" className="app-btn app-btn-accent">Manage applications</Link>}
      />
      <div className="app-content">
        <StatCards stats={stats} />

        <div className="app-dashboard-grid">
          <div className="app-card app-card-pad">
            <div className="app-card-head">
              <div className="app-card-title">Recent applicants</div>
              <Link to="/app/applications" className="app-card-link">View all</Link>
            </div>
            {recent.length === 0 ? (
              <div className="app-empty">No applicants yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recent.map(a => {
                  const meta = getStatusMeta(a.status);
                  const Icon = meta.icon;
                  return (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
                      <div className="app-avatar" style={{ background: meta.bg, color: meta.color }}>{a.name.slice(0, 1).toUpperCase()}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{a.name}</div>
                        <div className="app-mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{a.serialNo}</div>
                      </div>
                      <span className="app-badge" style={{ background: meta.bg, color: meta.color }}>
                        <Icon size={12} /> {a.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="app-card app-card-pad">
            <div className="app-card-head">
              <div className="app-card-title">Status breakdown</div>
            </div>
            <StatusChart pieData={pieData} />
          </div>
        </div>

        <div className="app-card app-card-pad">
          <div className="app-card-head">
            <div className="app-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} color="var(--danger)" /> Needs attention
            </div>
            <Link to="/app/tracker" className="app-card-link">Open tracker</Link>
          </div>
          {attention.length === 0 ? (
            <div className="app-empty">Nothing urgent — everyone's on track.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {attention.map(a => (
                <div key={a.id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{a.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>Last updated {fmtDate(a.lastUpdated)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12.5, fontWeight: 600, color: a.urg.color }}>
                    <span className="app-dot" style={{ background: a.urg.color }} />
                    {a.remaining! > 0 ? `${a.remaining}d left (est.)` : `${Math.abs(a.remaining!)}d overdue`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
