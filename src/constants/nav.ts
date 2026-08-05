import {
  LayoutDashboard, Briefcase, KanbanSquare, UserCircle, CheckSquare, Milestone, Mail, BarChart3,
  BookOpen, ShieldCheck, HelpCircle, LifeBuoy, Info, Compass,
} from 'lucide-react';

export const ADMIN_NAV = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/applications', label: 'Applications', icon: Briefcase },
  { to: '/app/tracker', label: 'Tracker', icon: KanbanSquare },
  { to: '/app/checklist', label: 'Checklist', icon: CheckSquare },
  { to: '/app/roadmap', label: 'Road to Success', icon: Milestone },
  { to: '/app/viva-questions', label: 'Viva Questions', icon: HelpCircle },
  { to: '/app/reminder-email', label: 'Reminder Email', icon: Mail },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/app/guides', label: 'Guides & Resources', icon: BookOpen },
  { to: '/app/help', label: 'Help', icon: LifeBuoy },
  { to: '/app/about', label: 'About', icon: Info },
  { to: '/app/admins', label: 'Admins', icon: ShieldCheck },
  { to: '/app/profile', label: 'Profile', icon: UserCircle },
];

// Exported so the Admins page can offer these as the reorderable list.
export const APPLICANT_NAV = [
  { to: '/app/dashboard', label: 'My Status', icon: LayoutDashboard },
  { to: '/app/checklist', label: 'Checklist', icon: CheckSquare },
  { to: '/app/viva-questions', label: 'Viva Questions', icon: HelpCircle },
  { to: '/app/guides', label: 'Guides & Resources', icon: BookOpen },
  { to: '/app/how-to-use', label: 'How to Use', icon: Compass },
  { to: '/app/help', label: 'Help', icon: LifeBuoy },
  { to: '/app/about', label: 'About', icon: Info },
  { to: '/app/profile', label: 'Profile', icon: UserCircle },
];
