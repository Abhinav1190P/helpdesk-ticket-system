import { Search, X } from 'lucide-react';
import { CATEGORIES, PRIORITIES, STATUSES, type TicketQuery } from '../lib/types';

interface Props {
  search: string;
  onSearch: (v: string) => void;
  filters: TicketQuery;
  onChange: (patch: Partial<TicketQuery>) => void;
  showCategory?: boolean;
}

export function TicketFilters({ search, onSearch, filters, onChange, showCategory = true }: Props) {
  const hasFilters = !!(search || filters.status || filters.priority || filters.category);

  return (
    <div className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
      <label className="relative sm:col-span-2 lg:col-span-1">
        <span className="sr-only">Search by title</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-9"
          placeholder="Search by title…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </label>

      <Select label="Status" value={filters.status ?? ''} options={STATUSES} onChange={(v) => onChange({ status: v as TicketQuery['status'] })} />
      <Select label="Priority" value={filters.priority ?? ''} options={PRIORITIES} onChange={(v) => onChange({ priority: v as TicketQuery['priority'] })} />
      {showCategory && (
        <Select label="Category" value={filters.category ?? ''} options={CATEGORIES} onChange={(v) => onChange({ category: v as TicketQuery['category'] })} />
      )}
      <label>
        <span className="sr-only">Sort</span>
        <select className="input" value={filters.sort ?? 'newest'} onChange={(e) => onChange({ sort: e.target.value as TicketQuery['sort'] })}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="updated">Recently updated</option>
        </select>
      </label>

      <button
        className="btn-secondary"
        disabled={!hasFilters}
        onClick={() => {
          onSearch('');
          onChange({ status: '', priority: '', category: '' });
        }}
      >
        <X className="h-4 w-4" /> Clear
      </button>
    </div>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (v: string) => void }) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">All {label.toLowerCase()}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
