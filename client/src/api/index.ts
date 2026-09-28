import { api } from './client';
import type { AdminUser, Pagination, Role, Stats, Status, Ticket, TicketQuery, User } from '../lib/types';

interface AuthResponse { token: string; user: User }
interface TicketList { tickets: Ticket[]; pagination: Pagination }
export interface TicketInput {
  title: string;
  description: string;
  category: string;
  priority: string;
}

// Drop empty filter values so they don't end up as ?status= in the URL
const clean = (q: TicketQuery) => Object.fromEntries(Object.entries(q).filter(([, v]) => v !== '' && v !== undefined));

export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', body).then((r) => r.data),
  login: (body: { email: string; password: string }) => api.post<AuthResponse>('/auth/login', body).then((r) => r.data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<{ user: User }>('/auth/me').then((r) => r.data.user),
};

export const userApi = {
  updateProfile: (name: string) => api.patch<{ user: User }>('/users/me', { name }).then((r) => r.data.user),
  changePassword: (body: { currentPassword: string; newPassword: string }) => api.patch('/users/me/password', body),
};

export const ticketApi = {
  list: (q: TicketQuery) => api.get<TicketList>('/tickets', { params: clean(q) }).then((r) => r.data),
  get: (id: string) => api.get<{ ticket: Ticket }>(`/tickets/${id}`).then((r) => r.data.ticket),
  create: (body: TicketInput) => api.post<{ ticket: Ticket }>('/tickets', body).then((r) => r.data.ticket),
  update: (id: string, body: Partial<TicketInput> & { status?: Status }) =>
    api.patch<{ ticket: Ticket }>(`/tickets/${id}`, body).then((r) => r.data.ticket),
  remove: (id: string) => api.delete(`/tickets/${id}`),
};

export const adminApi = {
  stats: () => api.get<{ stats: Stats }>('/admin/stats').then((r) => r.data.stats),
  tickets: (q: TicketQuery) => api.get<TicketList>('/admin/tickets', { params: clean(q) }).then((r) => r.data),
  updateStatus: (id: string, status: Status) =>
    api.patch<{ ticket: Ticket }>(`/admin/tickets/${id}/status`, { status }).then((r) => r.data.ticket),
  users: () => api.get<{ users: AdminUser[] }>('/admin/users').then((r) => r.data.users),
  updateRole: (id: string, role: Role) => api.patch<{ user: User }>(`/admin/users/${id}/role`, { role }).then((r) => r.data.user),
};
