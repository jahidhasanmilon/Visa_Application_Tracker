import { useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useCustomPages } from '../hooks/useCustomPages';
import { renderSectionBody } from '../utils/richText';

// Renders one admin-added sidebar page (see the "Add page" flow in
// admin/Admins.tsx's ApplicantNavOrderCard) — a simple title + rich-text
// body, looked up by id from the shared meta/customPages doc.
export default function CustomPage() {
  const { id } = useParams<{ id: string }>();
  const pages = useCustomPages();

  if (pages === null) {
    return (
      <>
        <PageHeader title="…" />
        <div className="app-content"><div className="app-empty">Loading…</div></div>
      </>
    );
  }

  const page = pages.find(p => p.id === id);

  if (!page) {
    return (
      <>
        <PageHeader title="Page not found" />
        <div className="app-content">
          <div className="app-card app-card-pad">
            <div className="app-empty">This page no longer exists.</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={page.title} />
      <div className="app-content">
        <div className="app-card app-card-pad">
          <div
            className="app-section-body"
            style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--ink)' }}
            dangerouslySetInnerHTML={{ __html: renderSectionBody(page.body) }}
          />
        </div>
      </div>
    </>
  );
}
