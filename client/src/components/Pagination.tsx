import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Pagination as P } from '../lib/types';

export function Pagination({ pagination, onChange }: { pagination: P; onChange: (page: number) => void }) {
  const { page, totalPages, total, limit } = pagination;
  if (total <= limit) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <nav className="flex items-center justify-between gap-3 pt-2" aria-label="Pagination">
      <p className="text-sm text-slate-500">
        {from}–{to} of {total}
      </p>
      <div className="flex gap-2">
        <button className="btn-secondary px-3" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="flex items-center px-2 text-sm text-slate-600">
          {page} / {totalPages}
        </span>
        <button className="btn-secondary px-3" disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
