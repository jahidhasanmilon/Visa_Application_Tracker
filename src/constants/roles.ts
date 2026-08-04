// Admin accounts that get the admin experience (full read/write on applicants).
// Mirror this list in firestore.rules under isAdminEmail() when you change it.
export const ADMIN_EMAILS: string[] = [
  'jahidhasanmilon999@gmail.com',
];

export type AppRole = 'admin' | 'applicant';

export function roleForEmail(email: string | null | undefined): AppRole {
  if (email && ADMIN_EMAILS.includes(email.toLowerCase())) return 'admin';
  return 'applicant';
}
