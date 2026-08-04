import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import ApplicantModal from '../../components/ApplicantModal';
import { KanbanSkeleton } from '../../components/Skeleton';
import { useApplicants } from '../../hooks/useApplicants';
import { useStatusOptions } from '../../hooks/useStatusOptions';
import { getStatusMeta } from '../../constants/status';
import { updateApplicant } from '../../services/applicantsService';
import type { Applicant, ApplicantFormData, EnrichedApplicant } from '../../types';

export default function AdminTracker() {
  const { enriched, loading } = useApplicants();
  const { statusOptions, addStatus } = useStatusOptions();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState<Applicant | null>(null);
  const [form, setForm] = useState<ApplicantFormData | null>(null);

  function openCard(a: EnrichedApplicant) {
    setForm({
      serialNo: a.serialNo, name: a.name, email: a.email, status: a.status,
      created: a.created, submitted: a.submitted, notes: a.notes,
      lastUpdated: a.lastUpdated, reminderMailSent: a.reminderMailSent,
    });
    setEditingApplicant(a);
    setModalOpen(true);
  }

  async function saveForm() {
    if (!form || !editingApplicant) return;
    if (!form.name.trim() || !form.serialNo.trim()) return;
    await updateApplicant(editingApplicant.id, form);
    setModalOpen(false);
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Tracker" subtitle="Every applicant, grouped by stage. Click a card to update it." />
        <KanbanSkeleton />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Tracker" subtitle="Every applicant, grouped by stage. Click a card to update it." />
      <div className="app-content">
        <div className="app-kanban">
          {statusOptions.map(status => {
            const meta = getStatusMeta(status);
            const Icon = meta.icon;
            const cards = enriched.filter(a => a.status === status);
            return (
              <div className="app-kanban-col" key={status}>
                <div className="app-kanban-col-head">
                  <div className="app-kanban-col-title" style={{ color: meta.color }}>
                    <Icon size={14} /> {status}
                  </div>
                  <span className="app-kanban-count">{cards.length}</span>
                </div>
                {cards.length === 0 ? (
                  <div className="app-kanban-empty">Empty</div>
                ) : (
                  cards.map(a => (
                    <div className="app-kanban-card" key={a.id} onClick={() => openCard(a)}>
                      <div className="app-kanban-card-name">{a.name}</div>
                      <div className="app-kanban-card-meta app-mono">{a.serialNo}</div>
                      <div className="app-kanban-card-meta">
                        <span className="app-dot" style={{ background: a.urg.color }} />
                        {a.remaining === null ? 'Not submitted' : a.remaining > 0 ? `${a.remaining}d left (est.)` : `${Math.abs(a.remaining)}d overdue`}
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>

      {form && (
        <ApplicantModal
          open={modalOpen}
          isEditing
          form={form}
          setForm={setForm}
          onSave={saveForm}
          onClose={() => setModalOpen(false)}
          statusOptions={statusOptions}
          onAddStatus={addStatus}
        />
      )}
    </>
  );
}
