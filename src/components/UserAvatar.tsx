import { useState } from 'react';
import type { User } from 'firebase/auth';
import { displayNameFor } from '../utils/userDisplay';

interface UserAvatarProps {
  user: User;
  size?: 'lg';
  className?: string;
  style?: React.CSSProperties;
  /** Skip the per-user color and use the plain default (e.g. inside the dark sidebar). */
  plain?: boolean;
}

const PALETTE: { bg: string; fg: string }[] = [
  { bg: 'var(--violet-soft)', fg: 'var(--violet)' },
  { bg: 'var(--success-soft)', fg: 'var(--success)' },
  { bg: 'var(--info-soft)', fg: 'var(--info)' },
  { bg: 'var(--warning-soft)', fg: 'var(--warning-ink)' },
  { bg: 'var(--danger-soft)', fg: 'var(--danger)' },
];

function initialsFor(user: User): string {
  const source = displayNameFor(user);
  const parts = source.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function colorFor(user: User): { bg: string; fg: string } {
  const source = user.uid || user.email || '?';
  let hash = 0;
  for (let i = 0; i < source.length; i++) hash = (hash * 31 + source.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export default function UserAvatar({ user, size, className = '', style, plain }: UserAvatarProps) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const classes = `app-avatar${size === 'lg' ? ' app-avatar-lg' : ''}${className ? ` ${className}` : ''}`;

  if (user.photoURL && !photoFailed) {
    return (
      <img
        src={user.photoURL}
        alt={displayNameFor(user)}
        referrerPolicy="no-referrer"
        onError={() => setPhotoFailed(true)}
        className={classes}
        style={{ objectFit: 'cover', ...style }}
      />
    );
  }

  const colors = plain ? null : colorFor(user);

  return (
    <div className={classes} style={{ ...(colors ? { background: colors.bg, color: colors.fg } : {}), ...style }}>
      {initialsFor(user)}
    </div>
  );
}
