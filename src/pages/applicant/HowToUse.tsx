import PageHeader from '../../components/PageHeader';

const SECTIONS = [
  {
    heading: '1. My Status',
    body: 'Your dashboard shows your progress. Tap a step on the roadmap once you\'ve completed it — your status badge updates automatically to match the furthest step you\'ve finished. There\'s no separate "status" to set.',
  },
  {
    heading: '2. Edit my details',
    body: 'Use "Edit my details" (on your dashboard or Profile) to keep your name, applied date, and submitted date accurate. These drive your waiting-time estimate, so keep them current.',
  },
  {
    heading: '3. Checklist',
    body: 'A to-do list of documents and steps to prepare. Tap an item to mark it done — this is your own personal checklist, separate from the roadmap.',
  },
  {
    heading: '4. Application Reminder (30-Day)',
    body: 'A simple nudge so you don\'t forget to follow up with the embassy. Mark it "Done" after you\'ve checked in — it resets automatically, counting down again from today.',
  },
  {
    heading: '5. Guides & Resources',
    body: 'Step-by-step write-ups on applying for the visa, understanding the checklist, and applying for jobs — organized by category. No login needed to browse them.',
  },
  {
    heading: '6. Viva Questions',
    body: 'Common interview questions with notes on how to approach them — worth reviewing before your embassy appointment.',
  },
];

export default function HowToUse() {
  return (
    <>
      <PageHeader title="How to Use This App" subtitle="A quick tour of everything on your dashboard." />
      <div className="app-content">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {SECTIONS.map(s => (
            <div key={s.heading} className="app-card app-card-pad">
              <div className="app-card-title" style={{ marginBottom: 6 }}>{s.heading}</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--muted)' }}>{s.body}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
