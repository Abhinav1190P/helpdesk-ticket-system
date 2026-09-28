import { Link } from 'react-router-dom';
import { CheckCircle2, CircleDot, Layers, Timer } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState, type ReactNode } from 'react';
import { adminApi } from '../api';
import { getErrorMessage } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { useTicketQuery } from '../hooks/useTicketQuery';
import { PRIORITIES, STATUSES, type Status, type Ticket, type TicketOwner } from '../lib/types';
import { timeAgo } from '../lib/format';
import { PageHeader } from '../components/PageHeader';
import { TicketFilters } from '../components/TicketFilters';
import { Pagination } from '../components/Pagination';
import { PriorityBadge, StatusBadge } from '../components/Badges';
import { EmptyState, ErrorState, ListSkeleton } from '../components/Feedback';

export function AdminDashboardPage() {
  const stats = useAsync(() => adminApi.stats(), []);
  const { query, update, search, setSearch } = useTicketQuery(15);
  const list = useAsync(() => adminApi.tickets(query), [query]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const changeStatus = async (ticket: Ticket, status: Status) => {
    setUpdatingId(ticket.id);
    try {
      const updated = await adminApi.updateStatus(ticket.id, status);
      list.setData((prev) => prev && { ...prev, tickets: prev.tickets.map((t) => (t.id === updated.id ? updated : t)) });
      void stats.reload();
      toast.success(`“${ticket.title}” → ${status}`);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Could not update status'));
    } finally {
      setUpdatingId(null);
    }
  };

  const s = stats.data;

  return (
    <>
      <PageHeader title="Admin dashboard" subtitle="Overview of every ticket in the system" />

      {/* ---- Stats ---- */}
      {stats.error ? (
        <ErrorState message={stats.error} onRetry={stats.reload} />
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total tickets" value={s?.total} icon={<Layers />} tone="bg-indigo-50 text-indigo-600" onClick={() => update({ status: '' })} />
          <StatCard label="Open" value={s?.byStatus.Open} icon={<CircleDot />} tone="bg-sky-50 text-sky-600" onClick={() => update({ status: 'Open' })} />
          <StatCard label="In progress" value={s?.byStatus['In Progress']} icon={<Timer />} tone="bg-amber-50 text-amber-600" onClick={() => update({ status: 'In Progress' })} />
          <StatCard label="Resolved" value={s?.byStatus.Resolved} icon={<CheckCircle2 />} tone="bg-emerald-50 text-emerald-600" onClick={() => update({ status: 'Resolved' })} />
        </div>
      )}

      {s && s.total > 0 && (
        <div className="card mt-3 p-4">
          <p className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">By priority</p>
          <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100" role="img" aria-label={PRIORITIES.map((p) => `${p}: ${s.byPriority[p]}`).join(', ')}>
            {PRIORITIES.map((p) => (
              <div key={p} style={{ width: `${(s.byPriority[p] / s.total) * 100}%` }} className={{ Low: 'bg-slate-400', Medium: 'bg-violet-500', High: 'bg-red-500' }[p]} />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600">
            {PRIORITIES.map((p) => (
              <span key={p} className="inline-flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${{ Low: 'bg-slate-400', Medium: 'bg-violet-500', High: 'bg-red-500' }[p]}`} />
                {p}: <strong>{s.byPriority[p]}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ---- Tickets ---- */}
      <h2 className="mt-8 mb-3 text-lg font-semibold text-slate-900">All tickets</h2>
      <TicketFilters search={search} onSearch={setSearch} filters={query} onChange={update} />

      <section className="mt-4" aria-live="polite" aria-busy={list.loading}>
        {list.loading && !list.data ? (
          <ListSkeleton />
        ) : list.error ? (
          <ErrorState message={list.error} onRetry={list.reload} />
        ) : !list.data?.tickets.length ? (
          <EmptyState title="No tickets found" description="No tickets match the current filters." />
        ) : (
          <div className={`transition-opacity ${list.loading ? 'opacity-60' : ''}`}>
            {/* Table on larger screens */}
            <div className="card hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Ticket</th>
                    <th className="px-4 py-3 font-medium">Raised by</th>
                    <th className="px-4 py-3 font-medium">Priority</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {list.data.tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70">
                      <td className="max-w-xs px-4 py-3">
                        <Link to={`/tickets/${t.id}`} className="block truncate font-medium text-slate-900 hover:text-indigo-600">{t.title}</Link>
                        <span className="text-xs text-slate-500">{t.category}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{(t.createdBy as TicketOwner)?.name ?? '—'}</td>
                      <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">{timeAgo(t.createdAt)}</td>
                      <td className="px-4 py-3"><StatusSelect ticket={t} busy={updatingId === t.id} onChange={changeStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards on mobile */}
            <ul className="space-y-3 md:hidden">
              {list.data.tickets.map((t) => (
                <li key={t.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link to={`/tickets/${t.id}`} className="min-w-0 font-medium text-slate-900 hover:text-indigo-600">
                      <span className="line-clamp-2">{t.title}</span>
                    </Link>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {(t.createdBy as TicketOwner)?.name} · {t.category} · {timeAgo(t.createdAt)}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <PriorityBadge priority={t.priority} />
                    <StatusSelect ticket={t} busy={updatingId === t.id} onChange={changeStatus} />
                  </div>
                </li>
              ))}
            </ul>

            <Pagination pagination={list.data.pagination} onChange={(page) => update({ page })} />
          </div>
        )}
      </section>
    </>
  );
}

function StatCard({ label, value, icon, tone, onClick }: { label: string; value?: number; icon: ReactNode; tone: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="card flex items-center gap-3 p-4 text-left transition hover:border-indigo-300 hover:shadow-md sm:p-5">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg [&>svg]:h-5 [&>svg]:w-5 ${tone}`}>{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-medium text-slate-500 sm:text-sm">{label}</span>
        {value === undefined ? (
          <span className="mt-1 block h-6 w-10 animate-pulse rounded bg-slate-200" />
        ) : (
          <span className="block text-2xl font-bold text-slate-900 tabular-nums">{value}</span>
        )}
      </span>
    </button>
  );
}

function StatusSelect({ ticket, busy, onChange }: { ticket: Ticket; busy: boolean; onChange: (t: Ticket, s: Status) => void }) {
  return (
    <label>
      <span className="sr-only">Status for {ticket.title}</span>
      <select
        className="input w-36 py-1.5"
        value={ticket.status}
        disabled={busy}
        onChange={(e) => onChange(ticket, e.target.value as Status)}
      >
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </label>
  );
}
