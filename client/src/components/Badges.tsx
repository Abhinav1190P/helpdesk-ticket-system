import type { Priority, Status } from '../lib/types';

const statusStyles: Record<Status, string> = {
  Open: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  'In Progress': 'bg-amber-50 text-amber-800 ring-amber-600/20',
  Resolved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
};

const priorityStyles: Record<Priority, string> = {
  Low: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  Medium: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  High: 'bg-red-50 text-red-700 ring-red-600/20',
};

const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap';

export const StatusBadge = ({ status }: { status: Status }) => (
  <span className={`${base} ${statusStyles[status]}`}>{status}</span>
);

export const PriorityBadge = ({ priority }: { priority: Priority }) => (
  <span className={`${base} ${priorityStyles[priority]}`}>{priority} priority</span>
);
