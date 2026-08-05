import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../firebase';
import { isOwnerEmail, type AppRole } from '../constants/roles';
import { subscribeIsAdmin } from '../services/adminsService';

interface UseAuthResult {
  user: User | null;
  role: AppRole | null;
  authLoading: boolean;
  // True once `user` is known but the admin-doc check hasn't resolved yet
  // (role is unreliable — null, not "confirmed applicant" — while this is true).
  roleLoading: boolean;
  refreshUser: () => void;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user?.email) { setIsAdmin(null); return; }
    if (isOwnerEmail(user.email)) { setIsAdmin(true); return; }
    setIsAdmin(null);
    return subscribeIsAdmin(user.email, setIsAdmin);
  }, [user?.email]);

  // Firebase mutates `auth.currentUser` in place on updateProfile(), so it
  // won't trigger onAuthStateChanged — clone it to force a re-render.
  function refreshUser() {
    if (auth.currentUser) {
      setUser(Object.assign(Object.create(Object.getPrototypeOf(auth.currentUser)), auth.currentUser));
    }
  }

  const role: AppRole | null = !user ? null : isAdmin === null ? null : isAdmin ? 'admin' : 'applicant';
  const roleLoading = !!user && isAdmin === null;

  return { user, role, authLoading, roleLoading, refreshUser };
}
