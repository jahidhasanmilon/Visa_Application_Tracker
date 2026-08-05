import {
  LayoutDashboard, Briefcase, KanbanSquare, UserCircle, CheckSquare, Milestone, Mail, BarChart3,
  BookOpen, ShieldCheck, HelpCircle, LifeBuoy, Info, Compass,
} from 'lucide-react';

export type NavSection = 'main' | 'account' | 'support';

export const ADMIN_NAV = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/applications', label: 'Applications', icon: Briefcase },
  { to: '/app/tracker', label: 'Tracker', icon: KanbanSquare },
  { to: '/app/checklist', label: 'Checklist', icon: CheckSquare },
  { to: '/app/roadmap', label: 'Road to Success', icon: Milestone },
  { to: '/app/viva-questions', label: 'Interview Questions', icon: HelpCircle },
  { to: '/app/reminder-email', label: 'Reminder Email', icon: Mail },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/app/guides', label: 'Guides & Resources', icon: BookOpen },
  { to: '/app/help', label: 'Help & Supports', icon: LifeBuoy },
  { to: '/app/about', label: 'About', icon: Info },
  { to: '/app/admins', label: 'Admins', icon: ShieldCheck },
  { to: '/app/profile', label: 'Profile', icon: UserCircle },
];

// Exported so the Admins page can offer these as the reorderable list.
// Grouped into Main / Account / Support sections in the sidebar (see
// AppShell.tsx) — `section` here decides which group each item renders
// under; relative order within a group still follows admin's saved order.
export const APPLICANT_NAV = [
  { to: '/app/dashboard', label: 'My Status', icon: LayoutDashboard, section: 'main' as NavSection },
  { to: '/app/checklist', label: 'Checklist', icon: CheckSquare, section: 'main' as NavSection },
  { to: '/app/guides', label: 'Guides & Resources', icon: BookOpen, section: 'main' as NavSection },
  { to: '/app/viva-questions', label: 'Interview Questions', icon: HelpCircle, section: 'main' as NavSection },
  { to: '/app/profile', label: 'Profile', icon: UserCircle, section: 'account' as NavSection },
  { to: '/app/about', label: 'About', icon: Info, section: 'support' as NavSection },
  { to: '/app/how-to-use', label: 'How to Use', icon: Compass, section: 'support' as NavSection },
  { to: '/app/help', label: 'Help & Supports', icon: LifeBuoy, section: 'support' as NavSection },
];

// Maps each nav item's route to its i18n key, since ADMIN_NAV/APPLICANT_NAV
// labels above are used as-is elsewhere (e.g. Admins reorder page).
export const NAV_LABEL_KEYS: Record<string, string> = {
  '/app/dashboard': 'nav.dashboard',
  '/app/applications': 'nav.applications',
  '/app/tracker': 'nav.tracker',
  '/app/checklist': 'nav.checklist',
  '/app/roadmap': 'nav.roadmap',
  '/app/viva-questions': 'nav.vivaQuestions',
  '/app/reminder-email': 'nav.reminderEmail',
  '/app/analytics': 'nav.analytics',
  '/app/guides': 'nav.guides',
  '/app/help': 'nav.help',
  '/app/about': 'nav.about',
  '/app/admins': 'nav.admins',
  '/app/profile': 'nav.profile',
  '/app/how-to-use': 'nav.howToUse',
};

export const NAV_SECTION_KEYS: Record<NavSection, string> = {
  main: 'nav.section.main',
  account: 'nav.section.account',
  support: 'nav.section.support',
};
