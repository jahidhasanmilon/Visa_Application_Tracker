import type { CSSProperties } from 'react';

// Drawn as SVG rather than flag emoji (🇧🇩/🇩🇪) — Windows desktop browsers
// render flag emoji as plain two-letter text instead of an actual flag, so
// emoji looked fine on mobile but broken on PC. This renders identically
// everywhere.
interface FlagIconProps {
  size?: number;
  style?: CSSProperties;
}

const BASE_STYLE: CSSProperties = { display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 };

export function BangladeshFlag({ size = 16, style }: FlagIconProps) {
  return (
    <svg width={size} height={size * 13 / 20} viewBox="0 0 20 13" aria-hidden="true" style={{ ...BASE_STYLE, ...style }}>
      <rect width="20" height="13" fill="#006a4e" />
      <circle cx="8.7" cy="6.5" r="4.4" fill="#f42a41" />
    </svg>
  );
}

export function GermanyFlag({ size = 16, style }: FlagIconProps) {
  return (
    <svg width={size} height={size * 13 / 20} viewBox="0 0 20 13" aria-hidden="true" style={{ ...BASE_STYLE, ...style }}>
      <rect width="20" height="13" fill="#000000" />
      <rect y="4.33" width="20" height="4.34" fill="#dd0000" />
      <rect y="8.67" width="20" height="4.33" fill="#ffce00" />
    </svg>
  );
}
