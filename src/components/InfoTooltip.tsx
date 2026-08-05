import { useState } from 'react';
import { Info } from 'lucide-react';

// A small (i) icon that shows a short explanation on click/hover — for
// fields that are easy to misread (self-reported dates, estimates, etc.).
export default function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="More info"
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 15, height: 15, borderRadius: '50%', border: 'none', padding: 0, cursor: 'pointer',
          background: 'var(--neutral-soft)', color: 'var(--muted-2)',
        }}
      >
        <Info size={10} />
      </button>
      {open && (
        <span style={{
          position: 'absolute', bottom: '130%', left: '50%', transform: 'translateX(-50%)',
          width: 200, padding: '8px 10px', borderRadius: 8,
          background: 'var(--ink)', color: 'var(--surface)', fontSize: 11.5, fontWeight: 400,
          lineHeight: 1.5, textTransform: 'none', zIndex: 20, boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
        }}>
          {text}
        </span>
      )}
    </span>
  );
}
