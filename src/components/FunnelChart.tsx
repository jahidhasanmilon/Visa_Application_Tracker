import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export interface FunnelDatum {
  name: string;
  value: number;
  color: string;
}

interface FunnelChartProps {
  data: FunnelDatum[];
}

export default function FunnelChart({ data }: FunnelChartProps) {
  if (data.every(d => d.value === 0)) {
    return <div className="app-empty">No applications yet.</div>;
  }

  return (
    <div style={{ width: '100%', height: Math.max(220, data.length * 44) }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
          <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12, fill: 'var(--ink)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
          <Tooltip
            cursor={{ fill: 'var(--surface-2)' }}
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12.5 }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
