import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="app-topbar">
      <div>
        <div className="app-page-title">{title}</div>
        {subtitle && <div className="app-page-subtitle">{subtitle}</div>}
      </div>
      {actions && <div className="app-topbar-actions">{actions}</div>}
    </div>
  );
}
