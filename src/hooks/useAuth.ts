import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../firebase';
import { roleForEmail, type AppRole } from '../constants/roles';

export function useAuth(): { user: User | null; role: AppRole | null; authLoading: boolean; refreshUser: () => void } {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Firebase mutates `auth.currentUser` in place on updateProfile(), so it
  // won't trigger onAuthStateChanged — clone it to force a re-render.
  function refreshUser() {
    if (auth.currentUser) {
      setUser(Object.assign(Object.create(Object.getPrototypeOf(auth.currentUser)), auth.currentUser));
    }
  }

  return { user, role: user ? roleForEmail(user.email) : null, authLoading, refreshUser };
}
