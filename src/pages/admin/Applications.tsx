import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Toolbar from '../../components/Toolbar';
import ApplicantTable from '../../components/ApplicantTable';
import ApplicantModal from '../../components/ApplicantModal';
import { TableSkeleton } from '../../components/Skeleton';
import { useApplicants } from '../../hooks/useApplicants';
import { useStatusOptions } from '../../hooks/useStatusOptions';
import { todayStr } from '../../utils/dateHelpers';
import { addApplicant, updateApplicant, deleteApplicant } from '../../services/applicantsService';
import { EMPTY_FORM } from '../../data/seedData';
import type { Applicant, ApplicantFormData, StatusOption, EnrichedApplicant } from '../../types';

export default function AdminApplications() {
  const { enriched, loading } = useApplicants();
  const { statusOptions, addStatus } = useStatusOptions();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusOption | 'All'>('All');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState<Applicant | null>(null);
  const [form, setForm] = useState<ApplicantFormData>(EMPTY_FORM);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return enriched.filter(a => {
      const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch = !q
        || a.name.toLowerCase().includes(q)
        || a.email.toLowerCase().includes(q)
        || a.serialNo.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [enriched, search, statusFilter]);

  function openAdd() {
    setForm({ ...EMPTY_FORM, created: todayStr(), lastUpdated: todayStr() });
    setEditingApplicant(null);
    setModalOpen(true);
  }

  function openEdit(a: EnrichedApplicant) {
    setForm({
      serialNo: a.serialNo, name: a.name, email: a.email, status: a.status,
      created: a.created, submitted: a.submitted, notes: a.notes,
      lastUpdated: a.lastUpdated, reminderMailSent: a.reminderMailSent,
    });
    setEditingApplicant(a);
    setModalOpen(true);
  }

  async function saveForm() {
    if (!form.name.trim() || !form.serialNo.trim()) return;
    if (editingApplicant) {
      await updateApplicant(editingApplicant.id, form);
    } else {
      await addApplicant(form);
    }
    setModalOpen(false);
  }

  async function doDelete(id: string) {
    await deleteApplicant(id);
    setConfirmDeleteId(null);
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Applications" subtitle="Loading…" />
        <TableSkeleton />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Applications" subtitle={`${enriched.length} applicant${enriched.length === 1 ? '' : 's'} on file.`} />
      <div className="app-content">
        <div className="app-card app-card-pad">
          <Toolbar
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            statusOptions={statusOptions}
            onAdd={openAdd}
          />
          <ApplicantTable
            applicants={filtered}
            onEdit={openEdit}
            onDelete={doDelete}
            confirmDeleteId={confirmDeleteId}
            onAskDelete={setConfirmDeleteId}
            onCancelDelete={() => setConfirmDeleteId(null)}
          />
        </div>
      </div>

      <ApplicantModal
        open={modalOpen}
        isEditing={!!editingApplicant}
        form={form}
        setForm={setForm}
        onSave={saveForm}
        onClose={() => setModalOpen(false)}
        statusOptions={statusOptions}
        onAddStatus={addStatus}
      />
    </>
  );
}
