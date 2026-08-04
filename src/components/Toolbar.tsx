import { Search, Plus } from 'lucide-react';
import type { StatusOption } from '../types';

interface ToolbarProps {
  search: string;
  setSearch: (v: string) => void;
  statusFilter: StatusOption | 'All';
  setStatusFilter: (v: StatusOption | 'All') => void;
  statusOptions: string[];
  onAdd: () => void;
}

export default function Toolbar({
  search, setSearch, statusFilter, setStatusFilter, statusOptions, onAdd,
}: ToolbarProps) {
  return (
    <div className="app-toolbar">
      <div className="app-input-wrap">
        <Search size={16} />
        <input
          placeholder="Search by name, email, or serial no."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <select
        className="app-select"
        style={{ width: 'auto' }}
        value={statusFilter}
        onChange={e => setStatusFilter(e.target.value as StatusOption | 'All')}
      >
        <option value="All">All statuses</option>
        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <button className="app-btn app-btn-accent" onClick={onAdd}><Plus size={16} /> Add applicant</button>
    </div>
  );
}
