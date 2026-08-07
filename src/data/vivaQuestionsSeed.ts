import type { VivaQuestionFormData } from '../services/vivaQuestionsService';

// Starter set of Opportunity Card interview questions, grouped by section —
// used by the "Import starter questions" button in admin/VivaQuestions.tsx.
// Matched against existing questions by exact text so re-clicking it is
// safe (only adds ones that aren't already there). SEED_SECTION_ORDER is
// the default section order seeded alongside them.
export const SEED_SECTION_ORDER = [
  'Personal Introduction',
  'Education',
  'Professional Background',
  'Motivation for Germany',
  'City & Job Plan in Germany',
  'Reference Person',
  'German Language',
  'Documents / Financial',
  'Travel & Stay Plan',
  'General Advice',
];

export const VIVA_QUESTIONS_SEED: Omit<VivaQuestionFormData, 'order'>[] = [
  // Personal introduction
  { section: 'Personal Introduction', question: "What's your name?", note: '' },
  { section: 'Personal Introduction', question: 'Spell your name.', note: "Only asked if the officer is confused by your name — spell it out clearly, letter by letter." },

  // Education
  { section: 'Education', question: 'Describe your degree and university.', note: '' },
  { section: 'Education', question: 'What is your passing year?', note: '' },
  { section: 'Education', question: 'Which city is your university in?', note: '' },

  // Professional background
  { section: 'Professional Background', question: 'Describe your job role / professional background.', note: '' },
  { section: 'Professional Background', question: 'Where is your current office located?', note: '' },
  { section: 'Professional Background', question: "What was your first job after your Bachelor's?", note: '' },
  { section: 'Professional Background', question: 'Where is your factory located?', note: '' },
  { section: 'Professional Background', question: 'What products do you produce?', note: '' },

  // Motivation for Germany
  { section: 'Motivation for Germany', question: 'You have around X years of experience and a good position — why do you want to go to Germany?', note: '' },
  { section: 'Motivation for Germany', question: 'Why Germany, and not another country?', note: '' },
  { section: 'Motivation for Germany', question: 'Why this visa (Opportunity Card), and not Family Reunion (FRV) or another visa?', note: '' },

  // City & job plan in Germany
  { section: 'City & Job Plan in Germany', question: 'Which city do you want to live in, and why?', note: '' },
  { section: 'City & Job Plan in Germany', question: 'Do you want to go to Berlin (or another specific city) first?', note: '' },
  { section: 'City & Job Plan in Germany', question: 'Is your profession regulated? What will you do in Germany if so?', note: '' },
  { section: 'City & Job Plan in Germany', question: 'What type of job are you looking for in Germany? Do you have a specific company in mind?', note: '' },
  {
    section: 'City & Job Plan in Germany',
    question: 'How will you search for jobs there? How many jobs have you applied for, and have you had any responses?',
    note: "It's fine to say you've received rejection emails — that shows you're actively applying.",
  },
  { section: 'City & Job Plan in Germany', question: 'Can you show me some examples of your job applications?', note: '' },

  // Reference person
  { section: 'Reference Person', question: 'Who is your reference person?', note: '' },
  { section: 'Reference Person', question: 'Do you have their ID?', note: '' },
  { section: 'Reference Person', question: "What are your reference person's details?", note: '' },
  {
    section: 'Reference Person',
    question: 'How do you know him, and how do you stay in touch?',
    note: "Prepare a simple, honest answer — e.g. \"We're in regular contact, he's family\" or \"We speak on WhatsApp/phone regularly.\"",
  },
  { section: 'Reference Person', question: 'What does he do in Germany?', note: "You need to know his actual job or field of study — don't guess." },
  { section: 'Reference Person', question: 'How long has he been living there?', note: 'Have the exact year ready.' },
  {
    section: 'Reference Person',
    question: 'Will he support you when you arrive?',
    note: 'Answer honestly based on the real plan — temporary stay, general support, or nothing specific.',
  },

  // German language
  { section: 'German Language', question: 'Do you know German? Have you learned it? Can you speak it?', note: '' },
  { section: 'German Language', question: 'Wie heißen Sie?', note: 'German for "What is your name?" — simple German questions may be asked during the interview.' },
  { section: 'German Language', question: 'In welcher Position arbeiten Sie?', note: 'German for "What is your position at work?"' },
  { section: 'German Language', question: 'Warum möchten Sie in Deutschland arbeiten?', note: 'German for "Why do you want to work in Germany?"' },
  { section: 'German Language', question: 'What is your German language level?', note: '' },
  { section: 'German Language', question: "What will you do in Germany if you don't know the language well?", note: '' },
  { section: 'German Language', question: 'Have you completed all 4 parts of the B1 exam?', note: "Only relevant if you've studied German." },

  // Documents / financial
  { section: 'Documents / Financial', question: 'Do you have a ZAB (foreign qualification recognition)?', note: '' },
  { section: 'Documents / Financial', question: 'When did you block your money (blocked account)?', note: '' },

  // Travel & stay plan
  { section: 'Travel & Stay Plan', question: 'What is your intended travel date?', note: '' },
  { section: 'Travel & Stay Plan', question: 'Where will you stay in Germany?', note: '' },
  { section: 'Travel & Stay Plan', question: 'Have you stayed in Germany before?', note: '' },
  { section: 'Travel & Stay Plan', question: 'What would you like to do after arriving in Germany?', note: '' },
  { section: 'Travel & Stay Plan', question: 'Do you have a hotel booking? Will you stay in a hotel initially?', note: '' },
  { section: 'Travel & Stay Plan', question: 'What will you do right after arriving?', note: '' },

  // General advice
  {
    section: 'General Advice',
    question: 'General advice for your interview',
    note: "Be very familiar with all your documents and present them carefully. Know your educational and professional background clearly. Answer confidently, honestly, and keep answers short and precise — avoid over-explaining. Be well prepared to explain why you want to go to Germany, especially with significant work experience. Be very careful when naming reference persons — they will be fully verified. Prepare your career plan and goals clearly, and stay polite and confident throughout. Stay sharply focused on exactly what's being asked; your documents represent you, so over-explaining can work against you.",
  },
];
