import { useLayoutEffect, useRef, useState } from 'react';
import { Info } from 'lucide-react';

const TOOLTIP_WIDTH = 200;
const VIEWPORT_MARGIN = 10;

// A small (i) icon that shows a short explanation on click/hover — for
// fields that are easy to misread (self-reported dates, estimates, etc.).
// Positioned in the viewport (not relative to its own icon) and clamped to
// stay on-screen — near a screen edge (common on mobile, or icons sitting
// close to a card's edge), a naive "always centered on the icon" tooltip
// overflows off-screen or overlaps neighboring content.
export default function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const btnRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const idealLeft = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
    const maxLeft = window.innerWidth - TOOLTIP_WIDTH - VIEWPORT_MARGIN;
    setLeft(Math.min(Math.max(idealLeft, VIEWPORT_MARGIN), Math.max(maxLeft, VIEWPORT_MARGIN)));
    setTop(rect.top - 8);
  }, [open]);

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={btnRef}
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
          position: 'fixed', top, left, transform: 'translateY(-100%)',
          width: TOOLTIP_WIDTH, padding: '8px 10px', borderRadius: 8,
          background: 'var(--ink)', color: 'var(--surface)', fontSize: 11.5, fontWeight: 400,
          lineHeight: 1.5, textTransform: 'none', zIndex: 100, boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
        }}>
          {text}
        </span>
      )}
    </span>
  );
}
