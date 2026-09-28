import { AlertTriangle, Inbox, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

export const Spinner = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <Loader2 className={`animate-spin ${className}`} aria-hidden />
);

export const PageLoader = ({ label = 'Loading…' }: { label?: string }) => (
  <div role="status" className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-500">
    <Spinner className="h-8 w-8 text-indigo-600" />
    <span className="text-sm">{label}</span>
  </div>
);

export const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div role="alert" className="card flex flex-col items-center gap-3 p-8 text-center">
    <AlertTriangle className="h-8 w-8 text-red-500" aria-hidden />
    <p className="text-sm text-slate-600">{message}</p>
    {onRetry && (
      <button className="btn-secondary" onClick={onRetry}>
        Try again
      </button>
    )}
  </div>
);

export const EmptyState = ({ title, description, action }: { title: string; description?: string; action?: ReactNode }) => (
  <div className="card flex flex-col items-center gap-2 p-10 text-center">
    <Inbox className="h-10 w-10 text-slate-300" aria-hidden />
    <h3 className="font-semibold text-slate-700">{title}</h3>
    {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
    {action && <div className="mt-3">{action}</div>}
  </div>
);

/** Skeleton rows shown while a list is loading */
export const ListSkeleton = ({ rows = 4 }: { rows?: number }) => (
  <div className="space-y-3" aria-hidden>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="card animate-pulse p-5">
        <div className="h-4 w-1/3 rounded bg-slate-200" />
        <div className="mt-3 h-3 w-2/3 rounded bg-slate-100" />
      </div>
    ))}
  </div>
);
