export default function SummaryStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="app-brand-font" style={{ fontWeight: 700, fontSize: 26 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
    </div>
  );
}
