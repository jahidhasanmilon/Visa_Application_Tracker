import type { ReactNode } from 'react';

interface PageHeaderProps {
  // Small colored label above the title (e.g. "ABOUT") — an accent touch,
  // not a heading itself, so the title stays plain ink either way.
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function PageHeader({ eyebrow, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="app-topbar">
      <div className="app-topbar-title">
        {eyebrow && <div className="app-page-eyebrow">{eyebrow}</div>}
        <div className="app-page-title">{title}</div>
        {subtitle && <div className="app-page-subtitle">{subtitle}</div>}
      </div>
      {actions && <div className="app-topbar-actions">{actions}</div>}
    </div>
  );
}
