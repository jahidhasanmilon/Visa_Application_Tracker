import { useMemo } from 'react';
import PageHeader from '../../components/PageHeader';
import SummaryStat from '../../components/SummaryStat';
import FunnelChart from '../../components/FunnelChart';
import { DashboardSkeleton } from '../../components/Skeleton';
import { useApplicants, statusOptionsFromRoadmap } from '../../hooks/useApplicants';
import { useRoadmapTemplate } from '../../hooks/useTemplates';
import { getStatusMeta } from '../../constants/status';

export default function AdminAnalytics() {
  const { enriched, stats, loading } = useApplicants();
  const roadmapTemplate = useRoadmapTemplate();
  const statusOptions = useMemo(() => statusOptionsFromRoadmap(roadmapTemplate || []), [roadmapTemplate]);

  const funnelData = useMemo(() => statusOptions.map(status => ({
    name: status,
    value: enriched.filter(a => a.status === status).length,
    color: getStatusMeta(status).color,
  })), [statusOptions, enriched]);

  const conversionRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;
  const submittedApplicants = enriched.filter((a): a is typeof a & { waiting: number } => a.waiting !== null);
  const avgWaiting = submittedApplicants.length > 0
    ? Math.round(submittedApplicants.reduce((sum, a) => sum + a.waiting, 0) / submittedApplicants.length)
    : 0;

  if (loading) {
    return (
      <>
        <PageHeader title="Analytics" subtitle="How applications are moving through the pipeline." />
        <DashboardSkeleton />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Analytics" subtitle="How applications are moving through the pipeline." />
      <div className="app-content">
        <div className="app-card app-card-pad">
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <SummaryStat label="Total applicants" value={stats.total} />
            <SummaryStat label="Completion rate" value={`${conversionRate}%`} />
            <SummaryStat label="Avg. waiting time" value={`${avgWaiting}d`} />
            <SummaryStat label="Overdue" value={stats.overdue} />
          </div>
        </div>

        <div className="app-card app-card-pad">
          <div className="app-card-head">
            <div className="app-card-title">Applicants by stage</div>
          </div>
          <FunnelChart data={funnelData} />
        </div>
      </div>
    </>
  );
}
