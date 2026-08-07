// A native <input type="time"> renders in whatever 12h/24h format the
// browser's OS locale uses — `lang="en-GB"` doesn't reliably force 24h
// everywhere (e.g. still showed "08:49 AM" on Windows/Chrome). Two plain
// selects sidestep that entirely: always "13", never "1 PM".
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

interface TimeInput24Props {
  value: string; // "HH:MM"
  onChange: (value: string) => void;
}

export default function TimeInput24({ value, onChange }: TimeInput24Props) {
  const [hh, mm] = value.split(':');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
      <select className="app-select" value={hh || '00'} onChange={e => onChange(`${e.target.value}:${mm || '00'}`)} aria-label="Hour (24h)" style={{ flex: 1 }}>
        {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
      </select>
      <span style={{ color: 'var(--muted)' }}>:</span>
      <select className="app-select" value={mm || '00'} onChange={e => onChange(`${hh || '00'}:${e.target.value}`)} aria-label="Minute" style={{ flex: 1 }}>
        {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
    </div>
  );
}
