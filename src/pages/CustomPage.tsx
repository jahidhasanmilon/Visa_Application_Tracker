import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import CustomSectionForm from '../components/CustomSectionForm';
import FlightLoader from '../components/FlightLoader';
import { useCustomPages } from '../hooks/useCustomPages';
import { useApplicantNavOrder } from '../hooks/useNavOrder';
import { saveCustomPages } from '../services/customPagesService';
import { saveApplicantNavOrder } from '../services/navOrderService';
import { renderSectionBody } from '../utils/richText';
import type { AppRole } from '../constants/roles';

interface CustomPageProps {
  role: AppRole;
}

// Renders one admin-added sidebar page (see the "Add page" flow in
// admin/Admins.tsx's ApplicantNavOrderCard) — a simple title + rich-text
// body, looked up by id from the shared meta/customPages doc. Admin also
// gets Edit/Remove right here, not just from the Admins settings page.
export default function CustomPage({ role }: CustomPageProps) {
  const isAdmin = role === 'admin';
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pages = useCustomPages();
  const navOrder = useApplicantNavOrder();

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  if (pages === null) {
    return (
      <>
        <PageHeader title="…" />
        <div className="app-content"><FlightLoader /></div>
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

  function startEdit() {
    setTitle(page!.title);
    setBody(page!.body);
    setEditing(true);
  }

  async function saveEdit() {
    const trimmed = title.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await saveCustomPages(pages!.map(p => p.id === page!.id ? { ...p, title: trimmed, body } : p));
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm('Remove this page from the sidebar? This deletes its content too.')) return;
    await saveCustomPages(pages!.filter(p => p.id !== page!.id));
    if (navOrder) {
      await saveApplicantNavOrder(navOrder.filter(to => to !== `/app/pages/${page!.id}`));
    }
    navigate('/app/dashboard', { replace: true });
  }

  return (
    <>
      <PageHeader
        title={page.title}
        actions={isAdmin && !editing ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="app-btn app-btn-ghost app-btn-sm" onClick={startEdit}><Pencil size={14} /> Edit</button>
            <button className="app-btn app-btn-ghost app-btn-sm" onClick={remove}><Trash2 size={14} /> Remove</button>
          </div>
        ) : undefined}
      />
      <div className="app-content">
        {editing ? (
          <CustomSectionForm
            title={title}
            body={body}
            onTitleChange={setTitle}
            onBodyChange={setBody}
            onSave={saveEdit}
            onCancel={() => setEditing(false)}
            saving={saving}
            titlePlaceholder="Page title"
          />
        ) : (
          <div className="app-card app-card-pad">
            <div
              className="app-section-body"
              style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--ink)' }}
              dangerouslySetInnerHTML={{ __html: renderSectionBody(page.body) }}
            />
          </div>
        )}
      </div>
    </>
  );
}
