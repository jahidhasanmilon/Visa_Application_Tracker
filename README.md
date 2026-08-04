# VisaTrack

Interactive visa application tracker built with **React + TypeScript + Vite + Firebase**.

## Setup

```bash
npm install
npm run dev
```

Then open the local URL shown in the terminal (usually http://localhost:5173).

## Build

```bash
npm run build
```

Type-checks with `tsc -b`, then bundles with Vite.

## Firebase

This app uses Firebase for **Auth** (email/password + Google) and **Firestore** (data storage).

1. Firebase config lives in `src/firebase.ts`. It's already wired to the project's Firebase app —
   the API key there is safe to keep in client code (Firebase web keys aren't secret; access is
   controlled by the security rules below, not by hiding the key).
2. In the [Firebase Console](https://console.firebase.google.com), open **Firestore Database → Rules**
   and paste the contents of `firestore.rules` in this repo, then publish.
3. Make sure **Authentication → Sign-in method** has Email/Password and Google enabled.

## Project structure

```
src/
  components/         UI components (table, modal, toolbar, charts, login screen, etc.)
  constants/          Status options and metadata
  data/seedData.ts    Original spreadsheet data (kept for reference; Login Info sheet excluded)
  hooks/useAuth.ts    Tracks the current signed-in Firebase user
  services/
    authService.ts        Sign in / sign up / Google sign-in / sign out
    applicantsService.ts  Firestore CRUD + realtime subscriptions for applicants & status log
  utils/dateHelpers.ts Waiting/remaining time calculation
  types.ts            Shared TypeScript types
  styles/theme.css     Shared design tokens and styling
  firebase.ts          Firebase app/auth/firestore initialization
  App.tsx              Wires everything together
```

## Data & access

- Every screen requires sign-in (email/password or Google) — see `LoginScreen.tsx`.
- Applicant and status-log data live in Firestore (`applicants`, `statusLog` collections) and
  update in real time across devices via `onSnapshot` listeners.
- Any signed-in user currently has full read/write access (see `firestore.rules`). Add
  role-based restrictions there later if you need staff-only vs. read-only accounts.

## Note

The original spreadsheet's "Login Info" tab (plaintext passwords) was intentionally left out.
Real authentication now runs through Firebase Auth instead.
