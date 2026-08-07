import type { VivaQuestionFormData } from '../services/vivaQuestionsService';

// Starter set of Opportunity Card interview questions — used by the
// "Import starter questions" button in admin/VivaQuestions.tsx. Matched
// against existing questions by exact text so re-clicking it is safe (only
// adds ones that aren't already there).
export const VIVA_QUESTIONS_SEED: Omit<VivaQuestionFormData, 'order'>[] = [
  // Personal introduction
  { question: "What's your name?", note: '' },
  { question: 'Spell your name.', note: '' },

  // Education
  { question: 'Describe your degree and university.', note: '' },
  { question: 'What is your passing year?', note: '' },
  { question: 'Which city is your university in?', note: '' },

  // Professional background
  { question: 'Describe your job role / professional background.', note: '' },
  { question: 'Where is your current office located?', note: '' },
  { question: "What was your first job after your Bachelor's?", note: '' },
  { question: 'Where is your factory located?', note: '' },
  { question: 'What products do you produce?', note: '' },

  // Motivation for Germany
  { question: 'You have around X years of experience and a good position — why do you want to go to Germany?', note: '' },
  { question: 'Why Germany, and not another country?', note: '' },
  { question: 'Why this visa (Opportunity Card), and not Family Reunion (FRV) or another visa?', note: '' },

  // City & job plan in Germany
  { question: 'Which city do you want to live in, and why?', note: '' },
  { question: 'Do you want to go to Berlin (or another specific city) first?', note: '' },
  { question: 'Is your profession regulated? What will you do in Germany if so?', note: '' },
  { question: 'What type of job are you looking for in Germany? Do you have a specific company in mind?', note: '' },
  {
    question: 'How will you search for jobs there? How many jobs have you applied for, and have you had any responses?',
    note: "It's fine to say you've received rejection emails — that shows you're actively applying.",
  },
  { question: 'Can you show me some examples of your job applications?', note: '' },

  // Reference person
  { question: 'Who is your reference person?', note: '' },
  { question: 'Do you have their ID?', note: '' },
  { question: "What are your reference person's details?", note: '' },
  {
    question: 'How do you know him, and how do you stay in touch?',
    note: "Prepare a simple, honest answer — e.g. \"We're in regular contact, he's family\" or \"We speak on WhatsApp/phone regularly.\"",
  },
  { question: 'What does he do in Germany?', note: "You need to know his actual job or field of study — don't guess." },
  { question: 'How long has he been living there?', note: 'Have the exact year ready.' },
  {
    question: 'Will he support you when you arrive?',
    note: 'Answer honestly based on the real plan — temporary stay, general support, or nothing specific.',
  },

  // German language
  { question: 'Do you know German? Have you learned it? Can you speak it?', note: '' },
  { question: 'Wie heißen Sie?', note: 'German for "What is your name?" — simple German questions may be asked during the interview.' },
  { question: 'In welcher Position arbeiten Sie?', note: 'German for "What is your position at work?"' },
  { question: 'Warum möchten Sie in Deutschland arbeiten?', note: 'German for "Why do you want to work in Germany?"' },
  { question: 'What is your German language level?', note: '' },
  { question: "What will you do in Germany if you don't know the language well?", note: '' },
  { question: 'Have you completed all 4 parts of the B1 exam?', note: "Only relevant if you've studied German." },

  // Documents / financial
  { question: 'Do you have a ZAB (foreign qualification recognition)?', note: '' },
  { question: 'When did you block your money (blocked account)?', note: '' },

  // Travel & stay plan
  { question: 'What is your intended travel date?', note: '' },
  { question: 'Where will you stay in Germany?', note: '' },
  { question: 'Have you stayed in Germany before?', note: '' },
  { question: 'What would you like to do after arriving in Germany?', note: '' },
  { question: 'Do you have a hotel booking? Will you stay in a hotel initially?', note: '' },
  { question: 'What will you do right after arriving?', note: '' },

  // General advice
  {
    question: 'General advice for your interview',
    note: "Be very familiar with all your documents and present them carefully. Know your educational and professional background clearly. Answer confidently, honestly, and keep answers short and precise — avoid over-explaining. Be well prepared to explain why you want to go to Germany, especially with significant work experience. Be very careful when naming reference persons — they will be fully verified. Prepare your career plan and goals clearly, and stay polite and confident throughout. Stay sharply focused on exactly what's being asked; your documents represent you, so over-explaining can work against you.",
  },
];
