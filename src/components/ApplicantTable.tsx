import ApplicantRow from './ApplicantRow';
import type { EnrichedApplicant } from '../types';

interface ApplicantTableProps {
  applicants: EnrichedApplicant[];
  onEdit: (a: EnrichedApplicant) => void;
  onDelete: (id: string) => void;
  confirmDeleteId: string | null;
  onAskDelete: (id: string) => void;
  onCancelDelete: () => void;
}

export default function ApplicantTable({
  applicants, onEdit, onDelete, confirmDeleteId, onAskDelete, onCancelDelete,
}: ApplicantTableProps) {
  if (applicants.length === 0) {
    return <div className="app-empty">No applicants match your filters.</div>;
  }

  return (
    <div className="app-table-wrap">
      <table className="app-table">
        <thead>
          <tr>
            <th>Serial No</th>
            <th>Name</th>
            <th>Status</th>
            <th>Created</th>
            <th>Submitted</th>
            <th>Waiting</th>
            <th title="Estimated using a 365-day target processing window">Remaining (Est.)</th>
            <th>Last Updated</th>
            <th>Application Reminder (30-Day)</th>
            <th>Notes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {applicants.map(a => (
            <ApplicantRow
              key={a.id}
              applicant={a}
              onEdit={onEdit}
              onDelete={onDelete}
              confirmingDelete={confirmDeleteId === a.id}
              onAskDelete={onAskDelete}
              onCancelDelete={onCancelDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
