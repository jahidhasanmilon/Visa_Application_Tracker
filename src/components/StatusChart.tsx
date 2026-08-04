import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getStatusMeta } from '../constants/status';
import type { PieDatum } from '../types';

interface StatusChartProps {
  pieData: PieDatum[];
}

export default function StatusChart({ pieData }: StatusChartProps) {
  const total = pieData.reduce((sum, d) => sum + d.value, 0);

  if (pieData.length === 0) {
    return <div className="app-empty">No applications yet.</div>;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
      <div style={{ width: 168, height: 168, position: 'relative', flexShrink: 0 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={80} paddingAngle={3} stroke="none">
              {pieData.map((d, i) => (
                <Cell key={i} fill={getStatusMeta(d.name).color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div className="app-brand-font" style={{ fontWeight: 700, fontSize: 24 }}>{total}</div>
          <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>total</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 140 }}>
        {pieData.map(d => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13 }}>
            <span className="app-dot" style={{ background: getStatusMeta(d.name).color }} />
            <span style={{ fontWeight: 600, flex: 1 }}>{d.name}</span>
            <span style={{ color: 'var(--muted)' }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
