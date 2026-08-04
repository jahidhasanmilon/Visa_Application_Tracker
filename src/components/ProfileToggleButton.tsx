import { useLocation, useNavigate } from 'react-router-dom';
import type { User } from 'firebase/auth';
import UserAvatar from './UserAvatar';

export default function ProfileToggleButton({ user }: { user: User }) {
  const location = useLocation();
  const navigate = useNavigate();
  const onProfile = location.pathname === '/app/profile';

  return (
    <button
      type="button"
      onClick={() => navigate(onProfile ? '/app/dashboard' : '/app/profile')}
      title={onProfile ? 'Back to dashboard' : 'Profile'}
      aria-label={onProfile ? 'Back to dashboard' : 'Profile'}
      style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', borderRadius: '50%', lineHeight: 0 }}
    >
      <UserAvatar user={user} />
    </button>
  );
}
