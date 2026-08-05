import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type UserCredential,
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../firebase';

const googleProvider = new GoogleAuthProvider();

export function signUpWithEmail(email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signInWithGoogle(): Promise<UserCredential> {
  return signInWithPopup(auth, googleProvider);
}

export function signOut(): Promise<void> {
  return firebaseSignOut(auth);
}

export function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}

export async function updateDisplayName(name: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in.');
  await updateProfile(user, { displayName: name });
}

export async function uploadProfilePhoto(file: File): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in.');
  const fileRef = ref(storage, `avatars/${user.uid}`);
  await uploadBytes(fileRef, file, { contentType: file.type });
  const url = await getDownloadURL(fileRef);
  await updateProfile(user, { photoURL: url });
  return url;
}

// Turns Firebase's error codes into an i18n key (AuthForm resolves it via
// t() so the message respects the current language). Firebase's newer SDKs
// collapse "no such user" and "wrong password" into the same
// auth/invalid-credential code (email-enumeration protection), so that case
// gets a message covering both possibilities rather than guessing.
export function authErrorKey(code: string): string {
  switch (code) {
    case 'auth/invalid-email': return 'login.err.invalidEmail';
    case 'auth/user-not-found': return 'login.err.noAccount';
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'login.err.noAccountOrWrongPassword';
    case 'auth/email-already-in-use': return 'login.err.emailInUse';
    case 'auth/weak-password': return 'login.err.weakPassword';
    case 'auth/popup-closed-by-user': return 'login.err.popupClosed';
    case 'auth/too-many-requests': return 'login.err.tooManyRequests';
    default: return 'login.err.generic';
  }
}

// Whether this error code means the sign-in attempt likely has no matching
// account — used to surface a "Create account" shortcut instead of just text.
export function isNoAccountError(code: string): boolean {
  return code === 'auth/user-not-found' || code === 'auth/invalid-credential';
}
