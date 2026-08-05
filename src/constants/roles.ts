// Permanent fallback admin — mirrored in firestore.rules' isAdminEmail() and
// functions/src/index.ts. Everyone else becomes admin via a doc in the
// `admins` Firestore collection (see services/adminsService.ts), managed
// from src/pages/admin/Admins.tsx — this owner email can't be removed
// through that UI, so the app can never be locked out of admin access.
export const OWNER_EMAIL = 'jahidhasanmilon999@gmail.com';

export type AppRole = 'admin' | 'applicant';

export function isOwnerEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase() === OWNER_EMAIL;
}
