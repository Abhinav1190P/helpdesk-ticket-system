import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ticketApi } from '../api';
import { getErrorMessage } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import { STATUSES, type Status, type TicketOwner } from '../lib/types';
import { formatDate } from '../lib/format';
import { PriorityBadge, StatusBadge } from '../components/Badges';
import { ErrorState, PageLoader, Spinner } from '../components/Feedback';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { TicketForm } from '../components/TicketForm';

export function TicketDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: ticket, loading, error, reload, setData } = useAsync(() => ticketApi.get(id), [id]);

  const [editing, setEditing] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<Status | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (loading && !ticket) return <PageLoader label="Loading ticket…" />;
  if (error || !ticket) return <ErrorState message={error ?? 'Ticket not found'} onRetry={reload} />;

  const owner = typeof ticket.createdBy === 'object' ? (ticket.createdBy as TicketOwner) : null;
  const backTo = user?.role === 'admin' ? '/admin' : '/tickets';

  const changeStatus = async (status: Status) => {
    if (status === ticket.status) return;
    setPendingStatus(status);
    try {
      setData(await ticketApi.update(ticket.id, { status }));
      toast.success(`Status changed to ${status}`);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Could not update status'));
    } finally {
      setPendingStatus(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await ticketApi.remove(ticket.id);
      toast.success('Ticket deleted');
      navigate(backTo, { replace: true });
    } catch (e) {
      toast.error(getErrorMessage(e, 'Could not delete ticket'));
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link to={backTo} className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      {editing ? (
        <>
          <h1 className="mb-4 text-2xl font-bold text-slate-900">Edit ticket</h1>
          <TicketForm
            defaultValues={ticket}
            submitLabel="Save changes"
            onCancel={() => setEditing(false)}
            onSubmit={async (values) => {
              try {
                setData(await ticketApi.update(ticket.id, values));
                toast.success('Ticket updated');
                setEditing(false);
              } catch (e) {
                toast.error(getErrorMessage(e, 'Could not update ticket'));
              }
            }}
          />
        </>
      ) : (
        <article className="card overflow-hidden">
          <header className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {ticket.category}
              </span>
            </div>
            <h1 className="mt-3 text-xl font-bold break-words text-slate-900 sm:text-2xl">{ticket.title}</h1>
            <p className="mt-1 text-xs text-slate-400">#{ticket.id.slice(-8).toUpperCase()}</p>
          </header>

          <div className="p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-slate-700">Description</h2>
            <p className="mt-2 text-sm leading-relaxed break-words whitespace-pre-wrap text-slate-600">{ticket.description}</p>

            <dl className="mt-6 grid gap-4 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-3">
              {owner && (
                <div>
                  <dt className="text-slate-500">Raised by</dt>
                  <dd className="font-medium text-slate-800">{owner.name}</dd>
                  <dd className="truncate text-xs text-slate-500">{owner.email}</dd>
                </div>
              )}
              <div>
                <dt className="text-slate-500">Created</dt>
                <dd className="font-medium text-slate-800">{formatDate(ticket.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Last updated</dt>
                <dd className="font-medium text-slate-800">{formatDate(ticket.updatedAt)}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <h2 id="status-label" className="text-sm font-semibold text-slate-700">Update status</h2>
              <div role="radiogroup" aria-labelledby="status-label" className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {STATUSES.map((s) => {
                  const active = ticket.status === s;
                  return (
                    <button
                      key={s}
                      role="radio"
                      aria-checked={active}
                      disabled={!!pendingStatus}
                      onClick={() => changeStatus(s)}
                      className={`btn border ${active ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                      {pendingStatus === s && <Spinner className="h-4 w-4" />} {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 p-4 sm:flex-row sm:justify-end sm:px-6">
            <button className="btn border border-red-200 bg-white text-red-600 hover:bg-red-50" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-4 w-4" /> Delete
            </button>
            <button className="btn-primary" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" /> Edit
            </button>
          </footer>
        </article>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this ticket?"
        message="This permanently removes the ticket. This action cannot be undone."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
