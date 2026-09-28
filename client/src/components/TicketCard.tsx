import { Link } from 'react-router-dom';
import { Clock, Tag } from 'lucide-react';
import type { Ticket } from '../lib/types';
import { timeAgo } from '../lib/format';
import { PriorityBadge, StatusBadge } from './Badges';

export function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="card block p-5 transition hover:border-indigo-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-indigo-600"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900">{ticket.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{ticket.description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Tag className="h-3.5 w-3.5" /> {ticket.category}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> Created {timeAgo(ticket.createdAt)}
        </span>
        {ticket.updatedAt !== ticket.createdAt && <span>Updated {timeAgo(ticket.updatedAt)}</span>}
      </div>
    </Link>
  );
}
