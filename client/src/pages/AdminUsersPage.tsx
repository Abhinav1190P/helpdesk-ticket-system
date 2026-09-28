import { useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../api';
import { getErrorMessage } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../lib/types';
import { formatDate } from '../lib/format';
import { PageHeader } from '../components/PageHeader';
import { EmptyState, ErrorState, ListSkeleton } from '../components/Feedback';

export function AdminUsersPage() {
  const { user: me } = useAuth();
  const { data: users, loading, error, reload, setData } = useAsync(() => adminApi.users(), []);
  const [busyId, setBusyId] = useState<string | null>(null);

  const changeRole = async (id: string, role: Role) => {
    setBusyId(id);
    try {
      const updated = await adminApi.updateRole(id, role);
      setData((prev) => prev?.map((u) => (u.id === id ? { ...u, role: updated.role } : u)) ?? null);
      toast.success(`${updated.name} is now ${role === 'admin' ? 'an admin' : 'a user'}`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader title="Users" subtitle="Manage accounts and admin access" />
      {loading && !users ? (
        <ListSkeleton rows={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !users?.length ? (
        <EmptyState title="No users yet" />
      ) : (
        <ul className="card divide-y divide-slate-100">
          {users.map((u) => (
            <li key={u.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                  {u.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {u.name} {u.id === me?.id && <span className="text-xs text-slate-400">(you)</span>}
                  </p>
                  <p className="truncate text-sm text-slate-500">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500 sm:gap-6">
                <span>{u.ticketCount} tickets</span>
                <span className="hidden lg:inline">Joined {formatDate(u.createdAt)}</span>
                <label>
                  <span className="sr-only">Role for {u.name}</span>
                  <select
                    className="input w-28 py-1.5"
                    value={u.role}
                    disabled={u.id === me?.id || busyId === u.id}
                    onChange={(e) => changeRole(u.id, e.target.value as Role)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
