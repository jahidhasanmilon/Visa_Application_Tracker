import type { User } from 'firebase/auth';

// Email/password sign-ups have no `displayName` from Firebase — derive a
// readable name from the email's local part (e.g. "jahid.hasan" -> "Jahid Hasan").
export function displayNameFor(user: User): string {
  if (user.displayName) return user.displayName;
  const local = user.email?.split('@')[0] || '';
  const words = local.replace(/[._-]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'Signed-in account';
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
