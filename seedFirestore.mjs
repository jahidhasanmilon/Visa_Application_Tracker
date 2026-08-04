// One-time script to bulk-import your original spreadsheet's applicants into Firestore.
//
// Run with (env vars, nothing hardcoded):
//   SEED_EMAIL=you@example.com SEED_PASSWORD=yourpassword node seedFirestore.mjs
//
// Or create a local .env file (already gitignored) with:
//   SEED_EMAIL=you@example.com
//   SEED_PASSWORD=yourpassword
// and run: node --env-file=.env seedFirestore.mjs
//
// Applicant data has been moved to seedData.local.json (gitignored) — see
// seedData.example.json for the expected shape. This keeps real names/emails
// out of git history.

import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAtEbV9al4A2zI0VGfGyaoMarjWwurBFj4',
  authDomain: 'tracisa-57112.firebaseapp.com',
  projectId: 'tracisa-57112',
  storageBucket: 'tracisa-57112.firebasestorage.app',
  messagingSenderId: '269167825813',
  appId: '1:269167825813:web:aa8d10c7a6e7c5c4149c9c',
  measurementId: 'G-57K1TL96YQ',
};

const EMAIL = process.env.SEED_EMAIL;
const PASSWORD = process.env.SEED_PASSWORD;

const SEED_APPLICANTS = JSON.parse(
  readFileSync(new URL('./seedData.local.json', import.meta.url), 'utf-8')
);

async function run() {
  if (!EMAIL || !PASSWORD) {
    console.error('Please set SEED_EMAIL and SEED_PASSWORD environment variables before running.');
    process.exit(1);
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log('Signing in...');
  await signInWithEmailAndPassword(auth, EMAIL, PASSWORD);

  console.log(`Importing ${SEED_APPLICANTS.length} applicants...`);
  for (const applicant of SEED_APPLICANTS) {
    await addDoc(collection(db, 'applicants'), {
      ...applicant,
      lastUpdated: new Date().toISOString().slice(0, 10),
      reminderMailSent: 'Not yet',
      createdAt: serverTimestamp(),
    });
    console.log(`  added: ${applicant.name} (${applicant.serialNo})`);
  }

  console.log('Done. Check Firestore Console -> applicants collection.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Import failed:', err.message);
  process.exit(1);
});
